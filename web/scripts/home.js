import { api } from "./api.js";

const form = document.getElementById("entryForm");
const entryText = document.getElementById("entryText");
const bucketSelect = document.getElementById("bucketSelect");
const categoryInput = document.getElementById("categoryInput");
const timeline = document.getElementById("timeline");
const bucketFilters = document.getElementById("bucketFilters");
const statusMessage = document.getElementById("statusMessage");
const voiceButton = document.getElementById("voiceButton");
const seedButton = document.getElementById("seedButton");
const timelineHint = document.getElementById("timelineHint");

const statWeek = document.getElementById("statWeek");
const statCategories = document.getElementById("statCategories");
const statTopBucket = document.getElementById("statTopBucket");

let activeFilter = "all";
let recognition = null;
let listening = false;

init();

function init() {
  renderBucketSelect();
  renderBucketFilters();
  attachEvents();
  syncClassificationPreview();
  render();
  setupSpeechRecognition();
}

function attachEvents() {
  entryText.addEventListener("input", syncClassificationPreview);
  form.addEventListener("submit", handleSubmit);
  seedButton.addEventListener("click", () => {
    api.seedDemoEntries();
    render();
    setStatus("Demo entries loaded.");
  });
}

function renderBucketSelect() {
  bucketSelect.innerHTML = api.buckets
    .map((bucket) => `<option value="${bucket.id}">${bucket.label}</option>`)
    .join("");
}

function renderBucketFilters() {
  const buttons = [
    '<button class="filter-chip is-active" data-filter="all" type="button">All</button>',
    ...api.buckets.map(
      (bucket) => `<button class="filter-chip" data-filter="${bucket.id}" type="button">${bucket.label}</button>`
    ),
  ];
  bucketFilters.innerHTML = buttons.join("");

  bucketFilters.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter || "all";
      bucketFilters.querySelectorAll("[data-filter]").forEach((candidate) => {
        candidate.classList.toggle("is-active", candidate === button);
      });
      render();
    });
  });
}

function syncClassificationPreview() {
  const text = entryText.value.trim();
  if (!text) {
    bucketSelect.value = api.buckets[0].id;
    categoryInput.value = "";
    return;
  }

  const classification = api.classifyText(text);
  bucketSelect.value = classification.bucket;
  if (!categoryInput.matches(":focus")) {
    categoryInput.value = classification.category;
  }
}

function handleSubmit(event) {
  event.preventDefault();
  const text = entryText.value.trim();
  const category = categoryInput.value.trim();

  if (!text) {
    setStatus("Add a life update before saving.");
    return;
  }

  api.saveEntry({
    text,
    bucket: bucketSelect.value,
    category: category || api.classifyText(text).category,
  });

  form.reset();
  syncClassificationPreview();
  render();
  setStatus("Life update saved.");
}

function render() {
  const allEntries = api.getEntries();
  const entries = activeFilter === "all" ? allEntries : allEntries.filter((entry) => entry.bucket === activeFilter);

  renderStats(allEntries);
  renderTimeline(entries);
  timelineHint.textContent =
    activeFilter === "all"
      ? "All saved entries."
      : `Showing ${entries.length} ${labelForBucket(activeFilter).toLowerCase()} entries.`;
}

function renderStats(entries) {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weekEntries = entries.filter((entry) => new Date(entry.createdAt).getTime() >= weekAgo);
  const categories = new Set(entries.map((entry) => `${entry.bucket}:${entry.category}`));
  const topBucket = api.buckets
    .map((bucket) => ({
      label: bucket.label,
      count: entries.filter((entry) => entry.bucket === bucket.id).length,
    }))
    .sort((a, b) => b.count - a.count)[0];

  statWeek.textContent = String(weekEntries.length);
  statCategories.textContent = String(categories.size);
  statTopBucket.textContent = topBucket && topBucket.count ? topBucket.label : "None yet";
}

function renderTimeline(entries) {
  if (!entries.length) {
    timeline.innerHTML = `
      <article class="timeline-empty">
        <h3>No entries yet</h3>
        <p>Start with a quick voice note or load the demo data to see the workflow.</p>
      </article>
    `;
    return;
  }

  timeline.innerHTML = entries
    .map(
      (entry) => `
        <article class="timeline-card">
          <div class="timeline-card__meta">
            <span class="pill">${labelForBucket(entry.bucket)}</span>
            <span>${entry.category}</span>
            <span>${formatDate(entry.createdAt)}</span>
          </div>
          <p>${escapeHtml(entry.text)}</p>
        </article>
      `
    )
    .join("");
}

function setupSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    voiceButton.disabled = true;
    voiceButton.textContent = "Voice unsupported";
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  recognition.addEventListener("result", (event) => {
    const transcript = Array.from(event.results)
      .map((result) => result[0]?.transcript || "")
      .join(" ")
      .trim();
    entryText.value = transcript;
    syncClassificationPreview();
  });

  recognition.addEventListener("end", () => {
    listening = false;
    voiceButton.textContent = "Start voice capture";
  });

  recognition.addEventListener("error", () => {
    listening = false;
    voiceButton.textContent = "Start voice capture";
    setStatus("Voice capture failed. Check browser microphone permissions.");
  });

  voiceButton.addEventListener("click", () => {
    if (!recognition) return;
    if (listening) {
      recognition.stop();
      return;
    }

    listening = true;
    voiceButton.textContent = "Stop voice capture";
    recognition.start();
  });
}

function labelForBucket(bucketId) {
  return api.buckets.find((bucket) => bucket.id === bucketId)?.label || "Notes";
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function setStatus(message) {
  statusMessage.textContent = message;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

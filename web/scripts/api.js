const STORAGE_KEY = "lifetracker.entries.v1";

const DEFAULT_BUCKETS = [
  { id: "health", label: "Health", keywords: ["workout", "sleep", "doctor", "run", "gym", "energy", "meal"] },
  { id: "work", label: "Work", keywords: ["meeting", "project", "client", "launch", "deadline", "email", "team"] },
  { id: "finance", label: "Finance", keywords: ["paid", "invoice", "budget", "bill", "rent", "salary", "invest"] },
  { id: "relationships", label: "Relationships", keywords: ["family", "friend", "date", "partner", "call", "mom", "dad"] },
  { id: "growth", label: "Growth", keywords: ["read", "journal", "learned", "course", "practice", "reflect"] },
  { id: "notes", label: "Notes", keywords: ["idea", "remember", "note", "misc", "random"] },
];

function loadEntries() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function classifyText(text) {
  const normalized = text.toLowerCase();
  const bucket = DEFAULT_BUCKETS.find((candidate) =>
    candidate.keywords.some((keyword) => normalized.includes(keyword))
  ) || DEFAULT_BUCKETS[DEFAULT_BUCKETS.length - 1];

  const category = inferCategory(bucket.id, normalized);
  return { bucket: bucket.id, category };
}

function inferCategory(bucketId, text) {
  if (bucketId === "health") {
    if (text.includes("sleep")) return "Sleep";
    if (text.includes("doctor")) return "Medical";
    return "Fitness";
  }
  if (bucketId === "work") {
    if (text.includes("meeting")) return "Meetings";
    if (text.includes("client")) return "Clients";
    return "Execution";
  }
  if (bucketId === "finance") {
    if (text.includes("invest")) return "Investing";
    if (text.includes("budget")) return "Budgeting";
    return "Cash Flow";
  }
  if (bucketId === "relationships") {
    if (text.includes("family") || text.includes("mom") || text.includes("dad")) return "Family";
    return "Personal";
  }
  if (bucketId === "growth") {
    if (text.includes("read") || text.includes("course")) return "Learning";
    return "Reflection";
  }
  return "General Notes";
}

function createEntry({ text, bucket, category }) {
  return {
    id: crypto.randomUUID(),
    text,
    bucket,
    category,
    createdAt: new Date().toISOString(),
  };
}

function seedDemoEntries() {
  const existing = loadEntries();
  if (existing.length) return existing;

  const demo = [
    createEntry({ text: "Had a strong workout and finally hit my step goal.", bucket: "health", category: "Fitness" }),
    createEntry({ text: "Wrapped the client proposal and aligned next steps in the meeting.", bucket: "work", category: "Clients" }),
    createEntry({ text: "Paid the credit card bill and updated my monthly budget.", bucket: "finance", category: "Budgeting" }),
  ];

  saveEntries(demo);
  return demo;
}

export const api = {
  buckets: DEFAULT_BUCKETS,
  classifyText,
  getEntries() {
    return loadEntries().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  saveEntry(payload) {
    const entries = loadEntries();
    const next = createEntry(payload);
    entries.push(next);
    saveEntries(entries);
    return next;
  },
  seedDemoEntries,
};

const DEFAULT_BUCKETS = [
  { id: "health", label: "Health" },
  { id: "work", label: "Work" },
  { id: "finance", label: "Finance" },
  { id: "relationships", label: "Relationships" },
  { id: "growth", label: "Growth" },
  { id: "notes", label: "Notes" },
];

const API_BASE =
  window.location.protocol === "file:"
    ? "http://localhost:4000/api"
    : `${window.location.origin}/api`;

let bucketCache = [...DEFAULT_BUCKETS];

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || `Request failed with HTTP ${response.status}`);
  }

  return payload;
}

export const api = {
  get buckets() {
    return bucketCache;
  },
  async loadBootstrap() {
    const payload = await request("/categories");
    if (Array.isArray(payload.buckets) && payload.buckets.length) {
      bucketCache = payload.buckets;
    }
    return payload;
  },
  async classifyText(text) {
    const payload = await request("/classify", {
      method: "POST",
      body: JSON.stringify({ text }),
    });
    return payload.classification;
  },
  async getEntries() {
    const payload = await request("/entries");
    return payload.entries || [];
  },
  async saveEntry(payload) {
    const response = await request("/entries", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.entry;
  },
  async seedDemoEntries() {
    const payload = await request("/demo/seed", {
      method: "POST",
    });
    return payload.entries || [];
  },
};

import env from "../config/env.js";

const DEFAULT_BUCKETS = [
  {
    id: "health",
    label: "Health",
    keywords: ["workout", "sleep", "doctor", "run", "gym", "energy", "meal"],
  },
  {
    id: "work",
    label: "Work",
    keywords: ["meeting", "project", "client", "launch", "deadline", "email", "team"],
  },
  {
    id: "finance",
    label: "Finance",
    keywords: ["paid", "invoice", "budget", "bill", "rent", "salary", "invest"],
  },
  {
    id: "relationships",
    label: "Relationships",
    keywords: ["family", "friend", "date", "partner", "call", "mom", "dad"],
  },
  {
    id: "growth",
    label: "Growth",
    keywords: ["read", "journal", "learned", "course", "practice", "reflect"],
  },
  {
    id: "notes",
    label: "Notes",
    keywords: ["idea", "remember", "note", "misc", "random"],
  },
];

const allowed = new Set(env.defaultBuckets);

export const buckets = DEFAULT_BUCKETS.filter((bucket) => allowed.has(bucket.id));

export function labelForBucket(bucketId) {
  return buckets.find((bucket) => bucket.id === bucketId)?.label || bucketId;
}

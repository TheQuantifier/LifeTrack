import { buckets } from "./default-buckets.service.js";

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

export function classifyHeuristically(text) {
  const normalized = String(text || "").toLowerCase();
  const bucket =
    buckets.find((candidate) => candidate.keywords.some((keyword) => normalized.includes(keyword))) ||
    buckets[buckets.length - 1];

  return {
    bucket: bucket.id,
    category: inferCategory(bucket.id, normalized),
    confidence: "heuristic",
  };
}

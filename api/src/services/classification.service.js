import { buckets, labelForBucket } from "./default-buckets.service.js";
import { classifyHeuristically } from "./heuristic-classification.service.js";
import { classifyWithLlm, isLlmConfigured } from "./llm-client.service.js";

function sanitizeClassification(parsed, fallback) {
  const bucketIds = new Set(buckets.map((bucket) => bucket.id));
  const bucket = String(parsed?.bucket || fallback.bucket).trim().toLowerCase();
  const category = String(parsed?.category || fallback.category).trim();

  return {
    bucket: bucketIds.has(bucket) ? bucket : fallback.bucket,
    category: category || fallback.category,
    confidence: parsed?.confidence || (isLlmConfigured() ? "llm" : fallback.confidence),
    bucketLabel: labelForBucket(bucketIds.has(bucket) ? bucket : fallback.bucket),
  };
}

export async function classifyEntry(text) {
  const fallback = classifyHeuristically(text);
  const bucketSummary = buckets.map((bucket) => `${bucket.id}: ${bucket.label}`).join(", ");
  const prompt = `
Classify this life update into one of these buckets: ${bucketSummary}.
Return JSON only with:
{
  "bucket": "<bucket id>",
  "category": "<short category name>"
}

Life update:
${String(text || "").trim()}
  `.trim();

  if (!isLlmConfigured()) {
    return sanitizeClassification(fallback, fallback);
  }

  try {
    const llmResult = await classifyWithLlm(prompt);
    return sanitizeClassification(llmResult, fallback);
  } catch (error) {
    console.warn("LLM classification failed, using heuristic fallback:", error.message);
    return sanitizeClassification(fallback, fallback);
  }
}

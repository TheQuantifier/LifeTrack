import { asyncHandler } from "../middleware/async.js";
import { createLifeEntry, getCategories, getEntries, seedDemoEntries } from "../services/entry.service.js";
import { classifyEntry } from "../services/classification.service.js";
import { buckets } from "../services/default-buckets.service.js";
import { isLlmConfigured } from "../services/llm-client.service.js";

export const listEntriesController = asyncHandler(async (_req, res) => {
  const entries = await getEntries();
  res.json({ entries });
});

export const createEntryController = asyncHandler(async (req, res) => {
  const entry = await createLifeEntry(req.body || {});
  res.status(201).json({ entry });
});

export const listCategoriesController = asyncHandler(async (_req, res) => {
  const categories = await getCategories();
  res.json({ categories, buckets });
});

export const classifyEntryController = asyncHandler(async (req, res) => {
  const text = String(req.body?.text || "").trim();
  if (!text) {
    return res.status(400).json({ error: "text is required" });
  }

  const classification = await classifyEntry(text);
  res.json({ classification });
});

export const seedDemoController = asyncHandler(async (_req, res) => {
  const entries = await seedDemoEntries();
  res.json({ entries });
});

export const statusController = asyncHandler(async (_req, res) => {
  res.json({
    sqlConfigured: true,
    llmConfigured: isLlmConfigured(),
    buckets,
  });
});

import { listCategories, upsertCategory } from "../models/categories.model.js";
import { createEntry, listEntries } from "../models/entries.model.js";
import { classifyEntry } from "./classification.service.js";

export async function getEntries() {
  return listEntries();
}

export async function getCategories() {
  return listCategories();
}

export async function createLifeEntry({ text, bucket, category }) {
  const sourceText = String(text || "").trim();
  if (!sourceText) {
    const error = new Error("text is required");
    error.status = 400;
    throw error;
  }

  const classification = bucket && category ? { bucket, category } : await classifyEntry(sourceText);
  const savedCategory = await upsertCategory(classification.bucket, classification.category);
  const entry = await createEntry({
    categoryId: savedCategory.id,
    text: sourceText,
    createdAt: new Date().toISOString(),
  });

  return {
    id: entry.id,
    text: entry.source_text,
    bucket: savedCategory.bucket,
    category: savedCategory.name,
    createdAt: entry.created_at,
    classification,
  };
}

export async function seedDemoEntries() {
  const existing = await listEntries();
  if (existing.length) return existing;

  const demoEntries = [
    "Had a strong workout and finally hit my step goal.",
    "Wrapped the client proposal and aligned next steps in the meeting.",
    "Paid the credit card bill and updated my monthly budget.",
  ];

  for (const text of demoEntries) {
    await createLifeEntry({ text });
  }

  return listEntries();
}

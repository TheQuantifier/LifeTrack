import env from "../config/env.js";

function buildUrl(pathname = "") {
  const base = new URL(env.llmBaseUrl);
  return new URL(pathname, base).toString();
}

function parseJsonCandidate(text) {
  if (!text) return null;

  try {
    return JSON.parse(text.trim());
  } catch {
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (match?.[1]) {
      try {
        return JSON.parse(match[1]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

async function readResponseJson(response) {
  const raw = await response.text();
  let parsed = null;

  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = null;
  }

  if (!response.ok) {
    throw new Error(parsed?.error?.message || parsed?.error || `LLM request failed with HTTP ${response.status}`);
  }

  return parsed;
}

async function callOpenAICompatible(prompt) {
  const response = await fetch(buildUrl(env.llmClassificationPath), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.llmApiKey}`,
    },
    body: JSON.stringify({
      model: env.llmModel,
      temperature: env.llmTemperature,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Classify the life update into a bucket and category. Return JSON only with keys bucket and category.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  const json = await readResponseJson(response);
  const content = json?.choices?.[0]?.message?.content || "";
  return parseJsonCandidate(content);
}

async function callAnthropic(prompt) {
  const response = await fetch(buildUrl(env.llmClassificationPath || "/messages"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.llmApiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: env.llmModel,
      temperature: env.llmTemperature,
      max_tokens: 300,
      system: "Classify the life update. Return JSON only with keys bucket and category.",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const json = await readResponseJson(response);
  const content = json?.content?.find((item) => item.type === "text")?.text || "";
  return parseJsonCandidate(content);
}

async function callGemini(prompt) {
  const url = buildUrl(env.llmClassificationPath || `/models/${env.llmModel}:generateContent?key=${env.llmApiKey}`);
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: env.llmTemperature,
        responseMimeType: "application/json",
      },
    }),
  });

  const json = await readResponseJson(response);
  const text = json?.candidates?.[0]?.content?.parts?.find((part) => part.text)?.text || "";
  return parseJsonCandidate(text);
}

export function isLlmConfigured() {
  return Boolean(env.llmApiKey && env.llmBaseUrl && env.llmModel);
}

export async function classifyWithLlm(prompt) {
  if (!isLlmConfigured()) {
    throw new Error("LLM configuration is incomplete.");
  }

  if (env.llmProvider === "anthropic") {
    return callAnthropic(prompt);
  }
  if (env.llmProvider === "gemini") {
    return callGemini(prompt);
  }
  return callOpenAICompatible(prompt);
}

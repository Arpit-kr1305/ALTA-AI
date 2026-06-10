import { config, useMockAI } from "./config.js";
import { keywordEmbedding } from "./vector.js";

export async function embedTexts(texts) {
  if (useMockAI()) {
    return texts.map(keywordEmbedding);
  }

  assertOpenAIKey();

  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: openAIHeaders(),
    body: JSON.stringify({
      model: config.embeddingModel,
      input: texts,
      encoding_format: "float"
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || "OpenAI embeddings request failed");
  }

  return data.data.map((item) => item.embedding);
}

export async function generateAnswer({ question, sources }) {
  if (useMockAI()) {
    return mockGroundedAnswer(question, sources);
  }

  assertOpenAIKey();

  const context = sources
    .map((source, index) => `[S${index + 1}] ${source.title} (${source.category})\n${source.text}`)
    .join("\n\n");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: openAIHeaders(),
    body: JSON.stringify({
      model: config.openaiModel,
      input: [
        {
          role: "developer",
          content: [
            {
              type: "input_text",
              text: "You are DeployMate, a DevOps RAG assistant. Answer only from the retrieved sources. Cite sources with [S1], [S2]. If sources are not enough, say what runbook entry is missing. Keep answers demo-friendly and actionable."
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Question: ${question}\n\nRetrieved DevOps runbook sources:\n${context}`
            }
          ]
        }
      ]
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || "OpenAI response generation failed");
  }

  return extractOutputText(data);
}

function mockGroundedAnswer(question, sources) {
  if (!sources.length) {
    return `I could not find enough DevOps runbook context to answer "${question}". Add a runbook entry for this scenario and try again.`;
  }

  const lines = sources.slice(0, 3).map((source, index) => {
    return `${index + 1}. ${source.text} [S${index + 1}]`;
  });

  return [
    "Based on the retrieved DevOps runbook, here is the safest next action:",
    "",
    ...lines,
    "",
    "Demo note: show the retrieved sources to prove this is RAG, not a normal chatbot."
  ].join("\n");
}

function assertOpenAIKey() {
  if (!config.openaiApiKey) {
    throw new Error("OPENAI_API_KEY is required when AI_PROVIDER=openai");
  }
}

function openAIHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${config.openaiApiKey}`
  };
}

function extractOutputText(data) {
  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const text = data.output
    ?.flatMap((item) => item.content || [])
    .filter((content) => content.type === "output_text")
    .map((content) => content.text)
    .join("\n")
    .trim();

  if (!text) {
    throw new Error("OpenAI response did not include text output");
  }

  return text;
}

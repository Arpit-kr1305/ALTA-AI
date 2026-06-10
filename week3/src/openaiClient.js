import { config, useMockAI } from "./config.js";

export async function embedTexts(texts) {
  if (useMockAI()) {
    return texts.map((text) => mockEmbedding(text));
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

export async function generateGroundedAnswer({ question, sources }) {
  if (useMockAI()) {
    return mockAnswer(question, sources);
  }

  assertOpenAIKey();

  const context = sources
    .map((source, index) => {
      return `[S${index + 1}] ${source.title} (${source.type}, ${source.date})\n${source.text}`;
    })
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
              text: [
                "You are Fellowship Memory Mentor, a RAG assistant.",
                "Answer only from the retrieved sources.",
                "Cite sources using [S1], [S2], etc.",
                "If the sources do not contain enough information, say so clearly and suggest what note should be added.",
                "Keep the answer practical and concise."
              ].join(" ")
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Retrieved sources:\n${context}\n\nQuestion: ${question}`
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

function mockEmbedding(text) {
  const vector = new Array(64).fill(0);
  const words = text.toLowerCase().match(/[a-z0-9]+/g) || [];

  for (const word of words) {
    let hash = 0;
    for (const char of word) {
      hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
    }
    vector[hash % vector.length] += 1;
  }

  const length = Math.hypot(...vector) || 1;
  return vector.map((value) => value / length);
}

function mockAnswer(question, sources) {
  if (!sources.length) {
    return `The memory bank does not contain enough information to answer: "${question}". Add a note that directly covers this topic, then ingest again.`;
  }

  const citations = sources.slice(0, 2).map((_, index) => `[S${index + 1}]`).join(" ");
  return [
    `Based on the retrieved memory cards, the best answer is to keep the project personal, source-grounded, and easy to demo ${citations}.`,
    "",
    "Practical next steps:",
    "1. Ingest your fellowship notes into Chroma.",
    "2. Ask a question that can be answered from those notes.",
    "3. Show the retrieved sources beside the final answer.",
    "4. Include one refusal example to prove it does not guess."
  ].join("\n");
}

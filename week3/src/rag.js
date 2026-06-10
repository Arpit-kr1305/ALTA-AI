import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { ChromaClient } from "./chromaClient.js";
import { buildChunks } from "./chunking.js";
import { embedTexts, generateGroundedAnswer } from "./openaiClient.js";

const dataPath = resolve(process.cwd(), "data", "memory_cards.json");

export async function ingestKnowledgeBase(vectorDb = new ChromaClient()) {
  const cards = JSON.parse(await readFile(dataPath, "utf8"));
  const chunks = buildChunks(cards);
  const embeddings = await embedTexts(chunks.map((chunk) => chunk.text));

  await vectorDb.getOrCreateCollection();
  await vectorDb.addRecords({
    ids: chunks.map((chunk) => chunk.id),
    embeddings,
    documents: chunks.map((chunk) => chunk.text),
    metadatas: chunks.map((chunk) => chunk.metadata)
  });

  return {
    cards: cards.length,
    chunks: chunks.length
  };
}

export async function answerQuestion(question, options = {}) {
  const trimmed = validateQuestion(question);
  const topK = Number(options.topK || 4);
  const vectorDb = options.vectorDb || new ChromaClient();

  const [questionEmbedding] = await embedTexts([trimmed]);
  const results = await vectorDb.query({ embedding: questionEmbedding, topK });
  const sources = normalizeSources(results);
  const answer = await generateGroundedAnswer({ question: trimmed, sources });

  return {
    question: trimmed,
    answer,
    sources
  };
}

export function normalizeSources(results) {
  const documents = results.documents?.[0] || [];
  const metadatas = results.metadatas?.[0] || [];
  const distances = results.distances?.[0] || [];

  return documents
    .map((text, index) => ({
      label: `S${index + 1}`,
      text,
      distance: distances[index],
      title: metadatas[index]?.title || "Untitled source",
      type: metadatas[index]?.type || "unknown",
      date: metadatas[index]?.date || "unknown",
      sourceId: metadatas[index]?.source_id || "unknown"
    }))
    .filter((source) => source.text);
}

function validateQuestion(question) {
  if (typeof question !== "string") {
    throw badRequest("question is required and must be a string");
  }

  const trimmed = question.trim();
  if (trimmed.length < 3 || trimmed.length > 500) {
    throw badRequest("question must be between 3 and 500 characters");
  }

  return trimmed;
}

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

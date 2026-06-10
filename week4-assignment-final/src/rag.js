import { embedTexts, generateAnswer } from "./ai.js";
import { loadRunbook, chunkRunbook } from "./knowledge.js";
import { cosineSimilarity } from "./vector.js";

let indexCache = null;

export async function buildIndex() {
  const runbook = await loadRunbook();
  const chunks = chunkRunbook(runbook);
  const embeddings = await embedTexts(chunks.map((chunk) => `${chunk.title}\n${chunk.category}\n${chunk.text}`));

  indexCache = chunks.map((chunk, index) => ({
    ...chunk,
    embedding: embeddings[index]
  }));

  return {
    documents: runbook.length,
    chunks: chunks.length
  };
}

export async function answerDevOpsQuestion(question, topK = 4) {
  const cleanQuestion = validateQuestion(question);

  if (!indexCache) {
    await buildIndex();
  }

  const [questionEmbedding] = await embedTexts([cleanQuestion]);
  const sources = indexCache
    .map((chunk) => ({
      id: chunk.id,
      title: chunk.title,
      category: chunk.category,
      text: chunk.text,
      score: cosineSimilarity(questionEmbedding, chunk.embedding) + keywordBoost(cleanQuestion, chunk)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .filter((source) => source.score > 0.05);

  const answer = await generateAnswer({
    question: cleanQuestion,
    sources
  });

  return {
    question: cleanQuestion,
    answer,
    sources: sources.map((source, index) => ({
      label: `S${index + 1}`,
      title: source.title,
      category: source.category,
      score: Number(source.score.toFixed(3)),
      text: source.text
    }))
  };
}

export function clearIndexForTest() {
  indexCache = null;
}

function validateQuestion(question) {
  if (typeof question !== "string") {
    const error = new Error("question is required and must be a string");
    error.statusCode = 400;
    throw error;
  }

  const trimmed = question.trim();
  if (trimmed.length < 3 || trimmed.length > 400) {
    const error = new Error("question must be between 3 and 400 characters");
    error.statusCode = 400;
    throw error;
  }

  return trimmed;
}

function keywordBoost(question, chunk) {
  const q = question.toLowerCase();
  const haystack = `${chunk.title} ${chunk.category} ${chunk.text}`.toLowerCase();
  let boost = 0;

  const pairs = [
    ["localhost", "localhost"],
    ["public ip", "public"],
    ["aws", "aws"],
    ["ec2", "ec2"],
    ["github action", "github actions"],
    ["ci", "ci/cd"],
    ["docker", "docker"],
    ["domain", "dns"],
    ["dns", "dns"],
    ["secret", "secrets"],
    ["environment", "environment"]
  ];

  for (const [queryTerm, sourceTerm] of pairs) {
    if (q.includes(queryTerm) && haystack.includes(sourceTerm)) {
      boost += 0.12;
    }
  }

  return boost;
}

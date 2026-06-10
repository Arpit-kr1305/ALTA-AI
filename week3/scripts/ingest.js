import { ingestKnowledgeBase } from "../src/rag.js";

try {
  const result = await ingestKnowledgeBase();
  console.log(`Ingested ${result.cards} memory cards as ${result.chunks} Chroma chunks.`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}

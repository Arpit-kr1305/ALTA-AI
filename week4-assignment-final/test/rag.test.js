import test from "node:test";
import assert from "node:assert/strict";
import { chunkRunbook } from "../src/knowledge.js";
import { keywordEmbedding, cosineSimilarity } from "../src/vector.js";

test("chunkRunbook keeps DevOps metadata", () => {
  const chunks = chunkRunbook([
    {
      id: "dns",
      title: "DNS setup",
      category: "DNS",
      text: "Use an A record to point a domain to an IPv4 address."
    }
  ]);

  assert.equal(chunks.length, 1);
  assert.equal(chunks[0].title, "DNS setup");
  assert.equal(chunks[0].category, "DNS");
});

test("keyword embeddings rank related text higher", () => {
  const query = keywordEmbedding("github actions workflow");
  const related = keywordEmbedding("GitHub Actions runs tests and builds code");
  const unrelated = keywordEmbedding("DNS maps domain names to server IP addresses");

  assert.ok(cosineSimilarity(query, related) > cosineSimilarity(query, unrelated));
});

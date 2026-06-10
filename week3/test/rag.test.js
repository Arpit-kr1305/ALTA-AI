import test from "node:test";
import assert from "node:assert/strict";
import { buildChunks } from "../src/chunking.js";
import { normalizeSources } from "../src/rag.js";

test("buildChunks preserves source metadata", () => {
  const chunks = buildChunks([
    {
      id: "note-1",
      title: "Test note",
      type: "session-note",
      date: "2026-05-02",
      text: "RAG retrieves source chunks before it generates grounded answers."
    }
  ]);

  assert.equal(chunks.length, 1);
  assert.equal(chunks[0].metadata.source_id, "note-1");
  assert.equal(chunks[0].metadata.title, "Test note");
});

test("normalizeSources converts Chroma query output into cited sources", () => {
  const sources = normalizeSources({
    documents: [["The system must use retrieved data."]],
    metadatas: [[{ title: "Rubric", type: "rubric", date: "2026-05-02", source_id: "rubric" }]],
    distances: [[0.12]]
  });

  assert.equal(sources.length, 1);
  assert.equal(sources[0].label, "S1");
  assert.equal(sources[0].title, "Rubric");
  assert.match(sources[0].text, /retrieved data/);
});

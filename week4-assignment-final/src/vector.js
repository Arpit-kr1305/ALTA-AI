export function keywordEmbedding(text) {
  const vector = new Array(96).fill(0);
  const tokens = text.toLowerCase().match(/[a-z0-9]+/g) || [];

  for (const token of tokens) {
    let hash = 2166136261;
    for (const char of token) {
      hash ^= char.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    vector[Math.abs(hash) % vector.length] += 1;
  }

  const magnitude = Math.hypot(...vector) || 1;
  return vector.map((value) => value / magnitude);
}

export function cosineSimilarity(a, b) {
  return a.reduce((sum, value, index) => sum + value * b[index], 0);
}

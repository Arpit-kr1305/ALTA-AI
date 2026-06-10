export function buildChunks(cards, maxWords = 90) {
  return cards.flatMap((card) => {
    const words = card.text.split(/\s+/).filter(Boolean);
    const chunks = [];

    for (let start = 0; start < words.length; start += maxWords) {
      const chunkWords = words.slice(start, start + maxWords);
      chunks.push({
        id: `${card.id}-chunk-${chunks.length + 1}`,
        text: chunkWords.join(" "),
        metadata: {
          source_id: card.id,
          title: card.title,
          type: card.type,
          date: card.date,
          chunk: chunks.length + 1
        }
      });
    }

    return chunks;
  });
}

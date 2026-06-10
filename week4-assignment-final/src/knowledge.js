import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const dataPath = resolve(process.cwd(), "data", "devops_runbook.json");

export async function loadRunbook() {
  const raw = await readFile(dataPath, "utf8");
  return JSON.parse(raw);
}

export function chunkRunbook(items, maxWords = 75) {
  return items.flatMap((item) => {
    const words = item.text.split(/\s+/).filter(Boolean);
    const chunks = [];

    for (let start = 0; start < words.length; start += maxWords) {
      const text = words.slice(start, start + maxWords).join(" ");
      chunks.push({
        id: `${item.id}-${chunks.length + 1}`,
        title: item.title,
        category: item.category,
        text
      });
    }

    return chunks;
  });
}

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

loadEnvFile();

export const config = {
  appName: process.env.APP_NAME || "DeployMate DevOps RAG",
  port: Number(process.env.PORT || 8090),
  aiProvider: (process.env.AI_PROVIDER || "mock").toLowerCase(),
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  openaiModel: process.env.OPENAI_MODEL || "gpt-5.2",
  embeddingModel: process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small"
};

export function useMockAI() {
  return config.aiProvider !== "openai";
}

function loadEnvFile() {
  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) return;

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;

    const [key, ...valueParts] = trimmed.split("=");
    const value = valueParts.join("=").trim().replace(/^["']|["']$/g, "");

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

import { createServer } from "node:http";
import { config } from "./config.js";
import { ingestKnowledgeBase, answerQuestion } from "./rag.js";

const sampleQuestions = [
  "How should I explain my Week 3 RAG project in the submission?",
  "What makes this project different from a generic PDF chatbot?",
  "What did I build in Week 2?",
  "What should I avoid uploading with my assignment?"
];

const server = createServer(async (request, response) => {
  setJsonHeaders(response);

  try {
    if (request.method === "OPTIONS") {
      return sendJson(response, 204, {});
    }

    if (request.method === "GET" && request.url === "/") {
      return sendJson(response, 200, {
        status: "ok",
        project: config.appName,
        vectorDatabase: "Chroma",
        aiApi: config.aiProvider === "mock" ? "mock" : "OpenAI",
        routes: ["POST /ingest", "POST /ask", "GET /sample-questions"]
      });
    }

    if (request.method === "GET" && request.url === "/sample-questions") {
      return sendJson(response, 200, { sampleQuestions });
    }

    if (request.method === "POST" && request.url === "/ingest") {
      const result = await ingestKnowledgeBase();
      return sendJson(response, 200, {
        message: "Knowledge base ingested into Chroma",
        ...result
      });
    }

    if (request.method === "POST" && request.url === "/ask") {
      const payload = await readJsonBody(request);
      const result = await answerQuestion(payload.question, { topK: payload.topK });
      return sendJson(response, 200, result);
    }

    return sendJson(response, 404, {
      error: "Route not found",
      routes: ["GET /", "GET /sample-questions", "POST /ingest", "POST /ask"]
    });
  } catch (error) {
    return sendJson(response, error.statusCode || 500, {
      error: error.message || "Internal server error"
    });
  }
});

server.listen(config.port, () => {
  console.log(`${config.appName} running on http://127.0.0.1:${config.port}`);
});

function setJsonHeaders(response) {
  response.setHeader("Content-Type", "application/json");
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function sendJson(response, statusCode, body) {
  response.statusCode = statusCode;
  response.end(statusCode === 204 ? "" : JSON.stringify(body, null, 2));
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 20_000) {
        const error = new Error("Request body is too large");
        error.statusCode = 413;
        reject(error);
        request.destroy();
      }
    });

    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        const error = new Error("Request body must be valid JSON");
        error.statusCode = 400;
        reject(error);
      }
    });

    request.on("error", reject);
  });
}

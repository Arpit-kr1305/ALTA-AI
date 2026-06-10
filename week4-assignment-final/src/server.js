import { createReadStream, existsSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { createServer } from "node:http";
import { config, useMockAI } from "./config.js";
import { answerDevOpsQuestion, buildIndex } from "./rag.js";

const publicDir = resolve(process.cwd(), "public");

const sampleQuestions = [
  "My Node app works on localhost but not on AWS public IP. What should I check?",
  "How should I create a GitHub Actions workflow for this app?",
  "What DNS record do I need to point my domain to my server?",
  "What is the safest order to debug a failed deployment?"
];

const server = createServer(async (request, response) => {
  setCorsHeaders(response);

  try {
    if (request.method === "OPTIONS") {
      return sendJson(response, 204, {});
    }

    if (request.method === "GET" && request.url === "/api/health") {
      return sendJson(response, 200, {
        status: "ok",
        app: config.appName,
        aiProvider: useMockAI() ? "mock" : "openai",
        mode: "RAG over DevOps runbook"
      });
    }

    if (request.method === "GET" && request.url === "/api/samples") {
      return sendJson(response, 200, { sampleQuestions });
    }

    if (request.method === "POST" && request.url === "/api/reindex") {
      const result = await buildIndex();
      return sendJson(response, 200, {
        message: "DevOps runbook indexed successfully",
        ...result
      });
    }

    if (request.method === "POST" && request.url === "/api/ask") {
      const body = await readJson(request);
      const result = await answerDevOpsQuestion(body.question, body.topK);
      return sendJson(response, 200, result);
    }

    if (request.method === "GET") {
      return serveStatic(request, response);
    }

    return sendJson(response, 404, { error: "Route not found" });
  } catch (error) {
    return sendJson(response, error.statusCode || 500, {
      error: error.message || "Internal server error"
    });
  }
});

server.listen(config.port, () => {
  console.log(`${config.appName} running at http://127.0.0.1:${config.port}`);
});

function serveStatic(request, response) {
  const urlPath = request.url === "/" ? "/index.html" : request.url;
  const filePath = join(publicDir, decodeURIComponent(urlPath));

  if (!filePath.startsWith(publicDir) || !existsSync(filePath)) {
    return sendJson(response, 404, { error: "File not found" });
  }

  response.statusCode = 200;
  response.setHeader("Content-Type", contentType(filePath));
  createReadStream(filePath).pipe(response);
}

function contentType(filePath) {
  const types = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json"
  };
  return types[extname(filePath)] || "text/plain";
}

function setCorsHeaders(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function sendJson(response, statusCode, body) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json");
  response.end(statusCode === 204 ? "" : JSON.stringify(body, null, 2));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 20_000) {
        const error = new Error("Request body too large");
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

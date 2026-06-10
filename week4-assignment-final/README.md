# DeployMate DevOps RAG

Week 4 assignment project: a DevOps deployment troubleshooting assistant built with coding + AI API + RAG.

## Problem Statement

Beginners often get confused when moving a project from local development to real deployment. They hear terms like Docker, GitHub Actions, AWS, DNS, localhost, ports, and CI/CD, but they do not know what to check first when something fails.

DeployMate solves this by using RAG over a small DevOps runbook. It retrieves the most relevant deployment notes first, then generates a grounded answer with source citations.

## Why This Project Stands Out

- It connects directly to the Week 4 DevOps session topic.
- It is not a generic chatbot; it answers from a DevOps runbook.
- It shows retrieved sources beside the answer, proving the RAG flow.
- It includes CI/CD and Docker files, so the project itself demonstrates DevOps.
- It can run in mock mode for demo or OpenAI mode for real AI API usage.

## Tools and Technologies

- Node.js
- HTML, CSS, JavaScript
- OpenAI API for embeddings and answer generation
- RAG retrieval over `data/devops_runbook.json`
- Docker
- GitHub Actions CI

## How RAG Works

1. DevOps runbook entries are loaded from JSON.
2. Entries are split into chunks.
3. Chunks are converted into embeddings.
4. The user's question is embedded.
5. Similar chunks are retrieved using cosine similarity.
6. The AI generates an answer using only the retrieved sources.
7. The UI displays the answer and retrieved source snippets.

## Run Locally

```bash
copy .env.example .env
npm.cmd start
```

Open:

```text
http://127.0.0.1:8090
```

Mock mode works without an API key.

For real AI API mode, edit `.env`:

```text
AI_PROVIDER=openai
OPENAI_API_KEY=your_api_key_here
```

## API Endpoints

```text
GET  /api/health
GET  /api/samples
POST /api/reindex
POST /api/ask
```

Example:

```bash
curl -X POST http://127.0.0.1:8090/api/ask ^
  -H "Content-Type: application/json" ^
  -d "{\"question\":\"My app works on localhost but not on AWS public IP. What should I check?\"}"
```

## Test

```bash
npm.cmd test
```

## Demo Video Plan

1. Show the project title and explain the problem.
2. Ask a sample deployment question.
3. Show the AI answer.
4. Show the retrieved sources.
5. Explain that this is RAG because retrieval happens before generation.
6. Show `Dockerfile` and `.github/workflows/ci.yml` to connect with DevOps.

## Submission Assets

Screenshots and demo assets are included in the `assets` folder:

- `assets/sample_inputs_outputs_overview.png`
- `assets/screenshot_01_aws_public_ip.png`
- `assets/screenshot_02_github_actions.png`
- `assets/screenshot_03_dns_domain.png`
- `assets/deploymate_short_demo.avi`

## Submission

Submit either:

- GitHub repository link, or
- ZIP file of this folder, or
- PDF report with project link/demo link.

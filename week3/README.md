# Fellowship Memory Mentor RAG

A unique Week 3 RAG mini project for the ALTA AI Fellowship.

Instead of building another generic PDF chatbot, this project acts like a **personal memory mentor**. It answers questions using a student's own fellowship memory bank: session notes, mentor feedback, assignment rubrics, project logs, and personal study constraints.

The assistant is designed to answer only from the stored data, cite the retrieved sources, and say when the memory bank does not contain enough information.

## Problem Statement

Students often forget important feedback, project decisions, and session takeaways during a fellowship. A normal chatbot may give generic advice, but it does not know what the student actually learned or built.

This project solves that problem by creating a RAG assistant that retrieves relevant notes from the student's own fellowship memory bank and generates grounded answers with citations.

## Tools and Technologies Used

- Node.js HTTP API
- OpenAI Responses API for answer generation
- OpenAI Embeddings API using `text-embedding-3-small`
- Chroma vector database
- Docker Compose for running Chroma locally
- JSON memory-card dataset

## How the RAG System Works

1. The system reads `data/memory_cards.json`.
2. Each memory card is split into smaller chunks.
3. OpenAI embeddings convert each chunk into a vector.
4. Chroma stores the chunk text, embeddings, and metadata.
5. When a user asks a question, the question is embedded.
6. Chroma retrieves the most similar chunks.
7. OpenAI receives the question plus retrieved context.
8. The final answer is generated only from the retrieved sources and includes citations like `[S1]`.

## Project Structure

```text
week3-rag-memory-mentor/
  data/memory_cards.json       Personal knowledge base
  scripts/ingest.js            CLI ingestion script
  src/chromaClient.js          Chroma vector database client
  src/chunking.js              Text chunking logic
  src/config.js                Environment configuration
  src/openaiClient.js          OpenAI embeddings and generation
  src/rag.js                   RAG orchestration
  src/server.js                HTTP API
  test/rag.test.js             Unit tests
```

## Setup

Copy the environment file:

```bash
copy .env.example .env
```

Add your OpenAI API key in `.env`:

```text
OPENAI_API_KEY=your_api_key_here
AI_PROVIDER=openai
```

Start Chroma:

```bash
docker compose up -d
```

Ingest the memory bank into Chroma:

```bash
npm.cmd run ingest
```

Start the API:

```bash
npm.cmd start
```

The API runs at:

```text
http://127.0.0.1:8080
```

## API Endpoints

### Health Check

```bash
curl http://127.0.0.1:8080/
```

### Ingest Data

```bash
curl -X POST http://127.0.0.1:8080/ingest
```

### Ask a Question

```bash
curl -X POST http://127.0.0.1:8080/ask ^
  -H "Content-Type: application/json" ^
  -d "{\"question\":\"What makes this project different from a generic PDF chatbot?\"}"
```

## Sample Inputs and Outputs

### Sample Input 1

```json
{
  "question": "How should I explain my Week 3 RAG project in the submission?"
}
```

### Sample Output 1

```json
{
  "answer": "Explain it as a Fellowship Memory Mentor that retrieves your own notes before generating an answer. Mention that it uses OpenAI for embeddings and generation, Chroma for vector search, and answers only from retrieved memory cards [S1] [S2]. Include the problem statement, tools, workflow, sample input/output, and code zip or GitHub link [S1].",
  "sources": [
    {
      "label": "S1",
      "title": "Week 3 RAG assignment requirements",
      "type": "rubric"
    },
    {
      "label": "S2",
      "title": "Technical plan for the RAG system",
      "type": "system-design-note"
    }
  ]
}
```

### Sample Input 2

```json
{
  "question": "Who won the IPL final?"
}
```

### Sample Output 2

```json
{
  "answer": "The memory bank does not contain enough information to answer that question. Add a note about IPL results if you want this assistant to answer it from your own data."
}
```

## Test

```bash
npm.cmd test
```

## Why This Stands Out

- It is not a generic document Q&A app.
- It uses a personal memory-bank idea that feels useful for fellowship students.
- It shows retrieved source snippets in the API response.
- It proves grounding by refusing questions outside the dataset.
- It is small enough to explain clearly in a viva or demo.

## References

- OpenAI Responses API text generation: https://platform.openai.com/docs/guides/text
- OpenAI embeddings guide: https://platform.openai.com/docs/guides/embeddings
- Chroma collections and vector search docs: https://docs.trychroma.com/docs/overview/getting-started
- Chroma add records API: https://docs.trychroma.com/reference/chroma-api/record/add-records
- Chroma query collection API: https://docs.trychroma.com/reference/chroma-api/record/query-collection

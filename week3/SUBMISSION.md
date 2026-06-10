# Week 3 Assignment Submission

## Project Title

Fellowship Memory Mentor RAG

## Problem Statement

During a fellowship, students collect many useful notes: session takeaways, project logs, mentor feedback, assignment rubrics, and personal reminders. These notes are easy to forget later. This project creates a RAG-based mentor that answers questions only from the student's own fellowship memory bank, with source citations.

## Tools and Technologies Used

- Node.js
- OpenAI API
- OpenAI Responses API for final answer generation
- OpenAI Embeddings API using `text-embedding-3-small`
- Chroma vector database
- Docker Compose
- JSON knowledge base

## How the RAG System Works

1. The memory cards in `data/memory_cards.json` are loaded.
2. Each card is split into small chunks.
3. Each chunk is converted into an embedding using OpenAI.
4. The chunks, embeddings, and metadata are stored in Chroma.
5. A user question is converted into an embedding.
6. Chroma retrieves the most relevant chunks.
7. OpenAI generates the final answer using only the retrieved context.
8. The API returns the answer plus source snippets.

## Sample Input 1

```json
{
  "question": "What makes this project different from a generic PDF chatbot?"
}
```

## Sample Output 1

```json
{
  "answer": "This project is different because it uses a personal fellowship memory bank instead of a random PDF. It retrieves session notes, mentor feedback, rubrics, and project logs before answering, then cites those sources. It also refuses to guess when the answer is not present in the student's data [S1] [S2]."
}
```

## Sample Input 2

```json
{
  "question": "What did I build in Week 2?"
}
```

## Sample Output 2

```json
{
  "answer": "In Week 2, you built an AI Content Generator API System. It accepted a topic, generated a blog article, converted it into a LinkedIn post, and generated a summary. The output fields were blog, post, and summary [S1]."
}
```

## Code Submission

Submit the `week3-rag-memory-mentor` folder as a zip or upload it to GitHub.

Do not upload `.env` because it may contain your API key.

# AI Content Generator API System

This is a dependency-free Node.js API for the ALTA AI Fellowship Week 2 assignment.

Input: topic  
Output: blog article, LinkedIn post, and summary

## Flow

1. Send the topic to an AI model.
2. Generate a blog article.
3. Convert the blog article into a LinkedIn post.
4. Generate a concise summary.

## Project Structure

```text
src/
  aiClient.js          OpenAI and mock AI clients
  config.js            Environment configuration
  contentGenerator.js  Blog, post, and summary workflow
  server.js            HTTP API routes
test/
  contentGenerator.test.js
```

## Setup

```bash
copy .env.example .env
```

The default `.env.example` uses `AI_PROVIDER=mock`, so the API works without an API key.

To use OpenAI, update `.env`:

```text
AI_PROVIDER=openai
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-5.2
```

## Run

```bash
npm start
```

If PowerShell blocks `npm`, use:

```bash
npm.cmd start
```

The API runs at:

```text
http://127.0.0.1:8000
```

## API Usage

### Health Check

```bash
curl http://127.0.0.1:8000/
```

### Generate Content

```bash
curl -X POST http://127.0.0.1:8000/generate ^
  -H "Content-Type: application/json" ^
  -d "{\"topic\":\"How AI is changing education\"}"
```

Response:

```json
{
  "topic": "How AI is changing education",
  "blog": "...",
  "post": "...",
  "summary": "..."
}
```

## Test

```bash
npm test
```

If PowerShell blocks `npm`, use:

```bash
npm.cmd test
```

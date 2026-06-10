# Week 4 Assignment Submission

## Project Title

DeployMate DevOps RAG

## Project Idea

DeployMate is a DevOps troubleshooting assistant. It helps beginners debug deployment problems by answering from a small DevOps runbook covering CI/CD, GitHub Actions, Docker, AWS EC2, DNS, localhost-to-public deployment, environment variables, and debugging order.

## Option Chosen

Coding + AI API -> RAG

## Tools Used

- Node.js
- HTML, CSS, JavaScript
- OpenAI API
- RAG retrieval
- Docker
- GitHub Actions

## How It Works

1. The app loads DevOps runbook data from `data/devops_runbook.json`.
2. The runbook is split into chunks.
3. Each chunk is embedded.
4. The user's question is embedded.
5. The most relevant runbook chunks are retrieved.
6. The AI generates a grounded answer using only those chunks.
7. The answer and sources are shown in the web UI.

## Sample Input

```text
My Node app works on localhost but not on AWS public IP. What should I check?
```

## Sample Output

```text
Check host binding, exposed port, cloud firewall/security group, environment variables,
and whether the public URL points to the correct server. The runbook says localhost apps
often fail publicly because of port, firewall, environment variable, or host binding issues [S1].
```

## Demo Video Script

1. "This is DeployMate, my Week 4 DevOps RAG project."
2. "The problem is that beginners get stuck when moving from localhost to deployment."
3. "I will ask a deployment question."
4. "The app retrieves matching runbook entries first."
5. "Then AI generates an answer from those sources."
6. "The sources are displayed here, proving this is RAG."
7. "I also added a Dockerfile and GitHub Actions workflow to connect the project with DevOps."

## Screenshots and Demo Video

The `assets` folder includes:

- Sample input/output overview image
- Three project screenshots
- Short captioned demo video

## Final Submission Folder

Upload this complete folder directly in the assignment section.

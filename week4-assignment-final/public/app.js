const statusEl = document.querySelector("#status");
const questionEl = document.querySelector("#question");
const answerEl = document.querySelector("#answer");
const sourcesEl = document.querySelector("#sources");
const samplesEl = document.querySelector("#samples");
const askBtn = document.querySelector("#askBtn");
const reindexBtn = document.querySelector("#reindexBtn");

init();

async function init() {
  await checkHealth();
  await loadSamples();
}

askBtn.addEventListener("click", async () => {
  const question = questionEl.value.trim();
  if (!question) {
    answerEl.textContent = "Please enter a DevOps question first.";
    return;
  }

  askBtn.disabled = true;
  answerEl.textContent = "Retrieving DevOps runbook context and generating answer...";
  sourcesEl.innerHTML = "";

  try {
    const result = await postJson("/api/ask", { question });
    answerEl.textContent = result.answer;
    renderSources(result.sources);
  } catch (error) {
    answerEl.textContent = error.message;
  } finally {
    askBtn.disabled = false;
  }
});

reindexBtn.addEventListener("click", async () => {
  reindexBtn.disabled = true;
  answerEl.textContent = "Re-indexing DevOps runbook...";

  try {
    const result = await postJson("/api/reindex", {});
    answerEl.textContent = `${result.message}\nDocuments: ${result.documents}\nChunks: ${result.chunks}`;
  } catch (error) {
    answerEl.textContent = error.message;
  } finally {
    reindexBtn.disabled = false;
  }
});

async function checkHealth() {
  try {
    const health = await getJson("/api/health");
    statusEl.textContent = `${health.status.toUpperCase()} | ${health.aiProvider}`;
  } catch {
    statusEl.textContent = "API offline";
  }
}

async function loadSamples() {
  const result = await getJson("/api/samples");
  samplesEl.innerHTML = result.sampleQuestions
    .map((question) => `<button class="sample" type="button">${escapeHtml(question)}</button>`)
    .join("");

  document.querySelectorAll(".sample").forEach((button) => {
    button.addEventListener("click", () => {
      questionEl.value = button.textContent;
    });
  });
}

function renderSources(sources) {
  if (!sources.length) {
    sourcesEl.innerHTML = `<div class="sources-empty">No strong source match found.</div>`;
    return;
  }

  sourcesEl.innerHTML = sources
    .map((source) => {
      return `
        <article class="source">
          <strong>${source.label}: ${escapeHtml(source.title)}</strong>
          <small>${escapeHtml(source.category)} | similarity ${source.score}</small>
          <p>${escapeHtml(source.text)}</p>
        </article>
      `;
    })
    .join("");
}

async function getJson(url) {
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

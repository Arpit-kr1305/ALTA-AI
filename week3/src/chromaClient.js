import { config } from "./config.js";

export class ChromaClient {
  constructor(baseUrl = config.chromaUrl) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.collectionId = null;
  }

  async health() {
    return this.request("/api/v2/heartbeat", { method: "GET" });
  }

  async getOrCreateCollection(name = config.chromaCollection) {
    const collections = await this.listCollections();
    const existing = collections.find((collection) => collection.name === name);

    if (existing) {
      this.collectionId = existing.id;
      return existing;
    }

    const created = await this.request(this.collectionsPath(), {
      method: "POST",
      body: {
        name,
        get_or_create: true,
        metadata: {
          project: "Fellowship Memory Mentor",
          purpose: "RAG assignment"
        }
      }
    });

    this.collectionId = created.id;
    return created;
  }

  async listCollections() {
    return this.request(this.collectionsPath(), { method: "GET" });
  }

  async addRecords({ ids, embeddings, documents, metadatas }) {
    const collectionId = await this.ensureCollectionId();
    return this.request(`${this.collectionsPath()}/${collectionId}/add`, {
      method: "POST",
      body: {
        ids,
        embeddings,
        documents,
        metadatas
      }
    });
  }

  async query({ embedding, topK = 4 }) {
    const collectionId = await this.ensureCollectionId();
    return this.request(`${this.collectionsPath()}/${collectionId}/query`, {
      method: "POST",
      body: {
        query_embeddings: [embedding],
        n_results: topK,
        include: ["documents", "metadatas", "distances"]
      }
    });
  }

  async ensureCollectionId() {
    if (this.collectionId) return this.collectionId;
    const collection = await this.getOrCreateCollection();
    return collection.id;
  }

  collectionsPath() {
    return `/api/v2/tenants/${config.chromaTenant}/databases/${config.chromaDatabase}/collections`;
  }

  async request(path, { method, body } = {}) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: this.headers(),
      body: body ? JSON.stringify(body) : undefined
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      throw new Error(data?.error || data?.message || `Chroma request failed: ${response.status}`);
    }

    return data;
  }

  headers() {
    const headers = { "Content-Type": "application/json" };
    if (config.chromaToken) {
      headers["x-chroma-token"] = config.chromaToken;
    }
    return headers;
  }
}

import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { processDocument } from "../services/rag.js";
import {
  createDocument,
  getDocumentsByNotebook,
  getDocument,
  deleteDocument,
} from "../repos/documentRepo.js";
import { searchSimilarChunks } from "../repos/chunkRepo.js";
import { embedText } from "../ai/embeddings.js";
import { documentSearchSchema } from "../services/validators.js";
import { env } from "../env.js";

const app = new Hono();

app.post("/:id/documents", async (c) => {
  const notebookId = Number(c.req.param("id"));

  let form: FormData;
  try {
    form = await c.req.formData();
  } catch {
    throw new HTTPException(400, { message: "Expected multipart/form-data" });
  }

  const file = form.get("file") as File | null;
  if (!file) throw new HTTPException(400, { message: "No file provided" });

  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > env.MAX_FILE_SIZE_MB) {
    throw new HTTPException(400, {
      message: `File exceeds ${env.MAX_FILE_SIZE_MB} MB limit`,
    });
  }

  const filename = file.name;
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext !== "pdf" && ext !== "txt") {
    throw new HTTPException(400, { message: "Only PDF and TXT files are supported" });
  }

  const doc = await createDocument(notebookId, filename, ext);
  const buffer = Buffer.from(await file.arrayBuffer());

  // Fire-and-forget — same pattern used by glossary updates
  void processDocument(doc.id, notebookId, buffer, ext).catch((err) =>
    console.error("RAG processing error for document", doc.id, err),
  );

  return c.json({ documentId: doc.id, status: "pending" }, 202);
});

app.get("/:id/documents", async (c) => {
  const notebookId = Number(c.req.param("id"));
  const docs = await getDocumentsByNotebook(notebookId);
  return c.json(docs);
});

async function deleteDoc(c: any) {
  const documentId = Number(c.req.param("docId"));
  const doc = await getDocument(documentId);
  if (!doc) throw new HTTPException(404, { message: "Document not found" });
  await deleteDocument(documentId);
  return c.json({ deleted: true });
}

app.delete("/:id/documents/:docId", deleteDoc);

app.post("/:id/documents/search", async (c) => {
  const notebookId = Number(c.req.param("id"));

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    throw new HTTPException(400, { message: "Invalid JSON" });
  }

  const parsed = documentSearchSchema.safeParse(body);
  if (!parsed.success) {
    throw new HTTPException(400, { message: parsed.error.errors[0].message });
  }

  const { query, topK } = parsed.data;
  const queryEmbedding = await embedText(query);
  const passages = await searchSimilarChunks(notebookId, queryEmbedding, topK);
  return c.json({ passages });
});

export default app;

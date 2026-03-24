import pdfParse from "pdf-parse";
import { embedBatch } from "../ai/embeddings.js";
import { createChunks } from "../repos/chunkRepo.js";
import {
  updateDocumentStatus,
  getTotalTokensForNotebook,
} from "../repos/documentRepo.js";
import { env } from "../env.js";

const CHUNK_SIZE = 1800; // characters (~450 tokens)
const CHUNK_OVERLAP = 200; // characters

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function chunkText(text: string): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    chunks.push(text.slice(start, end));
    if (end === text.length) break;
    start += CHUNK_SIZE - CHUNK_OVERLAP;
  }
  return chunks;
}

async function extractText(
  buffer: Buffer,
  fileType: string,
): Promise<string> {
  if (fileType === "pdf") {
    const data = await pdfParse(buffer);
    return data.text;
  }
  return buffer.toString("utf-8");
}

export async function processDocument(
  documentId: number,
  notebookId: number,
  buffer: Buffer,
  fileType: string,
): Promise<void> {
  await updateDocumentStatus(documentId, "processing");

  try {
    const text = await extractText(buffer, fileType);
    const chunks = chunkText(text);

    const newTokens = chunks.reduce(
      (sum, c) => sum + estimateTokens(c),
      0,
    );
    const currentTokens = await getTotalTokensForNotebook(notebookId);

    if (currentTokens + newTokens > env.NOTEBOOK_TOKEN_CAP) {
      await updateDocumentStatus(documentId, "error");
      throw new Error(
        `Token cap exceeded: this document would add ~${newTokens} tokens but the notebook cap is ${env.NOTEBOOK_TOKEN_CAP}`,
      );
    }

    const embeddings = await embedBatch(chunks);

    const rows = chunks.map((content, i) => ({
      documentId,
      notebookId,
      chunkIndex: i,
      content,
      tokenCount: estimateTokens(content),
      embedding: embeddings[i],
    }));

    await createChunks(rows);
    await updateDocumentStatus(documentId, "ready", newTokens);
  } catch (err) {
    await updateDocumentStatus(documentId, "error");
    throw err;
  }
}

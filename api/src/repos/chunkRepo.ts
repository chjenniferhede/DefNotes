import { eq, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { documentChunk } from "../db/schema.js";

export interface ChunkInsert {
  documentId: number;
  notebookId: number;
  chunkIndex: number;
  content: string;
  tokenCount: number;
  embedding: number[];
}

export async function createChunks(chunks: ChunkInsert[]) {
  if (chunks.length === 0) return;
  await db.insert(documentChunk).values(chunks);
}

export async function deleteChunksByDocument(documentId: number) {
  await db
    .delete(documentChunk)
    .where(eq(documentChunk.documentId, documentId));
}

export interface ChunkSearchResult {
  content: string;
  chunkIndex: number;
}

export async function searchSimilarChunks(
  notebookId: number,
  queryEmbedding: number[],
  topK: number,
): Promise<ChunkSearchResult[]> {
  const result = await db.execute(
    sql`SELECT content, chunk_index FROM document_chunk
        WHERE notebook_id = ${notebookId}
        ORDER BY embedding <=> ${JSON.stringify(queryEmbedding)}::vector
        LIMIT ${topK}`,
  );
  return (result.rows as { content: string; chunk_index: number }[]).map(
    (r) => ({ content: r.content, chunkIndex: r.chunk_index }),
  );
}

import { eq, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { document, documentChunk } from "../db/schema.js";

export async function createDocument(
  notebookId: number,
  filename: string,
  fileType: string,
) {
  const [row] = await db
    .insert(document)
    .values({ notebookId, filename, fileType })
    .returning();
  return row;
}

export async function getDocumentsByNotebook(notebookId: number) {
  return db
    .select()
    .from(document)
    .where(eq(document.notebookId, notebookId));
}

export async function getDocument(documentId: number) {
  const [row] = await db
    .select()
    .from(document)
    .where(eq(document.id, documentId));
  return row ?? null;
}

export async function updateDocumentStatus(
  documentId: number,
  status: string,
  totalTokens?: number,
) {
  const fields: Record<string, unknown> = { status };
  if (totalTokens !== undefined) fields.totalTokens = totalTokens;
  await db.update(document).set(fields).where(eq(document.id, documentId));
}

export async function deleteDocument(documentId: number) {
  await db.delete(document).where(eq(document.id, documentId));
}

export async function getTotalTokensForNotebook(
  notebookId: number,
): Promise<number> {
  const result = await db.execute(
    sql`SELECT COALESCE(SUM(token_count), 0) AS total FROM document_chunk WHERE notebook_id = ${notebookId}`,
  );
  return Number((result.rows[0] as { total: string }).total);
}

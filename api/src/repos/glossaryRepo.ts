import { db } from "../db/index.js";
import { glossaryEntry } from "../db/schema.js";
import { eq, and } from "drizzle-orm";

export async function getGlossaryEntry(termId: number, notebookId: number) {
  const [row] = await db
    .select()
    .from(glossaryEntry)
    .where(
      and(
        eq(glossaryEntry.termId, termId),
        eq(glossaryEntry.notebookId, notebookId),
      ),
    );
  return row ?? null;
}

export async function insertGlossaryEntry(
  notebookId: number,
  termId: number,
  sourceHash: string,
  content: string,
) {
  await db
    .insert(glossaryEntry)
    .values({ notebookId, termId, sourceHash, content } as any);
}

export async function updateGlossaryEntry(
  id: number,
  sourceHash: string,
  content: string,
) {
  await db
    .update(glossaryEntry)
    .set({ sourceHash, content })
    .where(eq(glossaryEntry.id, id));
}

export async function getEntriesByNotebook(notebookId: number) {
  const rows = await db
    .select()
    .from(glossaryEntry)
    .where(eq(glossaryEntry.notebookId, notebookId));
  return rows;
}

export default null;

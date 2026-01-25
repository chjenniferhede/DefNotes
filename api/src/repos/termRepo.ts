import { db } from "../db/index.js";
import { terms } from "../db/schema.js";
import { eq, desc, and } from "drizzle-orm";

export async function findTerm(notebookId: number, term: string) {
  const [row] = await db
    .select()
    .from(terms)
    .where(and(eq(terms.notebookId, notebookId), eq(terms.term, term)));
  return row ?? null;
}

export async function createTerm(notebookId: number, term: string) {
  await db.insert(terms).values({ notebookId, term } as any);
  const created = await db
    .select()
    .from(terms)
    .orderBy(desc(terms.id))
    .limit(1);
  return created[0].id;
}

export async function getTermById(termId: number) {
  const [row] = await db.select().from(terms).where(eq(terms.id, termId));
  return row ?? null;
}

export async function getTermsByNotebook(notebookId: number) {
  const rows = await db
    .select()
    .from(terms)
    .where(eq(terms.notebookId, notebookId));
  return rows;
}

export async function deleteTerm(termId: number) {
  await db.delete(terms).where(eq(terms.id, termId));
}

export async function updateTerm(termId: number, newTerm: string) {
  await db.update(terms).set({ term: newTerm }).where(eq(terms.id, termId));
}

export default null;

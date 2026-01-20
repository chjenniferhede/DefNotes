import { eq } from "drizzle-orm";
import { glossaryEntry, mentions } from "../db/schema.js";
import { summarizeTermContexts } from "../ai/gemini.js";

// changes: array from extractAndSaveTerms
export async function maybeRunGlossaryUpdates(db: any, changes: Array<{ termId: number; term: string; notebookId: number; excerptsJson: string; excerptsHash: string; changed: boolean }>) {
  if (!changes || !changes.length) return;

  for (const ch of changes) {
    try {
      if (!ch.changed) continue;

      const [entry] = await db.select().from(glossaryEntry).where(eq(glossaryEntry.termId, ch.termId), eq(glossaryEntry.notebookId, ch.notebookId));

      // If entry exists and sourceHash matches, no need to summarize
      if (entry && entry.sourceHash === ch.excerptsHash) continue;

      // Fire-and-forget: summarize in background so we don't block the request
      void processGlossaryUpdate(db, ch.termId, ch.notebookId, ch.term, ch.excerptsJson, ch.excerptsHash);
    } catch (err) {
      console.error("maybeRunGlossaryUpdates error", err);
    }
  }
}

async function processGlossaryUpdate(db: any, termId: number, notebookId: number, term: string, excerptsJson: string, excerptsHash: string) {
  try {
    // parse snippets
    let excerpts: string[] = [];
    try {
      excerpts = JSON.parse(excerptsJson || "[]");
    } catch (err) {
      excerpts = [];
    }

    // limit total snippets/length to keep AI prompt small
    const snippets = excerpts.slice(0, 10);

    const summary = await summarizeTermContexts(term, snippets);

    // upsert glossary entry
    const [existing] = await db.select().from(glossaryEntry).where(eq(glossaryEntry.termId, termId), eq(glossaryEntry.notebookId, notebookId));
    if (!existing) {
      await db.insert(glossaryEntry).values({ notebookId, termId, sourceHash: excerptsHash, content: summary } as any);
    } else {
      await db.update(glossaryEntry).set({ sourceHash: excerptsHash, content: summary }).where(eq(glossaryEntry.id, existing.id));
    }
  } catch (err) {
    console.error("processGlossaryUpdate error", err);
  }
}

export default null;

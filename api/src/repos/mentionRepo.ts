import { db } from "../db/index.js";
import { mentions } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { safeParseExcerpts } from "../lib/glossaryUtils.js";

// Returns mention row or null
export async function getMentionsByTermId(termId: number) {
  const [m] = await db
    .select()
    .from(mentions)
    .where(eq(mentions.termId, termId));
  return m ?? null;
}

// Add snippet to mentions (create if missing). Returns { excerptsJson, changed }
export async function addSnippetToMentions(termId: number, snippet: string) {
  const [m] = await db
    .select()
    .from(mentions)
    .where(eq(mentions.termId, termId));
  const now = new Date();
  if (!m) {
    const excerpts = [{ snippet }];
    const json = JSON.stringify(excerpts);
    await db.insert(mentions).values({
      termId,
      excerptsJson: json,
      updatedAt: now,
    } as any);
    return { excerptsJson: json, changed: true };
  }

  const parsed = safeParseExcerpts(m.excerptsJson);
  const exists = parsed.some((e) => e.snippet === snippet);
  if (exists) {
    await db
      .update(mentions)
      .set({ updatedAt: now })
      .where(eq(mentions.id, m.id));
    return { excerptsJson: m.excerptsJson, changed: false };
  }

  parsed.unshift({ snippet });
  const trimmed = parsed.slice(0, 10);
  const newJson = JSON.stringify(trimmed);
  await db
    .update(mentions)
    .set({ excerptsJson: newJson, updatedAt: now })
    .where(eq(mentions.id, m.id));

  return { excerptsJson: newJson, changed: true };
}

// Upsert mentions for a term with a final excerpts array (entries: {pageId?:number, snippet:string})
// Replaces the stored excerpts for the term with `excerpts` (trimmed to 10) and returns { excerptsJson, changed }
export async function upsertMentionsForTerm(
  termId: number,
  excerpts: Array<{ pageId?: number; snippet: string }>,
) {
  const [m] = await db
    .select()
    .from(mentions)
    .where(eq(mentions.termId, termId));
  const now = new Date();
  const normalized = excerpts.slice(0, 10);
  const newJson = JSON.stringify(normalized);

  if (!m) {
    await db.insert(mentions).values({
      termId,
      excerptsJson: newJson,
      updatedAt: now,
    } as any);
    return { excerptsJson: newJson, changed: true };
  }

  const oldJson = m.excerptsJson ?? "[]";
  if (oldJson === newJson) {
    await db
      .update(mentions)
      .set({ updatedAt: now })
      .where(eq(mentions.id, m.id));
    return { excerptsJson: oldJson, changed: false };
  }

  await db
    .update(mentions)
    .set({ excerptsJson: newJson, updatedAt: now })
    .where(eq(mentions.id, m.id));
  return { excerptsJson: newJson, changed: true };
}

export default null;

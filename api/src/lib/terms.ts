import { eq, desc } from "drizzle-orm";
import { terms, mentions, glossaryEntry } from "../db/schema.js";
import crypto from "crypto";

// Simple single-word term extraction: matches `defn term`
export function extractTermsFromContent(content: string): string[] {
  if (!content) return [];
  const re = /\bdefn\s+([A-Za-z0-9_-]+)\b/gi;
  const found: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    const term = (m[1] || "").trim();
    if (term && !found.includes(term)) found.push(term);
  }
  return found;
}

// Create or get existing term, return its ID
export async function createOrGetTerm(db: any, notebookId: number, term: string): Promise<number> {
  const [existing] = await db.select().from(terms).where(eq(terms.notebookId, notebookId), eq(terms.term, term));
  if (existing) return existing.id;

  await db.insert(terms).values({ notebookId, term } as any);
  const created = await db.select().from(terms).orderBy(desc(terms.id)).limit(1);
  return created[0].id;
}

// Add a mention snippet for a term; returns the updated excerpts JSON and whether it changed
export async function addMentionForTerm(db: any, termId: number, snippet: string): Promise<{ excerptsJson: string; changed: boolean }> {
  const [m] = await db.select().from(mentions).where(eq(mentions.termId, termId));
  const now = new Date();
  if (!m) {
    const excerpts = [snippet];
    await db.insert(mentions).values({ termId, excerptsJson: JSON.stringify(excerpts), updatedAt: now } as any);
    return { excerptsJson: JSON.stringify(excerpts), changed: true };
  }

  let excerpts: string[] = [];
  try {
    excerpts = JSON.parse(m.excerptsJson || "[]");
  } catch (err) {
    excerpts = [];
  }

  if (excerpts.includes(snippet)) {
    // update timestamp only
    await db.update(mentions).set({ updatedAt: now }).where(eq(mentions.id, m.id));
    return { excerptsJson: m.excerptsJson, changed: false };
  }

  // add to front, cap at 10
  excerpts.unshift(snippet);
  excerpts = excerpts.slice(0, 10);
  const newJson = JSON.stringify(excerpts);
  await db.update(mentions).set({ excerptsJson: newJson, updatedAt: now }).where(eq(mentions.id, m.id));
  return { excerptsJson: newJson, changed: true };
}

// The overall function to extract terms from content and save them along with mentions
// Returns an array of changes for terms processed: { termId, term, excerptsJson, excerptsHash, changed }
export async function extractAndSaveTerms(
  db: any,
  notebookId: number,
  pageId: number,
  content: string,
): Promise<Array<{ termId: number; term: string; notebookId: number; excerptsJson: string; excerptsHash: string; changed: boolean }>> {
  const termsFound = extractTermsFromContent(content);
  if (!termsFound.length) return [];

  const results: Array<{ termId: number; term: string; notebookId: number; excerptsJson: string; excerptsHash: string; changed: boolean }> = [];

  for (const t of termsFound) {
    try {
      const termId = await createOrGetTerm(db, notebookId, t);

      // create a small snippet around the first occurrence
      const idx = content.toLowerCase().indexOf(("defn " + t).toLowerCase());
      const radius = 60;
      const start = Math.max(0, idx - radius);
      const end = Math.min(content.length, idx + ("defn ".length + t.length) + radius);
      const snippet = content.substring(start, end).trim();

      const { excerptsJson, changed } = await addMentionForTerm(db, termId, snippet);

      const hash = crypto.createHash("sha256").update(excerptsJson).digest("hex");
      results.push({ termId, term: t, notebookId, excerptsJson, excerptsHash: hash, changed });
    } catch (err) {
      // don't let one failure stop the rest
      console.error("extractAndSaveTerms error for term", t, err);
    }
  }

  return results;
}

export default null;

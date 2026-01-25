import { db } from "../db/index.js";
import { mentions } from "../db/schema.js";
import { eq } from "drizzle-orm";

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
    const excerpts = [snippet];
    await db.insert(mentions).values({
      termId,
      excerptsJson: JSON.stringify(excerpts),
      updatedAt: now,
    } as any);
    return { excerptsJson: JSON.stringify(excerpts), changed: true };
  }

  let excerpts: string[] = [];
  try {
    excerpts = JSON.parse(m.excerptsJson || "[]");
  } catch {
    excerpts = [];
  }

  if (excerpts.includes(snippet)) {
    await db
      .update(mentions)
      .set({ updatedAt: now })
      .where(eq(mentions.id, m.id));
    return { excerptsJson: m.excerptsJson, changed: false };
  }

  excerpts.unshift(snippet);
  const trimmed = excerpts.slice(0, 10);
  const newJson = JSON.stringify(trimmed);
  await db
    .update(mentions)
    .set({ excerptsJson: newJson, updatedAt: now })
    .where(eq(mentions.id, m.id));

  // return updated excerptsJson, return true if the excerpts changed, which they did
  return { excerptsJson: newJson, changed: true };
}

export default null;

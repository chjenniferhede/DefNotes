import { findTerm, createTerm, getTermById } from "../repos/termRepo.js";
import {
  addSnippetToMentions,
  getMentionsByTermId,
} from "../repos/mentionRepo.js";
import { computeExcerptsHash } from "../lib/glossaryUtils.js";

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

export async function collectTermChanges(
  notebookId: number,
  pageId: number,
  content: string,
) {
  const termsFound = extractTermsFromContent(content);
  if (!termsFound.length) return [];

  const results: Array<{
    termId: number;
    term: string;
    notebookId: number;
    excerptsJson: string;
    excerptsHash: string;
    changed: boolean;
  }> = [];

  for (const t of termsFound) {
    try {
      let termRow = await findTerm(notebookId, t);
      let termId: number;
      if (!termRow) {
        termId = await createTerm(notebookId, t);
      } else {
        termId = termRow.id;
      }

      const idx = content.toLowerCase().indexOf(("defn " + t).toLowerCase());
      const radius = 60;
      const start = Math.max(0, idx - radius);
      const end = Math.min(
        content.length,
        idx + ("defn ".length + t.length) + radius,
      );
      const snippet = content.substring(start, end).trim();

      const { excerptsJson, changed } = await addSnippetToMentions(
        termId,
        snippet,
      );
      const excerptsHash = await computeExcerptsHash(excerptsJson);

      results.push({
        termId,
        term: t,
        notebookId,
        excerptsJson,
        excerptsHash,
        changed,
      });
    } catch (err) {
      console.error("collectTermChanges error for term", t, err);
    }
  }

  return results;
}

export async function getMentions(termId: number) {
  return await getMentionsByTermId(termId);
}

export default null;

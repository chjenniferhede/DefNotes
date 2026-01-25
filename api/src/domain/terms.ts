import { findTerm, createTerm } from "../repos/termRepo.js";
import { upsertMentionsForTerm } from "../repos/mentionRepo.js";
import { getPagesByNotebook } from "../repos/pageRepo.js";
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

function buildSnippetAround(content: string, index: number, term: string) {
  const radius = 60;
  const start = Math.max(0, index - radius);
  const end = Math.min(
    content.length,
    index + ("defn ".length + term.length) + radius,
  );
  return content.substring(start, end).trim();
}

export async function collectTermChanges(
  notebookId: number,
  pageId: number,
  content: string,
) {
  const termsFound = extractTermsFromContent(content);
  if (!termsFound.length) return [];

  const pages = await getPagesByNotebook(notebookId);

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

      // Scan all pages in the notebook for occurrences of the bare term (word boundaries)
      const termRegex = new RegExp(`\\b${t}\\b`, "gi");
      const excerpts: Array<{ pageId?: number; snippet: string }> = [];

      // Order pages by updatedDate desc if available, otherwise natural order
      const orderedPages = pages.slice().sort((a: any, b: any) => {
        const ta = a.updatedDate ? Number(a.updatedDate) : 0;
        const tb = b.updatedDate ? Number(b.updatedDate) : 0;
        return tb - ta;
      });

      for (const p of orderedPages) {
        const contentText = p.content || "";
        let m: RegExpExecArray | null;
        const seenSnips = new Set<string>();
        while ((m = termRegex.exec(contentText)) !== null) {
          const snip = buildSnippetAround(contentText, m.index, t);
          if (!snip) continue;
          if (seenSnips.has(snip)) continue;
          seenSnips.add(snip);
          excerpts.push({ pageId: p.id, snippet: snip });
          if (excerpts.length >= 10) break;
        }
        if (excerpts.length >= 10) break;
      }

      const { excerptsJson, changed } = await upsertMentionsForTerm(
        termId,
        excerpts,
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

export default null;

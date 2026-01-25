import {
  getGlossaryEntry,
  insertGlossaryEntry,
  updateGlossaryEntry,
} from "../repos/glossaryRepo.js";
import {
  safeParseExcerpts,
  computeExcerptsHash,
} from "../lib/glossaryUtils.js";
import { summarizeTermContexts } from "../ai/gemini.js";

// Orchestrator: decide which terms need summarization and run in background
export async function maybeRunGlossaryUpdates(
  changes: Array<{
    termId: number;
    term: string;
    notebookId: number;
    excerptsJson: string;
    excerptsHash: string;
    changed: boolean;
  }>,
) {
  if (!changes || !changes.length) return;
  console.log("maybeRunGlossaryUpdates called with changes:", changes[0].term);
  for (const ch of changes) {
    console.log("Enter the loop const ch of changes for termId:", ch.termId);
    try {

      //if (!ch.changed) continue;
      console.log("Checking glossary entry, ch.changed =", ch.changed);
      const entry = await getGlossaryEntry(ch.termId, ch.notebookId);
      console.log("Existing glossary entry:", entry);
      if (entry && entry.sourceHash === ch.excerptsHash) continue;
      console.log("Processing glossary update for termId:", ch.termId);
      void processGlossaryUpdate(
        ch.termId,
        ch.notebookId,
        ch.term,
        ch.excerptsJson,
        ch.excerptsHash,
      );
    } catch (err) {
      console.error("maybeRunGlossaryUpdates error", err);
    }
  }
}

export async function getOrRefreshGlossaryEntry(
  notebookId: number,
  termId: number,
  force = false,
) {
  try {
    // ensure term exists is handled by caller if needed
    const mentionRow = await (async () => {
      // safeFetch mentions without directly importing mentionRepo here
      // service can read via glossaryRepo relations; reuse safeParseExcerpts
      // we'll query mentions via glossaryRepo-less direct query to keep simple here
      return null;
    })();

    // For simplicity in route flow, compute excerpts via DB read inside this service
    // but keep actual DB access abstracted: use getGlossaryEntry to check cache, and call AI when needed
    const entry = await getGlossaryEntry(termId, notebookId);

    // If not forcing and cache exists and has content, return cached
    if (!force && entry && entry.content && entry.content.trim().length > 0) {
      return {
        notebookId,
        termId,
        sourceHash: entry.sourceHash,
        cached: true,
        content: entry.content,
      };
    }

    // In the routes we already fetch mentions; to avoid duplicating logic here, the route will call AI directly via service when needed.
    return null;
  } catch (err) {
    console.error("getOrRefreshGlossaryEntry error", err);
    throw err;
  }
}

async function processGlossaryUpdate(
  termId: number,
  notebookId: number,
  term: string,
  excerptsJson: string,
  excerptsHash: string,
) {
  try {
    let excerpts: string[] = [];
    try {
      excerpts = safeParseExcerpts(excerptsJson as string);
    } catch (err) {
      excerpts = [];
    }

    const snippets = excerpts.slice(0, 10);
    console.log(
      `Summarizing glossary entry for term "${term}" with ${snippets.length} snippets`,
    );
    const summary = await summarizeTermContexts(term, snippets);

    const existing = await getGlossaryEntry(termId, notebookId);
    if (!existing) {
      await insertGlossaryEntry(notebookId, termId, excerptsHash, summary);
    } else {
      await updateGlossaryEntry(existing.id, excerptsHash, summary);
    }
  } catch (err) {
    console.error("processGlossaryUpdate error", err);
  }
}

export default null;

import { Hono } from "hono";
import { sha256 } from "crypto-sha";
import { summarizeTermContexts } from "../ai/gemini.js";
import { safeParseExcerpts } from "../services/glossaryUtils.js";
import {
  getGlossaryEntry,
  createGlossaryEntry,
  updateGlossaryEntry,
  getEntriesByNotebook,
} from "../repos/glossaryRepo.js";
import { getTermById } from "../repos/termRepo.js";
import { getMentionByTermId } from "../repos/mentionRepo.js";

const app = new Hono();

function parseId(value: string) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

// Get the glossary entries for a notebook
app.get("/:id/glossary", async (c) => {
  const notebookId = Number(c.req.param("id"));
  const entries = await getEntriesByNotebook(notebookId);
  return c.json(entries);
});

// Term-specific glossary retrieval: returns cached entry or generates via AI
app.get("/:id/glossary/:termId", async (c) => {
  const notebookId = parseId(c.req.param("id"));
  const termId = parseId(c.req.param("termId"));

  if (notebookId == null || termId == null) {
    return c.json({ error: "Invalid notebookId or termId" }, 400);
  }

  try {
    const termRow = await getTermById(termId);
    if (!termRow || termRow.notebookId !== notebookId) {
      return c.json({ error: "Term not found in this notebook" }, 404);
    }

    const mentionRow = await getMentionByTermId(termId);
    const excerptEntries = safeParseExcerpts(mentionRow?.excerptsJson);
    const sourceHash = await sha256(JSON.stringify(excerptEntries));

    const cached = await getGlossaryEntry(termId, notebookId);

    if (
      cached &&
      cached.sourceHash === sourceHash &&
      cached.content &&
      cached.content.trim().length > 0
    ) {
      return c.json({
        notebookId,
        termId,
        term: termRow.term,
        sourceHash,
        cached: true,
        excerptsCount: excerptEntries.length,
        content: cached.content,
      });
    }

    const excerptSnippets = excerptEntries.map((e) => e.snippet);
    const content = await summarizeTermContexts(termRow.term, excerptSnippets);

    if (!cached) {
      await createGlossaryEntry(notebookId, termId, sourceHash, content);
    } else {
      await updateGlossaryEntry(cached.id, sourceHash, content);
    }

    return c.json({
      notebookId,
      termId,
      term: termRow.term,
      sourceHash,
      cached: false,
      excerptsCount: excerptEntries.length,
      content,
    });
  } catch (err) {
    console.error(err);
    return c.json({ error: "Failed to generate glossary entry" }, 500);
  }
});

// Force-refresh a glossary entry (regenerate even if hashes match)
app.post("/:id/glossary/:termId", async (c) => {
  const notebookId = parseId(c.req.param("id"));
  const termId = parseId(c.req.param("termId"));

  if (notebookId == null || termId == null) {
    return c.json({ error: "Invalid notebookId or termId" }, 400);
  }

  try {
    const termRow = await getTermById(termId);
    if (!termRow || termRow.notebookId !== notebookId) {
      return c.json({ error: "Term not found in this notebook" }, 404);
    }

    const mentionRow = await getMentionByTermId(termId);
    const excerptEntries = safeParseExcerpts(mentionRow?.excerptsJson);
    const sourceHash = await sha256(JSON.stringify(excerptEntries));

    const excerptSnippets = excerptEntries.map((e) => e.snippet);
    const content = await summarizeTermContexts(termRow.term, excerptSnippets);

    const existing = await getGlossaryEntry(termId, notebookId);
    if (!existing) {
      await createGlossaryEntry(notebookId, termId, sourceHash, content);
    } else {
      await updateGlossaryEntry(existing.id, sourceHash, content);
    }

    return c.json({
      notebookId,
      termId,
      term: termRow.term,
      sourceHash,
      forced: true,
      excerptsCount: excerptEntries.length,
      content,
    });
  } catch (err) {
    console.error(err);
    return c.json({ error: "Failed to refresh glossary entry" }, 500);
  }
});

export default app;

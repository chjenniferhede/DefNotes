import { Hono } from "hono";
import { db } from "../db/index.js";
import {
  notebook,
  page,
  mentions,
  terms,
  glossaryEntry,
} from "../db/schema.js";
import { eq, desc, and } from "drizzle-orm";
import { sha256 } from "crypto-sha";

import { summarizeTermContexts } from "../ai/gemini"; // your existing AI helper

const app = new Hono();

// Get the glossary entries for a notebook
app.get("/:id/glossary", async (c) => {
  const notebookId = Number(c.req.param("id"));
  const entries = await db
    .select()
    .from(glossaryEntry)
    .where(eq(glossaryEntry.notebookId, notebookId));
  return c.json(entries);
});

// Update or create a glossary entry for a term in a notebook
function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// This function safely parses id parameters into numbers
function parseId(value: string) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

// This function safely parses excerptsJson into string[]
function safeParseExcerpts(excerptsJson: string | null | undefined): string[] {
  if (!excerptsJson) return [];
  try {
    const parsed = JSON.parse(excerptsJson);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((x) => String(x));
  } catch {
    return [];
  }
}

/**
 * GET: Returns glossary entry for a term.
 * - Computes sourceHash from mentions.excerptsJson
 * - If cached glossary_entry.sourceHash matches -> returns cached content
 * - Else calls Gemini, updates glossary_entry, returns fresh content
 */
export async function GET(
  _req: Request,
  { params }: { params: { notebookId: string; termId: string } },
) {
  const notebookId = parseId(params.notebookId);
  const termId = parseId(params.termId);

  if (notebookId == null || termId == null) {
    return json({ error: "Invalid notebookId or termId" }, 400);
  }

  try {
    // 1) Ensure term exists and belongs to notebook
    const termRow = await db
      .select({
        id: terms.id,
        term: terms.term,
        notebookId: terms.notebookId,
      })
      .from(terms)
      .where(and(eq(terms.id, termId), eq(terms.notebookId, notebookId)))
      .get();

    if (!termRow) {
      return json({ error: "Term not found in this notebook" }, 404);
    }

    // 2) Load mentions (excerpts)
    const mentionRow = await db
      .select({ excerptsJson: mentions.excerptsJson })
      .from(mentions)
      .where(eq(mentions.termId, termId))
      .get();

    const excerpts = safeParseExcerpts(mentionRow?.excerptsJson);

    // 3) Compute sourceHash from excerpts
    const sourceHash = await sha256(JSON.stringify(excerpts));

    // 4) Read cached glossary entry (if any)
    const cached = await db
      .select({
        id: glossaryEntry.id,
        sourceHash: glossaryEntry.sourceHash,
        content: glossaryEntry.content,
      })
      .from(glossaryEntry)
      .where(
        and(
          eq(glossaryEntry.notebookId, notebookId),
          eq(glossaryEntry.termId, termId),
        ),
      )
      .get();

    // 5) Cache hit
    if (
      cached &&
      cached.sourceHash === sourceHash &&
      cached.content.trim().length > 0
    ) {
      return json({
        notebookId,
        termId,
        term: termRow.term,
        sourceHash,
        cached: true,
        excerptsCount: excerpts.length,
        content: cached.content,
      });
    }

    // 6) Cache miss: call AI (server-only)
    const content = await summarizeTermContexts(termRow.term, excerpts);

    // 7) Upsert glossary entry
    if (!cached) {
      await db.insert(glossaryEntry).values({
        notebookId,
        termId,
        sourceHash,
        content,
      });
    } else {
      await db
        .update(glossaryEntry)
        .set({ sourceHash, content })
        .where(eq(glossaryEntry.id, cached.id));
    }

    return json({
      notebookId,
      termId,
      term: termRow.term,
      sourceHash,
      cached: false,
      excerptsCount: excerpts.length,
      content,
    });
  } catch (err) {
    console.error(err);
    return json({ error: "Failed to generate glossary entry" }, 500);
  }
}

/**
 * POST: Force refresh (regenerates even if hash matches).
 * Useful for a "Refresh" button.
 */
export async function POST(
  _req: Request,
  { params }: { params: { notebookId: string; termId: string } },
) {
  const notebookId = parseId(params.notebookId);
  const termId = parseId(params.termId);

  if (notebookId == null || termId == null) {
    return json({ error: "Invalid notebookId or termId" }, 400);
  }

  try {
    // Verify term belongs to notebook
    const termRow = await db
      .select({ id: terms.id, term: terms.term })
      .from(terms)
      .where(and(eq(terms.id, termId), eq(terms.notebookId, notebookId)))
      .get();

    if (!termRow) {
      return json({ error: "Term not found in this notebook" }, 404);
    }

    const mentionRow = await db
      .select({ excerptsJson: mentions.excerptsJson })
      .from(mentions)
      .where(eq(mentions.termId, termId))
      .get();

    const excerpts = safeParseExcerpts(mentionRow?.excerptsJson);
    const sourceHash = await sha256(JSON.stringify(excerpts));

    const content = await summarizeTermContexts(termRow.term, excerpts);

    const existing = await db
      .select({ id: glossaryEntry.id })
      .from(glossaryEntry)
      .where(
        and(
          eq(glossaryEntry.notebookId, notebookId),
          eq(glossaryEntry.termId, termId),
        ),
      )
      .get();

    if (!existing) {
      await db.insert(glossaryEntry).values({
        notebookId,
        termId,
        sourceHash,
        content,
      });
    } else {
      await db
        .update(glossaryEntry)
        .set({ sourceHash, content })
        .where(eq(glossaryEntry.id, existing.id));
    }

    return json({
      notebookId,
      termId,
      term: termRow.term,
      sourceHash,
      forced: true,
      excerptsCount: excerpts.length,
      content,
    });
  } catch (err) {
    console.error(err);
    return json({ error: "Failed to refresh glossary entry" }, 500);
  }
}

export default app;

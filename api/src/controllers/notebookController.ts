import { db } from "../db/index.js";
import { notebook, page } from "../db/schema.js";
import { eq, desc } from "drizzle-orm";
import {
  notebookCreateSchema,
  notebookUpdateSchema,
  pageCreateSchema,
  pageUpdateSchema,
} from "../lib/validators.js";
import { collectTermChanges } from "../domain/terms.js";
import { maybeRunGlossaryUpdates } from "../domain/glossary-update.js";

export async function listNotebooks(c: any) {
  const includePages = c.req.query("includePages");
  const nbs = await db.select().from(notebook);

  if (!includePages) return c.json(nbs);

  const results = [] as any[];
  for (const nb of nbs) {
    const pages = await db
      .select()
      .from(page)
      .where(eq(page.notebookId, nb.id));
    results.push({ ...nb, pages });
  }
  return c.json(results);
}

export async function getNotebook(c: any) {
  const id = Number(c.req.param("id"));
  const [nb] = await db.select().from(notebook).where(eq(notebook.id, id));
  if (!nb) return c.text("Not found", 404);
  return c.json(nb);
}

export async function createNotebook(c: any) {
  let body: any;
  try {
    body = await c.req.json();
  } catch (err) {
    return c.json({ error: "Invalid JSON" }, 400);
  }

  const parsed = notebookCreateSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.errors }, 400);

  const title = parsed.data.title ?? "Untitled";
  const now = new Date();
  await db
    .insert(notebook)
    .values({ title, createDate: now, updatedDate: now } as any);

  const created = await db
    .select()
    .from(notebook)
    .orderBy(desc(notebook.id))
    .limit(1);
  return c.json(created[0]);
}

export async function updateNotebook(c: any) {
  const id = Number(c.req.param("id"));
  let body: any;
  try {
    body = await c.req.json();
  } catch (err) {
    return c.json({ error: "Invalid JSON" }, 400);
  }

  const parsed = notebookUpdateSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.errors }, 400);

  const title = parsed.data.title;
  await db
    .update(notebook)
    .set({ title, updatedDate: new Date() })
    .where(eq(notebook.id, id));
  const [updated] = await db.select().from(notebook).where(eq(notebook.id, id));
  return c.json(updated);
}

export async function deleteNotebook(c: any) {
  const id = Number(c.req.param("id"));
  await db.delete(notebook).where(eq(notebook.id, id));
  return c.text("Deleted");
}

export async function listPages(c: any) {
  const notebookId = Number(c.req.param("id"));
  const pages = await db
    .select()
    .from(page)
    .where(eq(page.notebookId, notebookId));
  return c.json(pages);
}

export async function createPage(c: any) {
  const notebookId = Number(c.req.param("id"));
  let body: any;
  try {
    body = await c.req.json();
  } catch (err) {
    return c.json({ error: "Invalid JSON" }, 400);
  }

  const parsed = pageCreateSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.errors }, 400);

  const title = parsed.data.title ?? "Untitled";
  const content = parsed.data.content ?? "";
  const now = new Date();
  await db.insert(page).values({
    notebookId,
    title,
    content,
    createDate: now,
    updatedDate: now,
  } as any);

  const created = await db.select().from(page).orderBy(desc(page.id)).limit(1);
  try {
    if (created && created[0]) {
      const changes = await collectTermChanges(
        notebookId,
        created[0].id,
        created[0].content,
      );
      if (parsed.data.explicitSave) void maybeRunGlossaryUpdates(changes);
    }
  } catch (err) {
    console.error("Error extracting/saving terms after page create", err);
  }
  return c.json(created[0]);
}

export async function getPage(c: any) {
  const pageId = Number(c.req.param("pageId"));
  const [p] = await db.select().from(page).where(eq(page.id, pageId));
  if (!p) return c.text("Not found", 404);
  return c.json(p);
}

export async function updatePage(c: any) {
  const pageId = Number(c.req.param("pageId"));
  const notebookId = Number(c.req.param("id"));
  let body: any;
  try {
    body = await c.req.json();
  } catch (err) {
    return c.json({ error: "Invalid JSON" }, 400);
  }

  const parsed = pageUpdateSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.errors }, 400);

  const fields: any = {};
  if (parsed.data.title !== undefined) fields.title = parsed.data.title;
  if (parsed.data.content !== undefined) fields.content = parsed.data.content;
  fields.updatedDate = new Date();

  try {
    await db.update(page).set(fields).where(eq(page.id, pageId));
    const [updated] = await db.select().from(page).where(eq(page.id, pageId));
    try {
      if (updated) {
        const changes = await collectTermChanges(
          notebookId,
          updated.id,
          updated.content,
        );
        if (parsed.data.explicitSave) void maybeRunGlossaryUpdates(changes);
      }
    } catch (err) {
      console.error("Error extracting/saving terms after page update", err);
    }
    return c.json(updated);
  } catch (err) {
    console.error("DB update error for page", pageId, err);
    return c.json({ error: "Internal server error" }, 500);
  }
}

export async function deletePage(c: any) {
  const pageId = Number(c.req.param("pageId"));
  await db.delete(page).where(eq(page.id, pageId));
  return c.text("Deleted");
}

export default null;

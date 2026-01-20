import { Hono } from "hono";
import { db } from "../db/index.js";
import { notebook, page } from "../db/schema.js";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { extractAndSaveTerms } from "../lib/terms.js";
import { maybeRunGlossaryUpdates } from "../lib/glossary.js";

const app = new Hono();

const notebookCreateSchema = z.object({
  title: z.string().min(1).optional(),
});

const notebookUpdateSchema = z.object({
  title: z.string().min(1).optional(),
});

const pageCreateSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  explicitSave: z.boolean().optional(),
});

const pageUpdateSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  explicitSave: z.boolean().optional(),
});

// --- Notebook routes ---
// List all notebooks
app.get("/", async (c) => {
  const includePages = c.req.query("includePages");
  const nbs = await db.select().from(notebook);

  if (!includePages) return c.json(nbs);

  // include pages for each notebook
  const results = [] as any[];
  for (const nb of nbs) {
    const pages = await db.select().from(page).where(eq(page.notebookId, nb.id));
    results.push({ ...nb, pages });
  }
  return c.json(results);
});

// Get single notebook
app.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const [nb] = await db.select().from(notebook).where(eq(notebook.id, id));
  if (!nb) return c.text("Not found", 404);
  return c.json(nb);
});

// Create notebook
app.post("/", async (c) => {
  let body: any;
  try {
    body = await c.req.json();
  } catch (err) {
    return c.json({ error: "Invalid JSON" }, 400);
  }

  const parsed = notebookCreateSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.errors }, 400);
  }

  const title = parsed.data.title ?? "Untitled";
  const now = new Date();
  const result = await db.insert(notebook).values({
    title,
    createDate: now,
    updatedDate: now,
  } as any);
  // result may not contain inserted id depending on driver; select last row
  const created = await db
    .select()
    .from(notebook)
    .orderBy(desc(notebook.id))
    .limit(1);
  return c.json(created[0]);
});

// Update notebook
app.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  let body: any;
  try {
    body = await c.req.json();
  } catch (err) {
    return c.json({ error: "Invalid JSON" }, 400);
  }

  const parsed = notebookUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.errors }, 400);
  }

  const title = parsed.data.title;
  await db
    .update(notebook)
    .set({ title, updatedDate: new Date() })
    .where(eq(notebook.id, id));
  const [updated] = await db.select().from(notebook).where(eq(notebook.id, id));
  return c.json(updated);
});

// Delete notebook (cascade will remove pages)
app.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  await db.delete(notebook).where(eq(notebook.id, id));
  return c.text("Deleted");
});

// --- Page routes nested under notebook ---
// List pages for a notebook
app.get("/:id/pages", async (c) => {
  const notebookId = Number(c.req.param("id"));
  const pages = await db
    .select()
    .from(page)
    .where(eq(page.notebookId, notebookId));
  return c.json(pages);
});

// Create a page for a notebook
app.post("/:id/pages", async (c) => {
  const notebookId = Number(c.req.param("id"));
  let body: any;
  try {
    body = await c.req.json();
  } catch (err) {
    return c.json({ error: "Invalid JSON" }, 400);
  }

  const parsed = pageCreateSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.errors }, 400);
  }

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
      // extract terms and save mentions for this notebook/page
      const changes = await extractAndSaveTerms(db, notebookId, created[0].id, created[0].content);
      // if this was an explicit save, trigger glossary updates (do not block response)
      if (parsed.data.explicitSave) {
        void maybeRunGlossaryUpdates(db, changes);
      }
    }
  } catch (err) {
    console.error("Error extracting/saving terms after page create", err);
  }
  return c.json(created[0]);
});

// Get single page under notebook
app.get("/:id/pages/:pageId", async (c) => {
  const pageId = Number(c.req.param("pageId"));
  const [p] = await db.select().from(page).where(eq(page.id, pageId));
  if (!p) return c.text("Not found", 404);
  return c.json(p);
});

// Update a page
app.put("/:id/pages/:pageId", async (c) => {
  const pageId = Number(c.req.param("pageId"));
  const notebookId = Number(c.req.param("id"));
  let body: any;
  try {
    body = await c.req.json();
  } catch (err) {
    return c.json({ error: "Invalid JSON" }, 400);
  }

  const parsed = pageUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.errors }, 400);
  }

  const fields: any = {};
  if (parsed.data.title !== undefined) fields.title = parsed.data.title;
  if (parsed.data.content !== undefined) fields.content = parsed.data.content;
  fields.updatedDate = new Date();

  try {
    await db.update(page).set(fields).where(eq(page.id, pageId));
    const [updated] = await db.select().from(page).where(eq(page.id, pageId));
    try {
      if (updated) {
        const changes = await extractAndSaveTerms(db, notebookId, updated.id, updated.content);
        if (parsed.data.explicitSave) {
          void maybeRunGlossaryUpdates(db, changes);
        }
      }
    } catch (err) {
      console.error("Error extracting/saving terms after page update", err);
    }
    return c.json(updated);
  } catch (err) {
    console.error("DB update error for page", pageId, err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Delete a page
app.delete("/:id/pages/:pageId", async (c) => {
  const pageId = Number(c.req.param("pageId"));
  await db.delete(page).where(eq(page.id, pageId));
  return c.text("Deleted");
});

export default app;

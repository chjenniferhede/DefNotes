import { Hono } from "hono";
import { db } from "../db/index.js";
import { notebook, page } from "../db/schema.js";
import { eq, desc } from "drizzle-orm";

const app = new Hono();

// --- Notebook routes ---
// List all notebooks
app.get("/", async (c) => {
  const nbs = await db.select().from(notebook);
  return c.json(nbs);
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
  const body = await c.req.json();
  const title = body.title ?? "Untitled";
  const now = new Date();
  const result = await db
    .insert(notebook)
    .values({ title, createDate: now, updatedDate: now } as any);
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
  const body = await c.req.json();
  const title = body.title;
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
  const body = await c.req.json();
  const title = body.title ?? "Untitled";
  const content = body.content ?? "";
  const now = new Date();
  await db.insert(page).values({
    notebookId,
    title,
    content,
    createDate: now,
    updatedDate: now,
  } as any);
  const created = await db.select().from(page).orderBy(desc(page.id)).limit(1);
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
  const body = await c.req.json();
  const fields: any = {};
  if (body.title !== undefined) fields.title = body.title;
  if (body.content !== undefined) fields.content = body.content;
  fields.updatedDate = Date.now();
  await db.update(page).set(fields).where(eq(page.id, pageId));
  const [updated] = await db.select().from(page).where(eq(page.id, pageId));
  return c.json(updated);
});

// Delete a page
app.delete("/:id/pages/:pageId", async (c) => {
  const pageId = Number(c.req.param("pageId"));
  await db.delete(page).where(eq(page.id, pageId));
  return c.text("Deleted");
});

export default app;

import { Hono } from "hono";
import * as notebookController from "../controllers/notebookController.js";

const app = new Hono();

// Notebook routes (thin wiring to controllers)
app.get("/", notebookController.listNotebooks);
app.get("/:id", notebookController.getNotebook);
app.post("/", notebookController.createNotebook);
app.put("/:id", notebookController.updateNotebook);
app.delete("/:id", notebookController.deleteNotebook);

// Pages
app.get("/:id/pages", notebookController.listPages);
app.post("/:id/pages", notebookController.createPage);
app.get("/:id/pages/:pageId", notebookController.getPage);
app.put("/:id/pages/:pageId", notebookController.updatePage);
app.delete("/:id/pages/:pageId", notebookController.deletePage);

export default app;

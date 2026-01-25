import { Hono } from "hono";

const app = new Hono();

import * as glossaryController from "../controllers/glossaryController.js";

// Get the glossary entries for a notebook
app.get("/:id/glossary", glossaryController.listEntries);

// Term-specific glossary retrieval: returns cached entry or generates via AI
app.get("/:id/glossary/:termId", glossaryController.getEntry);

// Force-refresh a glossary entry (regenerate even if hashes match)
app.post("/:id/glossary/:termId", glossaryController.refreshEntry);

export default app;

import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { sql } from "drizzle-orm";
import notebookRoutes from "./routes/notebooks.js";
import glossaryRoutes from "./routes/glossary.js";
import documentRoutes from "./routes/documents.js";
import { db } from "./db/index.js";
import { env } from "./env.js";

const app = new Hono();

app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Set-Cookie"],
  }),
);
app.use(logger());

app.get("/health", async (c) => {
  try {
    await db.execute(sql`SELECT 1`);
    return c.json({ status: "ok" });
  } catch {
    return c.json({ status: "error" }, 503);
  }
});

app.get("/", (c) => c.text("Hello DefNote!"));

app.route("/notebooks", notebookRoutes);
app.route("/notebooks", glossaryRoutes);
app.route("/notebooks", documentRoutes);

app.onError((err, c) => {
  console.error({ error: err.message, stack: err.stack });
  if (err instanceof HTTPException) return err.getResponse();
  return c.json({ error: "Internal server error" }, 500);
});

app.notFound((c) => c.json({ error: "Not found" }, 404));

export default app;

import { Hono } from "hono";
import { cors } from "hono/cors";
import notebookRoutes from "./routes/notebook.js";
import glossaryRoutes from "./routes/glossary.js";
import { logger } from "hono/logger";
//import "dotenv/config";
const app = new Hono();
// middleware to allow requests from any origin
app.use(
  "/*",
  cors({
    origin: (origin) => origin, // Allow any origin
    credentials: true, // Allow credentials
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Set-Cookie"],
  }),
);
app.use(logger());
// the base request returns this
app.get("/", (c) => c.text("Hello DefNote!"));
// mount notebooks router at /notebooks
app.route("/notebooks", notebookRoutes);
// mount glossary routes under /notebooks so endpoints become /notebooks/:id/glossary
app.route("/notebooks", glossaryRoutes);
export default app;

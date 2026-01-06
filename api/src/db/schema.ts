import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { content } from "../../../web/tailwind.config.cjs";

export const notebook = sqliteTable("notebook", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  createDate: integer("create_date", { mode: "timestamp" }),
  updatedDate: integer("updated_date", { mode: "timestamp" }),
  numberPage: integer("number_page").notNull().default(0),
});

export const page = sqliteTable("page", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  notebookId: integer("notebook_id")
    .notNull()
    .references(() => notebook.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  createDate: integer("create_date", { mode: "timestamp" }),
  updatedDate: integer("updated_date", { mode: "timestamp" }),
});

export const terms = sqliteTable("terms", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  notebookId: integer("notebook_id")
    .notNull()
    .references(() => notebook.id, { onDelete: "cascade" }),
  term: text("term").notNull(),
});

// This table holds the mentions of a term that was specified by user found in pages
export const mentions = sqliteTable("mentions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  termId: integer("term_id")
    .notNull()
    .references(() => terms.id, { onDelete: "cascade" }),
  excerptsJson: text("excerpts_json").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

// this is a special page of glossary entries, one per term
// the content is a bulletpoint list of AI-summarized notes for that term
export const glossaryEntry = sqliteTable("glossary_entry", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  notebookId: integer("notebook_id")
    .notNull()
    .references(() => notebook.id, { onDelete: "cascade" }),
  termId: integer("term_id")
    .notNull()
    .references(() => terms.id, { onDelete: "cascade" }),
  sourceHash: text("source_hash").notNull(),
  content: text("content").notNull().default(""),
});

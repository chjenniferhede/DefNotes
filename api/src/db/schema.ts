import {
  pgTable,
  text,
  integer,
  serial,
  timestamp,
  customType,
} from "drizzle-orm/pg-core";

const vector = customType<{
  data: number[];
  driverData: string;
  config: { dimensions: number };
}>({
  dataType(config) {
    return `vector(${config?.dimensions ?? 768})`;
  },
  toDriver(value: number[]): string {
    return JSON.stringify(value);
  },
  fromDriver(value: string): number[] {
    if (typeof value === "string") return JSON.parse(value);
    return value as unknown as number[];
  },
});

export const notebook = pgTable("notebook", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  createDate: timestamp("create_date"),
  updatedDate: timestamp("updated_date"),
  numberPage: integer("number_page").notNull().default(0),
});

export const page = pgTable("page", {
  id: serial("id").primaryKey(),
  notebookId: integer("notebook_id")
    .notNull()
    .references(() => notebook.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  createDate: timestamp("create_date"),
  updatedDate: timestamp("updated_date"),
});

export const terms = pgTable("terms", {
  id: serial("id").primaryKey(),
  notebookId: integer("notebook_id")
    .notNull()
    .references(() => notebook.id, { onDelete: "cascade" }),
  term: text("term").notNull(),
});

// This table holds the mentions of a term that was specified by user found in pages
export const mentions = pgTable("mentions", {
  id: serial("id").primaryKey(),
  termId: integer("term_id")
    .notNull()
    .references(() => terms.id, { onDelete: "cascade" }),
  excerptsJson: text("excerpts_json").notNull(),
  updatedAt: timestamp("updated_at"),
});

export const document = pgTable("document", {
  id: serial("id").primaryKey(),
  notebookId: integer("notebook_id")
    .notNull()
    .references(() => notebook.id, { onDelete: "cascade" }),
  filename: text("filename").notNull(),
  fileType: text("file_type").notNull(),
  totalTokens: integer("total_tokens").notNull().default(0),
  status: text("status").notNull().default("pending"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const documentChunk = pgTable("document_chunk", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id")
    .notNull()
    .references(() => document.id, { onDelete: "cascade" }),
  notebookId: integer("notebook_id")
    .notNull()
    .references(() => notebook.id, { onDelete: "cascade" }),
  chunkIndex: integer("chunk_index").notNull(),
  content: text("content").notNull(),
  tokenCount: integer("token_count").notNull(),
  embedding: vector("embedding", { dimensions: 768 }),
});

// this is a special page of glossary entries, one per term
// the content is a bulletpoint list of AI-summarized notes for that term
export const glossaryEntry = pgTable("glossary_entry", {
  id: serial("id").primaryKey(),
  notebookId: integer("notebook_id")
    .notNull()
    .references(() => notebook.id, { onDelete: "cascade" }),
  termId: integer("term_id")
    .notNull()
    .references(() => terms.id, { onDelete: "cascade" }),
  sourceHash: text("source_hash").notNull(),
  content: text("content").notNull().default(""),
});

import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";


export const notebook = sqliteTable(
    "notebook",{
        id: integer("id").primaryKey({ autoIncrement: true }),
        title: text("title").notNull(),
        createDate: integer("create_date", { mode: "timestamp" }),
        updatedDate: integer("updated_date", { mode: "timestamp" }),
        numberCards: integer("number_cards").notNull().default(0),
    },
);

export const page = sqliteTable(
    "page",{
        id: integer("id").primaryKey({ autoIncrement: true }),
        notebookId: integer("notebook_id")
            .notNull()
            .references(() => notebook.id, { onDelete: "cascade" }),
        title: text("title").notNull(),
        content: text("content").notNull().default(""),
        createDate: integer("create_date", { mode: "timestamp" }),
        updatedDate: integer("updated_date", { mode: "timestamp" }),
    },
);

export const terms = sqliteTable(
    "terms",{
        id: integer("id").primaryKey({ autoIncrement: true }),
        notebookId: integer("notebook_id")
            .notNull()
            .references(() => notebook.id, { onDelete: "cascade" }),
        term: text("term").notNull(),
    },
);

export const mentions = sqliteTable(
    "mentions",{
        id: integer("id").primaryKey({ autoIncrement: true }),
        termId: integer("term_id")
            .notNull()
            .references(() => terms.id, { onDelete: "cascade" }),
        excerptsJson: text("excerpts_json").notNull(),
        updatedAt: integer("updated_at", { mode: "timestamp" }),
    },
);
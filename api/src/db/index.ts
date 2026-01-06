import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

// create the actual data base sqlite.db and establish connection
export const connection = new Database("sqlite.db");

// create the drizzle wrapped database
export const db = drizzle(connection, { schema });

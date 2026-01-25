import { db } from "../db/index.js";
import { page } from "../db/schema.js";
import { eq } from "drizzle-orm";

export async function getPagesByNotebook(notebookId: number) {
  const rows = await db
    .select({
      id: page.id,
      content: page.content,
      updatedDate: page.updatedDate,
    })
    .from(page)
    .where(eq(page.notebookId, notebookId));
  return rows;
}

export default null;

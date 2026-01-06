import { db } from "./index.js";
import { notebook, page } from "./schema.js";
import { faker } from "@faker-js/faker";
import { eq, desc } from "drizzle-orm";

async function seed() {
  const nbCount = faker.number.int({ min: 2, max: 4 });

  for (let i = 0; i < nbCount; i++) {
    const title = faker.lorem.words(faker.number.int({ min: 2, max: 5 }));
    const now = new Date();

    await db.insert(notebook).values({
      title,
      createDate: now,
      updatedDate: now,
      numberPage: 0,
    } as any);

    const [created] = await db.select().from(notebook).orderBy(desc(notebook.id)).limit(1);

    const pagesCount = faker.number.int({ min: 7, max: 10 });
    for (let p = 0; p < pagesCount; p++) {
      const ptitle = faker.lorem.sentence();
      const content = faker.lorem.paragraphs(faker.number.int({ min: 1, max: 3 }));
      const pnow = new Date();
      await db.insert(page).values({
        notebookId: created.id,
        title: ptitle,
        content,
        createDate: pnow,
        updatedDate: pnow,
      } as any);
    }

    await db.update(notebook).set({ numberPage: pagesCount }).where(eq(notebook.id, created.id));

    console.log(`Created notebook ${created.id} (${title}) with ${pagesCount} pages`);
  }

  console.log(`Seeded ${nbCount} notebooks.`);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});

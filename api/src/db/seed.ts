import { db, pool } from "./index.js";
import { notebook, page } from "./schema.js";
import { faker } from "@faker-js/faker";
import { eq, desc } from "drizzle-orm";

const biologySubjects = [
  "Physiology",
  "Psychology",
  "Neuroscience",
  "Genetics",
  "Biochemistry",
  "Anatomy",
  "Immunology",
  "Microbiology",
  "Ecology",
  "Developmental Biology",
];

const shortPageTitles = [
  "Introduction",
  "Overview",
  "Summary",
  "Key Points",
  "Foundations",
  "Basics",
  "Core Concepts",
  "Review",
  "Deep Dive",
  "Analysis",
  "Mechanisms",
  "Structure",
  "Function",
  "Processes",
  "Systems",
  "Pathways",
  "Regulation",
  "Applications",
  "Case Study",
  "Examples",
];

async function seed() {
  // Clear existing data
  await db.delete(page);
  await db.delete(notebook);
  console.log("Cleared existing data.");

  const nbCount = faker.number.int({ min: 2, max: 4 });

  for (let i = 0; i < nbCount; i++) {
    const title = faker.helpers.arrayElement(biologySubjects);
    const now = new Date();

    const [created] = await db
      .insert(notebook)
      .values({
        title,
        createDate: now,
        updatedDate: now,
        numberPage: 0,
      })
      .returning();

    const pagesCount = faker.number.int({ min: 7, max: 10 });
    for (let p = 0; p < pagesCount; p++) {
      const ptitle = faker.helpers.arrayElement(shortPageTitles);
      const content = faker.lorem.paragraphs(
        faker.number.int({ min: 1, max: 3 }),
      );
      const pnow = new Date();
      await db.insert(page).values({
        notebookId: created.id,
        title: ptitle,
        content,
        createDate: pnow,
        updatedDate: pnow,
      });
    }

    await db
      .update(notebook)
      .set({ numberPage: pagesCount })
      .where(eq(notebook.id, created.id));

    console.log(
      `Created notebook ${created.id} (${title}) with ${pagesCount} pages`,
    );
  }

  console.log(`Seeded ${nbCount} notebooks.`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => pool.end());

import { z } from "zod";

// Validation schemas (moved from routes)
const notebookCreateSchema = z.object({
  title: z.string().min(1).optional(),
});

const notebookUpdateSchema = z.object({
  title: z.string().min(1).optional(),
});

const pageCreateSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  explicitSave: z.boolean().optional(),
});

const pageUpdateSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  explicitSave: z.boolean().optional(),
});

export {
  notebookCreateSchema,
  notebookUpdateSchema,
  pageCreateSchema,
  pageUpdateSchema,
};

export type Page = { id: string; title: string; content?: string };
export type Notebook = { id: string; title: string; pages: Page[] };

export type GlossaryEntry = {
  id: number;
  termId: number;
  term: string;
  content: string;
  sourceHash: string;
};

export type CreateNotebookPayload = { title: string };
export type UpdateNotebookPayload = Partial<Notebook>;

export type CreatePagePayload = {
  title: string;
  content?: string;
  explicitSave?: boolean;
};
export type UpdatePagePayload = Partial<Page> & { explicitSave?: boolean };

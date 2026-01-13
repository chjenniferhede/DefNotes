export type Page = { id: string; title: string; content?: string };
export type Notebook = { id: string; title: string; pages: Page[] };

export type CreateNotebookPayload = { title: string };
export type UpdateNotebookPayload = Partial<Notebook>;

export type CreatePagePayload = { title: string };
export type UpdatePagePayload = Partial<Page>;

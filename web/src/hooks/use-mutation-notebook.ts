import * as api from "../data/api";
import {
  fetchNotebooks,
  addNotebookToStore,
  removeNotebookFromStore,
} from "../stores/notebooks";
import type { Notebook } from "../data/types";

export function useMutationNotebook() {
  async function createNotebook(title = "New Notebook") {
    const created = await api.createNotebook({ title });
    // optimistic append
    addNotebookToStore(created as Notebook);
    return created;
  }

  async function updateNotebook(
    id: number | string,
    updates: Partial<Notebook>,
  ) {
    const updated = await api.updateNotebook(id, updates);
    await fetchNotebooks();
    return updated;
  }

  async function deleteNotebook(id: number | string) {
    await api.deleteNotebook(id);
    removeNotebookFromStore(id);
  }

  return { createNotebook, updateNotebook, deleteNotebook };
}

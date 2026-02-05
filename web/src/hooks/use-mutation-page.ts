import * as api from "../data/api";
import { fetchNotebooks } from "../stores/notebooks";
import { updatePageInStore } from "../lib/store-notepage";
import type { Page } from "../data/types";

export function useMutationPage() {
  async function createPage(notebookId: number | string, title = "New Page") {
    const created = await api.createPage(notebookId, { title });
    await fetchNotebooks();
    return created;
  }

  async function updatePage(
    notebookId: number | string,
    pageId: number | string,
    updates: Partial<Page> & { explicitSave?: boolean },
  ) {
    const updated = await api.updatePage(notebookId, pageId, updates);
    // optimistic local update so UI shows saved content immediately
    try {
      // avoid persisting `explicitSave` into the page object stored locally
      // strip explicitSave before updating local store
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { explicitSave, ...pageUpdates } = updates as any;
      updatePageInStore(notebookId, pageId, pageUpdates);
    } catch (e) {
      console.error("updatePageInStore", e);
    }
    // refresh from server to ensure store is in sync
    await fetchNotebooks();
    return updated;
  }

  async function deletePage(
    notebookId: number | string,
    pageId: number | string,
  ) {
    await api.deletePage(notebookId, pageId);
    await fetchNotebooks();
  }

  return { createPage, updatePage, deletePage };
}

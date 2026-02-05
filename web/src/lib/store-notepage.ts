import { atom, computed } from "nanostores";
import type { Notebook, Page } from "../data/types";
import * as api from "../data/api";

export const notebooksStore = atom<Notebook[]>([]);

// selection stores
export const currentNotebookIdStore = atom<string | null>(null);
export const currentPageIdStore = atom<string | null>(null);

export const currentNotebookStore = computed(
  [notebooksStore, currentNotebookIdStore],
  (notebooks, nbId) =>
    notebooks.find((n) => String(n.id) === String(nbId)) ?? null,
);

export const currentPageStore = computed(
  [currentNotebookStore, currentPageIdStore],
  (notebook, pageId) =>
    notebook?.pages?.find((p: Page) => String(p.id) === String(pageId)) ?? null,
);

export async function fetchNotebooks() {
  try {
    const data = await api.getNotebooks(true);
    const normalized = data.map((nb: any) => ({
      ...nb,
      pages: nb.pages ?? [],
    }));
    notebooksStore.set(normalized);
    return normalized;
  } catch (e) {
    console.error("fetchNotebooks", e);
    throw e;
  }
}

export function setNotebooks(list: Notebook[]) {
  notebooksStore.set(list);
}

export function updatePageInStore(
  notebookId: string | number,
  pageId: string | number,
  updates: Partial<Notebook["pages"][number]>,
) {
  const current = (notebooksStore.get() as Notebook[]) || [];
  const updated = current.map((nb) => {
    if (String(nb.id) !== String(notebookId)) return nb;
    return {
      ...nb,
      pages: (nb.pages || []).map((p) =>
        String(p.id) === String(pageId) ? { ...p, ...updates } : p,
      ),
    };
  });
  notebooksStore.set(updated);
}

export function addNotebookToStore(nb: Notebook) {
  const current = [...(notebooksStore.get() as Notebook[])];
  current.push(nb);
  notebooksStore.set(current);
}

export function removeNotebookFromStore(id: string | number) {
  const current = (notebooksStore.get() as Notebook[]).filter(
    (n) => String(n.id) !== String(id),
  );
  notebooksStore.set(current);
}

export default {
  notebooksStore,
  fetchNotebooks,
  setNotebooks,
  addNotebookToStore,
  removeNotebookFromStore,
};

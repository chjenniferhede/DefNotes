import { atom } from "nanostores";
import type { GlossaryEntry } from "../data/types";
import * as api from "../data/api";

// Map from notebookId to glossary entries
export const glossaryStore = atom<Record<string, GlossaryEntry[]>>({});

export async function fetchGlossaryEntries(notebookId: string | number) {
  try {
    const entries = await api.getGlossaryEntries(notebookId);
    const current = glossaryStore.get();
    glossaryStore.set({
      ...current,
      [String(notebookId)]: entries,
    });
    return entries;
  } catch (e) {
    console.error("fetchGlossaryEntries", e);
    throw e;
  }
}

export function getGlossaryEntriesFromStore(
  notebookId: string | number,
): GlossaryEntry[] {
  return glossaryStore.get()[String(notebookId)] ?? [];
}

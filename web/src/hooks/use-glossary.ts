import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { glossaryStore, fetchGlossaryEntries } from "../stores/glossary";
import type { GlossaryEntry } from "../data/types";

export function useGlossary(notebookId: string | number) {
  const glossaryMap = useStore(glossaryStore);
  const entries = glossaryMap[String(notebookId)] ?? [];
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!notebookId) return;

    const loadEntries = async () => {
      try {
        setLoading(true);
        await fetchGlossaryEntries(notebookId);
      } catch (e) {
        console.error("Failed to load glossary entries:", e);
      } finally {
        setLoading(false);
      }
    };

    loadEntries();
  }, [notebookId]);

  const refresh = async () => {
    if (!notebookId) return;
    await fetchGlossaryEntries(notebookId);
  };

  return {
    entries: entries as GlossaryEntry[],
    loading,
    refresh,
  };
}

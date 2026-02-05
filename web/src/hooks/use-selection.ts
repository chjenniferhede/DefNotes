import { useStore } from "@nanostores/react";
import { currentNotebookIdStore, currentPageIdStore } from "../lib/store";

/**
 * Centralized hook for managing selection state
 */
export function useSelection() {
  const currentNotebookId = useStore(currentNotebookIdStore);
  const currentPageId = useStore(currentPageIdStore);

  const selectNotebook = (notebookId: string | number) => {
    currentNotebookIdStore.set(String(notebookId));
  };

  const selectPage = (pageId: string | number, notebookId?: string | number) => {
    currentPageIdStore.set(String(pageId));
    // Ensure notebook selection matches the page's notebook
    if (notebookId) {
      currentNotebookIdStore.set(String(notebookId));
    }
  };

  const selectGlossaryPage = (notebookId: string | number) => {
    const glossaryPageId = `glossary-${notebookId}`;
    currentPageIdStore.set(glossaryPageId);
    currentNotebookIdStore.set(String(notebookId));
  };

  const isPageSelected = (pageId: string | number) => {
    return String(currentPageId) === String(pageId);
  };

  const isNotebookSelected = (notebookId: string | number) => {
    return String(currentNotebookId) === String(notebookId);
  };

  const isGlossaryPageSelected = (notebookId: string | number) => {
    return currentPageId === `glossary-${notebookId}`;
  };

  return {
    currentNotebookId,
    currentPageId,
    selectNotebook,
    selectPage,
    selectGlossaryPage,
    isPageSelected,
    isNotebookSelected,
    isGlossaryPageSelected,
  };
}
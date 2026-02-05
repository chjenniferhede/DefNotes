import { useEffect } from "react";
import type { Notebook } from "../data/types";
import { useSelection } from "./use-selection";

/**
 * Centralized hook for app initialization logic
 */
export function useAppInitialization(notebooks: Notebook[] | undefined) {
  const { selectNotebook, selectPage, currentNotebookId } = useSelection();

  // Initialize selection when notebooks load
  useEffect(() => {
    if (!currentNotebookId && notebooks && notebooks.length > 0) {
      const firstNotebook = notebooks[0];
      selectNotebook(firstNotebook.id);
      
      // Select first page if available
      if (firstNotebook.pages && firstNotebook.pages.length > 0) {
        selectPage(firstNotebook.pages[0].id);
      }
    }
  }, [notebooks, currentNotebookId, selectNotebook, selectPage]);
}
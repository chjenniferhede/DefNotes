/**
 * App initialization helper.
 *
 * When the app first loads, this hook picks sensible defaults
 * for which notebook and page should be shown. Pass the
 * `notebooks` list and it will select the first notebook and its first
 * page if nothing is already selected.
 */
import { useEffect } from "react";
import type { Notebook } from "../data/types";
import { useSelection } from "./use-selection";

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

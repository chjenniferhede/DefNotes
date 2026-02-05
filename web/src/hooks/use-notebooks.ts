import { useEffect } from "react";
import { useStore } from "@nanostores/react";
import {
  notebooksStore,
  fetchNotebooks,
} from "../lib/store";
import { useMutationNotebook } from "./use-mutation-notebook";
import { useMutationPage } from "./use-mutation-page";

export function useNotebooks() {
  const notebooks = useStore(notebooksStore);

  const { createNotebook, updateNotebook, deleteNotebook } =
    useMutationNotebook();
  const { createPage, updatePage, deletePage } = useMutationPage();

  async function load() {
    await fetchNotebooks();
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    notebooks,
    load,
    createNotebook,
    updateNotebook,
    deleteNotebook,
    createPage,
    updatePage,
    deletePage,
  };
}

export default useNotebooks;

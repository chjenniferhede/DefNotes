import type { Page as PageType } from "../data/types";
import { useStore } from "@nanostores/react";
import { currentPageIdStore, currentNotebookIdStore } from "../lib/store";

interface PageProps {
  page: PageType;
  notebookExpanded?: boolean;
  notebookId: string | number;
}

const Page = ({ page, notebookExpanded, notebookId }: PageProps) => {
  const currentPageId = useStore(currentPageIdStore);
  const isSelected = String(currentPageId) === String(page.id);

  return (
    <li>
      <button
        className={`text-sm text-left w-full ${isSelected ? "text-blue-600 font-medium" : (notebookExpanded ? "text-gray-500" : "text-gray-700")}`}
        onClick={() => {
          currentPageIdStore.set(String(page.id));
          // ensure notebook selection matches the page's notebook
          currentNotebookIdStore.set(String(notebookId));
        }}
      >
        {page.title}
      </button>
    </li>
  );
};

export default Page;

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
        className={`text-sm text-left w-full px-2 py-1 border rounded-none ${
          isSelected 
            ? "text-blue-600 font-medium bg-blue-50 border-blue-300" 
            : "text-gray-700 bg-white border-gray-200 hover:bg-gray-50"
        }`}
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

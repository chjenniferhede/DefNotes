import type { Page as PageType } from "../data/types";

interface PageProps {
  page: PageType;
  isSelected?: boolean;
  onSelect: (pageId: string) => void;
  notebookExpanded?: boolean;
}

const Page = ({ page, isSelected, onSelect, notebookExpanded }: PageProps) => {
  return (
    <li>
      <button
        className={`text-sm text-left w-full ${isSelected ? "text-blue-600 font-medium" : (notebookExpanded ? "text-gray-500" : "text-gray-700")}`}
        onClick={() => onSelect(page.id)}
      >
        {page.title}
      </button>
    </li>
  );
};

export default Page;

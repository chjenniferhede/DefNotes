import type { Page as PageType } from "../data/types";
import { useState, useRef, useEffect } from "react";
import { useMutationPage } from "../hooks/use-mutation-page";
import { useSelection } from "../hooks/use-selection";

interface PageProps {
  page: PageType;
  notebookExpanded?: boolean;
  notebookId: string | number;
}

const Page = ({ page, notebookExpanded, notebookId }: PageProps) => {
  const { updatePage } = useMutationPage();
  const { selectPage, isPageSelected } = useSelection();
  const isSelected = isPageSelected(page.id);
  
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const startEditing = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
    setDraftTitle(page.title || "");
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const finishEditing = async () => {
    if (!isEditing) return;
    const trimmed = draftTitle.trim();
    if (trimmed.length > 0 && trimmed !== page.title) {
      await updatePage(notebookId, page.id, { title: trimmed });
    }
    setIsEditing(false);
    setDraftTitle("");
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setDraftTitle("");
  };

  return (
    <li>
      {isEditing ? (
        <input
          ref={inputRef}
          value={draftTitle}
          onChange={(e) => setDraftTitle(e.target.value)}
          onBlur={finishEditing}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              finishEditing();
            } else if (e.key === "Escape") {
              cancelEditing();
            }
          }}
          className={`text-sm w-full px-2 py-1 border rounded-none bg-white border-gray-300 ${
            isSelected ? "ring-1 ring-blue-300" : ""
          }`}
        />
      ) : (
        <button
          className={`text-sm text-left w-full px-2 py-1 border rounded-none ${
            isSelected 
              ? "text-blue-600 font-medium bg-blue-50 border-blue-300" 
              : "text-gray-700 bg-white border-gray-200 hover:bg-gray-50"
          }`}
          onClick={() => selectPage(page.id, notebookId)}
          onDoubleClick={startEditing}
        >
          {page.title}
        </button>
      )}
    </li>
  );
};

export default Page;

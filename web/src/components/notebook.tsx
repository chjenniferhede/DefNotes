import Page from "./page";
import type { Notebook as NotebookType, Page as PageType } from "../data/types";
import { useStore } from "@nanostores/react";
import { currentNotebookIdStore } from "../lib/store";

interface NotebookProps {
  notebook: NotebookType;
  expanded?: boolean;
  onToggle: (id: string) => void;
  onAddPage: (notebookId: string) => void;
  onEditNotebook?: (id: string, updates: Partial<any>) => void;
}

const Notebook = ({
  notebook,
  expanded,
  onToggle,
  onAddPage,
  onEditNotebook,
}: NotebookProps) => {
  const currentNotebookId = useStore(currentNotebookIdStore);
  const handleDoubleClick = () => {
    const newTitle = window.prompt("Edit notebook title", notebook.title);
    if (newTitle !== null && newTitle !== notebook.title && onEditNotebook) {
      onEditNotebook(notebook.id, { title: newTitle });
    }
  };

  const isSelected = String(currentNotebookId) === String(notebook.id);

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between">
        <button
          className={`text-left flex-1 px-1 py-1 rounded ${expanded ? "bg-gray-200 text-gray-700" : ""} ${isSelected ? "font-bold" : ""}`}
          onClick={() => { onToggle(notebook.id); currentNotebookIdStore.set(String(notebook.id)); }}
          onDoubleClick={handleDoubleClick}
        >
          {notebook.title}
        </button>
        <div className="flex items-center space-x-2">
          <button
            className="text-xs text-green-600"
            onClick={() => onAddPage(notebook.id)}
          >
            +p
          </button>
        </div>
      </div>

      {expanded && (
        <ul className="mt-2 ml-2 space-y-1 bg-gray-50 p-2 rounded">
          {notebook.pages.length === 0 && (
            <li className="text-sm text-gray-400">(no pages)</li>
          )}
          {notebook.pages.map((p: PageType) => (
            <Page
              key={p.id}
              page={p}
              notebookExpanded={expanded}
              notebookId={notebook.id}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notebook;

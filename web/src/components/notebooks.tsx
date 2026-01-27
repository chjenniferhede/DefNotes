import { useStore } from "@nanostores/react";
import { notebooksStore } from "../stores/notebooks";
import type { Notebook as NotebookType } from "../stores/notebooks";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Page from "./page";
import GlossaryPage from "./glossary-page";
import type { Page as PageType } from "../data/types";
import { currentNotebookIdStore } from "../lib/store";

interface NotebooksProps {
  onAddNotebook: () => void;
  onAddPage: (notebookId: string) => void;
  onEditNotebook: (id: string, updates: Partial<any>) => void;
}

const Notebooks = ({ onAddPage, onEditNotebook }: NotebooksProps) => {
  const notebooks = useStore(notebooksStore) as NotebookType[];
  const currentNotebookId = useStore(currentNotebookIdStore);

  const handleDoubleClick = (notebook: NotebookType) => {
    const newTitle = window.prompt("Edit notebook title", notebook.title);
    if (newTitle !== null && newTitle !== notebook.title && onEditNotebook) {
      onEditNotebook(notebook.id, { title: newTitle });
    }
  };

  return (
    <div className="overflow-auto mt-3">
      <Accordion type="single" collapsible className="w-full space-y-2">
        {notebooks.map((nb) => {
          const isSelected = String(currentNotebookId) === String(nb.id);
          return (
            <AccordionItem
              key={nb.id}
              value={nb.id}
              className="border rounded-none"
            >
              <AccordionTrigger
                className="px-3 py-2 hover:no-underline rounded-none"
                onClick={() => currentNotebookIdStore.set(String(nb.id))}
                onDoubleClick={() => handleDoubleClick(nb)}
              >
                <span className={isSelected ? "font-bold" : ""}>
                  {nb.title}
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-2">
                <ul className="space-y-1 bg-gray-50 p-2 rounded-none">
                  <li>
                    <button
                      className="text-sm text-left w-full px-2 py-1 text-green-600 border border-green-300 bg-green-50 hover:bg-green-100 rounded-none"
                      onClick={() => onAddPage(nb.id)}
                    >
                      New Page
                    </button>
                  </li>
                  <GlossaryPage notebookId={nb.id} />
                  {nb.pages.length === 0 && (
                    <li className="text-sm text-gray-400">(no pages)</li>
                  )}
                  {nb.pages.map((p: PageType) => (
                    <Page
                      key={p.id}
                      page={p}
                      notebookExpanded={true}
                      notebookId={nb.id}
                    />
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};

export default Notebooks;

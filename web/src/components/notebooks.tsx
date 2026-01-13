import { useState } from "react";
import { useStore } from "@nanostores/react";
import Notebook from "./notebook";
import { notebooksStore } from "../stores/notebooks";
import type { Notebook as NotebookType } from "../stores/notebooks";

interface NotebooksProps {
  selectedNotebookId?: string | null;
  selectedPageId?: string | null;
  onSelectNotebook: (id: string) => void;
  onSelectPage: (notebookId: string, pageId: string) => void;
  onAddNotebook: () => void;
  onAddPage: (notebookId: string) => void;
  onEditNotebook: (id: string, updates: Partial<any>) => void;
}

const Notebooks = ({
  selectedNotebookId,
  selectedPageId,
  onSelectNotebook,
  onSelectPage,
  onEditNotebook,
  onAddPage,
}: NotebooksProps) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const notebooks = useStore(notebooksStore) as NotebookType[];

  const toggle = (id: string) => setExpanded((s) => ({ ...s, [id]: !s[id] }));

  return (
    <div className="overflow-auto mt-3">
      {notebooks.map((nb) => (
        <Notebook
          key={nb.id}
          notebook={nb}
          expanded={!!expanded[nb.id]}
          onToggle={toggle}
          onSelectNotebook={onSelectNotebook}
          onSelectPage={onSelectPage}
          selectedPageId={selectedPageId}
          selectedNotebookId={selectedNotebookId}
          onAddPage={onAddPage}
          onEditNotebook={onEditNotebook}
        />
      ))}
    </div>
  );
};

export default Notebooks;

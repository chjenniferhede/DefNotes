import { useState } from "react";
import { useStore } from "@nanostores/react";
import Notebook from "./notebook";
import { notebooksStore } from "../stores/notebooks";
import type { Notebook as NotebookType } from "../stores/notebooks";

interface NotebooksProps {
  onAddNotebook: () => void;
  onAddPage: (notebookId: string) => void;
  onEditNotebook: (id: string, updates: Partial<any>) => void;
}

const Notebooks = ({ onAddPage, onEditNotebook }: NotebooksProps) => {
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
          onAddPage={onAddPage}
          onEditNotebook={onEditNotebook}
        />
      ))}
    </div>
  );
};

export default Notebooks;

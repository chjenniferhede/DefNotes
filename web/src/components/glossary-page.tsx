import { useState, useEffect } from "react";
import { getGlossaryEntries } from "../data/api";
import type { GlossaryEntry } from "../data/types";
import { useStore } from "@nanostores/react";
import { currentPageIdStore, currentNotebookIdStore } from "../lib/store";

interface GlossaryPageProps {
  notebookId: string | number;
}

const GlossaryPage = ({ notebookId }: GlossaryPageProps) => {
  const [entries, setEntries] = useState<GlossaryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const currentPageId = useStore(currentPageIdStore);
  const glossaryPageId = `glossary-${notebookId}`;
  const isSelected = currentPageId === glossaryPageId;

  useEffect(() => {
    if (!notebookId || !isSelected) return;

    const fetchEntries = async () => {
      try {
        setLoading(true);
        const data = await getGlossaryEntries(notebookId);
        setEntries(data);
      } catch (error) {
        console.error("Failed to fetch glossary entries:", error);
        setEntries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [notebookId, isSelected]);

  const handleClick = () => {
    currentPageIdStore.set(glossaryPageId);
    currentNotebookIdStore.set(String(notebookId));
  };

  return (
    <li>
      <button
        className={`text-sm text-left w-full px-2 py-1 border rounded-none ${
          isSelected
            ? "text-purple-600 font-medium bg-purple-50 border-purple-300"
            : "text-purple-700 bg-purple-50 border-purple-200 hover:bg-purple-100"
        }`}
        onClick={handleClick}
      >
        Glossary
      </button>
    </li>
  );
};

export default GlossaryPage;

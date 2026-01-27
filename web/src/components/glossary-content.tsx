import { useState, useEffect } from "react";
import { getGlossaryEntries } from "../data/api";
import type { GlossaryEntry } from "../data/types";

interface GlossaryContentProps {
  notebookId: string | number;
}

const GlossaryContent = ({ notebookId }: GlossaryContentProps) => {
  const [entries, setEntries] = useState<GlossaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!notebookId) return;

    const fetchEntries = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getGlossaryEntries(notebookId);
        setEntries(data);
      } catch (err) {
        console.error("Failed to fetch glossary entries:", err);
        setError("Failed to load glossary entries");
        setEntries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [notebookId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading glossary...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 italic">
          Write your notes and label terms with defn to start!
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-purple-700 mb-6">Glossary</h1>
      <div className="space-y-6">
        {entries.map((entry) => (
          <div key={entry.id} className="border-l-4 border-purple-300 bg-purple-50 pl-4 py-3 pr-4 rounded-r">
            <h2 className="text-xl font-semibold text-purple-900 mb-2">
              {entry.term}
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{entry.definition}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GlossaryContent;

import { useGlossary } from "../hooks/use-glossary";

interface GlossaryContentProps {
  notebookId: string | number;
}

const GlossaryContent = ({ notebookId }: GlossaryContentProps) => {
  const { entries, loading } = useGlossary(notebookId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading glossary...</p>
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
    <div className="p-8 max-w-4xl mx-auto text-left">
      <h1 className="text-3xl font-bold text-purple-700 mb-6 text-left">Glossary</h1>
      <div className="space-y-6">
        {entries.map((entry) => (
          <div key={entry.id} className="border-l-4 border-purple-300 bg-purple-50 pl-4 py-3 pr-4 rounded-r text-left">
            <h2 className="text-xl font-semibold text-purple-900 mb-2 text-left">
              {entry.term}
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-left">{entry.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GlossaryContent;

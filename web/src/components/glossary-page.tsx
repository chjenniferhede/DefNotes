import { useSelection } from "../hooks/use-selection";

interface GlossaryPageProps {
  notebookId: string | number;
}

const GlossaryPage = ({ notebookId }: GlossaryPageProps) => {
  const { selectGlossaryPage, isGlossaryPageSelected } = useSelection();
  const isSelected = isGlossaryPageSelected(notebookId);

  const handleClick = () => {
    selectGlossaryPage(notebookId);
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

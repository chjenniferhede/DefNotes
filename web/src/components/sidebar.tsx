import Notebooks from "./notebooks";

export default function SideBar({
  onAddNotebook,
  onAddPage,
  onSelectNotebook,
  onSelectPage,
  onEditNotebook,
}: any) {
  return (
    <div className="sidebar h-full min-h-dvh flex flex-col p-4">
      <div className="flex items-center justify-between p-2">
        <h3 className="font-semibold">Notebooks</h3>
        <button
          className="px-2 py-1 bg-gray-100 rounded"
          onClick={onAddNotebook}
        >
          New
        </button>
      </div>
      <Notebooks
        onAddNotebook={onAddNotebook}
        onAddPage={onAddPage}
        onSelectNotebook={onSelectNotebook}
        onSelectPage={onSelectPage}
        onEditNotebook={onEditNotebook}
      />
    </div>
  );
}

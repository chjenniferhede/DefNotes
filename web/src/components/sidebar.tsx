import Notebooks from "./notebooks";
import { Button } from "@/components/ui/button";

export default function SideBar({
  onAddNotebook,
  onAddPage,
  onEditNotebook,
}: any) {
  return (
    <div className="sidebar h-full min-h-dvh flex flex-col p-4">
      <div className="flex items-center justify-between p-2">
        <Button
          className="w-full rounded-none border"
          variant="outline"
          onClick={onAddNotebook}
        >
          New Notebook
        </Button>
      </div>
      <Notebooks
        onAddNotebook={onAddNotebook}
        onAddPage={onAddPage}
        onEditNotebook={onEditNotebook}
      />
    </div>
  );
}

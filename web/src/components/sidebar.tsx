import Notebooks from './notebooks'

type Page = { id: string; title: string }
type Notebook = { id: string; title: string; pages: Page[] }

interface SideBarProps {
  notebooks: Notebook[]
  selectedNotebookId?: string | null
  selectedPageId?: string | null
  onSelectNotebook: (id: string) => void
  onSelectPage: (notebookId: string, pageId: string) => void
  onAddNotebook: () => void
  onAddPage: (notebookId: string) => void
}

const SideBar = ({ notebooks, selectedNotebookId, selectedPageId, onSelectNotebook, onSelectPage, onAddNotebook, onAddPage }: SideBarProps) => {
  return (
    <div className="sidebar h-full min-h-dvh flex flex-col p-4">
      <Notebooks
        notebooks={notebooks}
        selectedNotebookId={selectedNotebookId}
        selectedPageId={selectedPageId}
        onSelectNotebook={onSelectNotebook}
        onSelectPage={onSelectPage}
        onAddNotebook={onAddNotebook}
        onAddPage={onAddPage}
      />
    </div>
  )
}

export default SideBar


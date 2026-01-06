import Page from './page'
import type { Notebook as NotebookType, Page as PageType } from '../data/types'

interface NotebookProps {
  notebook: NotebookType
  expanded?: boolean
  onToggle: (id: string) => void
  onSelectNotebook: (id: string) => void
  onSelectPage: (notebookId: string, pageId: string) => void
  selectedPageId?: string | null
  selectedNotebookId?: string | null
  onAddPage: (notebookId: string) => void
  onEditNotebook?: (id: string, updates: Partial<any>) => void
}

const Notebook = ({ notebook, expanded, onToggle, onSelectNotebook, onSelectPage, selectedPageId, selectedNotebookId, onAddPage, onEditNotebook }: NotebookProps) => {
  const handleDoubleClick = () => {
    const newTitle = window.prompt('Edit notebook title', notebook.title)
    if (newTitle !== null && newTitle !== notebook.title && onEditNotebook) {
      onEditNotebook(notebook.id, { title: newTitle })
    }
  }
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between">
        <button
          className={`text-left flex-1 ${selectedNotebookId === notebook.id ? 'font-bold' : ''}`}
          onClick={() => onSelectNotebook(notebook.id)}
          onDoubleClick={handleDoubleClick}
        >
          {notebook.title}
        </button>
        <div className="flex items-center space-x-2">
          <button className="text-xs text-gray-500" onClick={() => onToggle(notebook.id)}>{expanded ? '▾' : '▸'}</button>
          <button className="text-xs text-green-600" onClick={() => onAddPage(notebook.id)}>+p</button>
        </div>
      </div>

      {expanded && (
        <ul className="mt-2 ml-2 space-y-1">
          {notebook.pages.length === 0 && <li className="text-sm text-gray-400">(no pages)</li>}
          {notebook.pages.map((p: PageType) => (
            <Page key={p.id} page={p} isSelected={selectedPageId === p.id} onSelect={(pageId) => onSelectPage(notebook.id, pageId)} />
          ))}
        </ul>
      )}
    </div>
  )
}

export default Notebook

import { useState } from 'react'
import Notebook from './notebook'

type PageType = { id: string; title: string }
type NotebookType = { id: string; title: string; pages: PageType[] }

interface NotebooksProps {
  notebooks: NotebookType[]
  selectedNotebookId?: string | null
  selectedPageId?: string | null
  onSelectNotebook: (id: string) => void
  onSelectPage: (notebookId: string, pageId: string) => void
  onAddNotebook: () => void
  onAddPage: (notebookId: string) => void
}

const Notebooks = ({ notebooks, selectedNotebookId, selectedPageId, onSelectNotebook, onSelectPage, onAddNotebook, onAddPage }: NotebooksProps) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const toggle = (id: string) => setExpanded((s) => ({ ...s, [id]: !s[id] }))

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Notebooks</h2>
        <button className="text-sm text-blue-600" onClick={onAddNotebook}>+ New</button>
      </div>

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
          />
        ))}
      </div>
    </div>
  )
}

export default Notebooks

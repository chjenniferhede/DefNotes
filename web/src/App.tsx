import './App.css'
import { useState } from 'react'
import SideBar from './components/sidebar'
import NotePage from './components/notepage'
import Header from './components/header' 

type Page = {
  id: string
  title: string
  content: string
}

type Notebook = {
  id: string
  title: string
  pages: Page[]
}

function App() {
  const [notebooks, setNotebooks] = useState<Notebook[]>([
    {
      id: 'nb-1',
      title: 'Personal',
      pages: [
        { id: 'p-1', title: 'Welcome', content: 'Welcome to your Personal notebook!' },
      ],
    },
    {
      id: 'nb-2',
      title: 'Work',
      pages: [
        { id: 'p-2', title: 'Meeting Notes', content: 'Meeting notes go here...' },
      ],
    },
  ])

  const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(notebooks[0].id)
  const [selectedPageId, setSelectedPageId] = useState<string | null>(notebooks[0].pages[0].id)

  const addNotebook = () => {
    const id = `nb-${Date.now()}`
    setNotebooks((prev) => [...prev, { id, title: 'New Notebook', pages: [] }])
  }

  const addPage = (notebookId: string) => {
    const id = `p-${Date.now()}`
    setNotebooks((prev) =>
      prev.map((nb) => (nb.id === notebookId ? { ...nb, pages: [...nb.pages, { id, title: 'New Page', content: '' }] } : nb)),
    )
    setSelectedNotebookId(notebookId)
    setSelectedPageId(id)
  }

  const selectNotebook = (id: string) => {
    setSelectedNotebookId(id)
    const nb = notebooks.find((n) => n.id === id)
    setSelectedPageId(nb && nb.pages.length ? nb.pages[0].id : null)
  }

  const selectPage = (notebookId: string, pageId: string) => {
    setSelectedNotebookId(notebookId)
    setSelectedPageId(pageId)
  }

  const updatePageContent = (pageId: string, content: string) => {
    setNotebooks((prev) =>
      prev.map((nb) => ({
        ...nb,
        pages: nb.pages.map((p) => (p.id === pageId ? { ...p, content } : p)),
      })),
    )
  }

  const selectedPage = notebooks
    .find((n) => n.id === selectedNotebookId)
    ?.pages.find((p) => p.id === selectedPageId)

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header title={selectedPage?.title ?? 'DefNote'} />

      <div className="flex flex-1">
        <div className="w-1/5 min-w-[220px] flex-shrink-0 border-r border-gray-200">
          <SideBar
            notebooks={notebooks}
            selectedNotebookId={selectedNotebookId}
            selectedPageId={selectedPageId}
            onSelectNotebook={selectNotebook}
            onSelectPage={selectPage}
            onAddNotebook={addNotebook}
            onAddPage={addPage}
          />
        </div> 

        <div className="flex-1 overflow-auto">
          <NotePage page={selectedPage} onUpdateContent={(content) => selectedPage && updatePageContent(selectedPage.id, content)} />
        </div>
      </div>
    </div>
  )
}

export default App

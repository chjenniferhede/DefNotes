import './App.css'
import { useState, useEffect } from 'react'
import { useStore } from '@nanostores/react'
import SideBar from './components/sidebar'
import NotePage from './components/notepage'
import Header from './components/header'
import { notebooksStore, fetchNotebooks } from './stores/notebooks'
import { useMutationNotebook } from './hooks/use-mutation-notebook'
import { useMutationPage } from './hooks/use-mutation-page'

function App() {
  const notebooks = useStore(notebooksStore)
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null)
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null)

  const { createNotebook } = useMutationNotebook()
  const { createPage, updatePage } = useMutationPage()

  const { updateNotebook } = useMutationNotebook()

  useEffect(() => {
    fetchNotebooks()
    // initialize selection after store updates
    const unsub = notebooksStore.listen((data) => {
      if (!selectedNotebookId && data.length) {
        setSelectedNotebookId(String(data[0].id))
        const firstPage = data[0].pages && data[0].pages.length ? String(data[0].pages[0].id) : null
        setSelectedPageId(firstPage)
      }
    })
    // set initial
    const current = notebooksStore.get()
    if (current && current.length && !selectedNotebookId) {
      setSelectedNotebookId(String(current[0].id))
      const firstPage = current[0].pages && current[0].pages.length ? String(current[0].pages[0].id) : null
      setSelectedPageId(firstPage)
    }
    return () => unsub()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addNotebook = async () => {
    const created = await createNotebook('New Notebook')
    setSelectedNotebookId(String(created.id))
  }

  const addPage = async (notebookId: string) => {
    const created = await createPage(notebookId, 'New Page')
    setSelectedNotebookId(String(notebookId))
    setSelectedPageId(String(created.id))
  }

  const selectNotebook = (id: string) => {
    setSelectedNotebookId(id)
    const nb = (notebooks || []).find((n: any) => String(n.id) === String(id))
    setSelectedPageId(nb && nb.pages && nb.pages.length ? String(nb.pages[0].id) : null)
  }

  const selectPage = (notebookId: string, pageId: string) => {
    setSelectedNotebookId(notebookId)
    setSelectedPageId(pageId)
  }

  const updatePageContent = async (content: string) => {
    if (!selectedNotebookId || !selectedPageId) return
    await updatePage(selectedNotebookId, selectedPageId, { content })
  }

  const selectedPage = (notebooks || [])
    .find((n: any) => String(n.id) === String(selectedNotebookId))
    ?.pages?.find((p: any) => String(p.id) === String(selectedPageId))

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header title={selectedPage?.title ?? 'DefNote'} />

      <div className="flex flex-1">
        <div className="w-1/5 min-w-[220px] flex-shrink-0 border-r border-gray-200">
          <SideBar
            onAddNotebook={addNotebook}
            onAddPage={addPage}
            onSelectNotebook={selectNotebook}
            onSelectPage={selectPage}
            onEditNotebook={async (id: string, updates: Partial<any>) => {
              await updateNotebook(id, updates)
            }}
          />
        </div>

        <div className="flex-1 overflow-auto">
          {selectedPage && <NotePage page={selectedPage} onUpdateContent={updatePageContent} />}
        </div>
      </div>
    </div>
  )
}

export default App

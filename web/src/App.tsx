import "./App.css";
import { useState, useEffect } from "react";
import SideBar from "./components/sidebar";
import NotePage from "./components/notepage";
import Header from "./components/header";
import useNotebooks from "./hooks/use-notebooks";

function App() {
  const {
    notebooks,
    createNotebook,
    createPage,
    updateNotebook,
    updatePage,
  } = useNotebooks();
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(
    null,
  );
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState<string>("");

  

  useEffect(() => {
    // selection initialization: when notebooks load, pick first
    if (!selectedNotebookId && notebooks && notebooks.length) {
      setSelectedNotebookId(String(notebooks[0].id));
      const firstPage =
        notebooks[0].pages && notebooks[0].pages.length
          ? String(notebooks[0].pages[0].id)
          : null;
      setSelectedPageId(firstPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notebooks]);

  const addNotebook = async () => {
    const created = await createNotebook("New Notebook");
    setSelectedNotebookId(String(created.id));
  };

  const addPage = async (notebookId: string) => {
    const created = await createPage(notebookId, "New Page");
    setSelectedNotebookId(String(notebookId));
    setSelectedPageId(String(created.id));
  };

  const selectNotebook = (id: string) => {
    setSelectedNotebookId(id);
    const nb = (notebooks || []).find((n: any) => String(n.id) === String(id));
    setSelectedPageId(
      nb && nb.pages && nb.pages.length ? String(nb.pages[0].id) : null,
    );
  };

  const selectPage = async (notebookId: string, pageId: string) => {
    // save current page if edited
    const currentNb = (notebooks || []).find(
      (n: any) => String(n.id) === String(selectedNotebookId),
    );
    const currentPage = currentNb?.pages?.find(
      (p: any) => String(p.id) === String(selectedPageId),
    );
    if (currentPage && editorContent !== (currentPage.content ?? "")) {
      await savePageContent(editorContent);
    }

    setSelectedNotebookId(notebookId);
    setSelectedPageId(pageId);
  };

  const savePageContent = async (content: string) => {
    if (!selectedNotebookId || !selectedPageId) return;
    await updatePage(selectedNotebookId, selectedPageId, { content });
  };

  useEffect(() => {
    const sp = (notebooks || [])
      .find((n: any) => String(n.id) === String(selectedNotebookId))
      ?.pages?.find((p: any) => String(p.id) === String(selectedPageId));
    setEditorContent(sp?.content ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPageId, selectedNotebookId]);

  const selectedPage = (notebooks || [])
    .find((n: any) => String(n.id) === String(selectedNotebookId))
    ?.pages?.find((p: any) => String(p.id) === String(selectedPageId));

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header title={selectedPage?.title ?? "DefNote"} onSave={() => savePageContent(editorContent)} />

      <div className="flex flex-1">
        <div className="w-1/5 min-w-[220px] flex-shrink-0 border-r border-gray-200">
          <SideBar
            onAddNotebook={addNotebook}
            onAddPage={addPage}
            onSelectNotebook={selectNotebook}
            onSelectPage={selectPage}
            onEditNotebook={async (id: string, updates: Partial<any>) => {
              await updateNotebook(id, updates);
            }}
          />
        </div>

        <div className="flex-1 overflow-auto">
          {selectedPage && (
            <NotePage
              page={selectedPage}
              onSave={savePageContent}
              onChange={(c) => setEditorContent(c)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

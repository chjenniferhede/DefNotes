import "./App.css";
import { useState, useEffect, useRef } from "react";
import SideBar from "./components/sidebar";
import NotePage from "./components/notepage";
import Header from "./components/header";
import useNotebooks from "./hooks/use-notebooks";
import { useStore } from "@nanostores/react";
import { currentNotebookIdStore, currentPageIdStore, currentPageStore } from "./lib/store";

function App() {
  const {
    notebooks,
    createNotebook,
    createPage,
    updateNotebook,
    updatePage,
  } = useNotebooks();

  const [editorContent, setEditorContent] = useState<string>("");
  const currentNotebookId = useStore(currentNotebookIdStore);
  const currentPageId = useStore(currentPageIdStore);
  const currentPage = useStore(currentPageStore);
  const prevSelectionRef = useRef<{ notebookId: string | null; pageId: string | null }>({ notebookId: null, pageId: null });

  useEffect(() => {
    // initialize selection when notebooks load
    if (!currentNotebookId && notebooks && notebooks.length) {
      currentNotebookIdStore.set(String(notebooks[0].id));
      const firstPage =
        notebooks[0].pages && notebooks[0].pages.length
          ? String(notebooks[0].pages[0].id)
          : null;
      currentPageIdStore.set(firstPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notebooks]);

  const addNotebook = async () => {
    const created = await createNotebook("New Notebook");
    currentNotebookIdStore.set(String(created.id));
  };

  const addPage = async (notebookId: string) => {
    const created = await createPage(notebookId, "New Page");
    currentNotebookIdStore.set(String(notebookId));
    currentPageIdStore.set(String(created.id));
  };

  const savePageContent = async (content: string, explicit = false) => {
    if (!currentNotebookId || !currentPageId) return;
    await updatePage(currentNotebookId, currentPageId, { content, explicitSave: explicit });
  };

  useEffect(() => {
    // when selection changes, update editor content to selected page
    const sp = (notebooks || [])
      .find((n: any) => String(n.id) === String(currentNotebookId))
      ?.pages?.find((p: any) => String(p.id) === String(currentPageId));
    setEditorContent(sp?.content ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPageId, currentNotebookId, notebooks]);

  useEffect(() => {
    // persist previous page when selection changes
    const prev = prevSelectionRef.current;
    const prevNotebook = prev.notebookId;
    const prevPage = prev.pageId;

    (async () => {
      if (prevNotebook && prevPage) {
        const nb = (notebooks || []).find((n: any) => String(n.id) === String(prevNotebook));
        const pg = nb?.pages?.find((p: any) => String(p.id) === String(prevPage));
        if (pg && editorContent !== (pg.content ?? "")) {
          await updatePage(prevNotebook, prevPage, { content: editorContent });
        }
      }
      prevSelectionRef.current = { notebookId: currentNotebookId, pageId: currentPageId };
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPageId, currentNotebookId]);

  const selectedPage = currentPage;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header title={selectedPage?.title ?? "DefNote"} onSave={() => savePageContent(editorContent, true)} />

      <div className="flex flex-1">
        <div className="w-1/5 min-w-[220px] flex-shrink-0 border-r border-gray-200">
          <SideBar
            onAddNotebook={addNotebook}
            onAddPage={addPage}
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

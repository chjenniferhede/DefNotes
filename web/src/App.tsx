import "./App.css";
import { useState, useEffect, useRef } from "react";
import SideBar from "./components/sidebar";
import NotePage, { type NotePageHandle } from "./components/notepage";
import GlossaryContent from "./components/glossary-content";
import Header from "./components/header";
import useNotebooks from "./hooks/use-notebooks";
import { useSelection } from "./hooks/use-selection";
import { useAppInitialization } from "./hooks/use-app-initialization";
import { useStore } from "@nanostores/react";
import { currentPageStore } from "./lib/store-notepage";

function App() {
  const { notebooks, createNotebook, createPage, updateNotebook, updatePage } =
    useNotebooks();

  const { currentNotebookId, currentPageId, selectNotebook, selectPage } =
    useSelection();
  const currentPage = useStore(currentPageStore);
  const notePageRef = useRef<NotePageHandle>(null);

  // Initialize app selection state
  useAppInitialization(notebooks);

  const [editorContent, setEditorContent] = useState<string>("");
  const prevSelectionRef = useRef<{
    notebookId: string | null;
    pageId: string | null;
  }>({ notebookId: null, pageId: null });

  const addNotebook = async () => {
    const created = await createNotebook("New Notebook");
    selectNotebook(created.id);
  };

  const addPage = async (notebookId: string) => {
    const created = await createPage(notebookId, "New Page");
    selectPage(created.id, notebookId);
  };

  useEffect(() => {
    // when selection changes, update editor content to selected page
    const sp = (notebooks || [])
      .find((n: any) => String(n.id) === String(currentNotebookId))
      ?.pages?.find((p: any) => String(p.id) === String(currentPageId));
    setEditorContent(sp?.content ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPageId, currentNotebookId, notebooks]);

  const savePageContent = async (content: string, explicit = false) => {
    if (!currentNotebookId || !currentPageId) {
      console.warn("Cannot save: missing notebookId or pageId");
      return;
    }
    console.log("Saving page:", {
      notebookId: currentNotebookId,
      pageId: currentPageId,
      explicit,
      contentLength: content.length,
    });
    await updatePage(currentNotebookId, currentPageId, {
      content,
      explicitSave: explicit,
    });
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
        const nb = (notebooks || []).find(
          (n: any) => String(n.id) === String(prevNotebook),
        );
        const pg = nb?.pages?.find(
          (p: any) => String(p.id) === String(prevPage),
        );
        if (pg && editorContent !== (pg.content ?? "")) {
          await updatePage(prevNotebook, prevPage, { content: editorContent });
        }
      }
      prevSelectionRef.current = {
        notebookId: currentNotebookId,
        pageId: currentPageId,
      };
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPageId, currentNotebookId]);

  const selectedPage = currentPage;
  const isGlossaryPage = currentPageId?.startsWith("glossary-");

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header
        title={isGlossaryPage ? "Glossary" : (selectedPage?.title ?? "DefNote")}
        onSave={async () => {
          if (notePageRef.current) {
            await notePageRef.current.triggerSave();
          }
        }}
      />

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
          {isGlossaryPage && currentNotebookId && (
            <GlossaryContent notebookId={currentNotebookId} />
          )}
          {!isGlossaryPage && selectedPage && (
            <NotePage ref={notePageRef} page={selectedPage} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

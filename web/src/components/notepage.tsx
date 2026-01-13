import { useEffect, useState } from "react";
import type { Page as PageType } from "../data/types";

interface NotePageProps {
  page?: PageType | null;
  onSave: (content: string) => Promise<void>;
  onChange?: (content: string) => void;
}

const NotePage = ({ page, onSave, onChange }: NotePageProps) => {
  const [content, setContent] = useState<string>(page?.content ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setContent(page?.content ?? "");
  }, [page?.id]);

  return (
    <div className="notepage flex flex-col w-full h-full">
      <main className="flex-1 p-4 overflow-auto">
        <div className="flex h-full">
          <div className="flex-1 h-full">
            <textarea
              className="w-full h-full p-3 border rounded-none resize-none"
              placeholder="Write your note here..."
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                onChange?.(e.target.value);
              }}
              onBlur={async () => {
                // auto-save on blur
                if (content === (page?.content ?? "")) return;
                setSaving(true);
                try {
                  await onSave(content);
                } catch (e) {
                  console.error(e);
                } finally {
                  setSaving(false);
                }
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotePage;

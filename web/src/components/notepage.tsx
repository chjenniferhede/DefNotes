type Page = { id: string; title: string; content: string }

interface NotePageProps {
  page?: Page | null
  onUpdateContent: (content: string) => void
}

const NotePage = ({ page, onUpdateContent }: NotePageProps) => {
  return (
    <div className="notepage flex flex-col w-full h-full">
      <main className="flex-1 p-4 overflow-auto">
        <div className="flex h-full">
          <div className="flex-1 h-full">
            <textarea
              className="w-full h-full p-3 border rounded-none resize-none"
              placeholder="Write your note here..."
              value={page?.content ?? ''}
              onChange={(e) => onUpdateContent(e.target.value)}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

export default NotePage

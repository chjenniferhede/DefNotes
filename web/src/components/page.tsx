type PageType = { id: string; title: string }

interface PageProps {
  page: PageType
  isSelected?: boolean
  onSelect: (pageId: string) => void
}

const Page = ({ page, isSelected, onSelect }: PageProps) => {
  return (
    <li>
      <button
        className={`text-sm text-left w-full ${isSelected ? 'text-blue-600 font-medium' : 'text-gray-700'}`}
        onClick={() => onSelect(page.id)}
      >
        {page.title}
      </button>
    </li>
  )
}

export default Page

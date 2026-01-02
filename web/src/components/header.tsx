type HeaderProps = { title?: string }

const Header = ({ title }: HeaderProps) => {
  return (
    <header className="flex items-center justify-between p-4 border-b bg-white z-10">
      <h1 className="text-lg font-semibold">{title ?? 'DefNote'}</h1>
      <div className="flex items-center space-x-2">
        <button className="px-2 py-1 text-sm">Bold</button>
        <button className="px-2 py-1 text-sm">Italic</button>
        <button className="px-2 py-1 text-sm">Undo</button>
        <button className="px-2 py-1 text-sm bg-green-500 text-white rounded">Save</button>
      </div>
    </header>
  )
}

export default Header

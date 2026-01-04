import { atom } from 'nanostores'

export type Page = { id: string; title: string; content?: string }
export type Notebook = { id: string; title: string; pages?: Page[] }

export const notebooksStore = atom<Notebook[]>([])

export async function fetchNotebooks() {
  try {
    const res = await fetch('/notebooks?includePages=true')
    if (!res.ok) return
    const data = await res.json()
    notebooksStore.set(data)
  } catch (e) {
    console.error('fetchNotebooks', e)
  }
}

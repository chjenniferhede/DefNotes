import { atom } from 'nanostores'
import type { Notebook } from '../data/types'
import * as api from '../data/api'

export const notebooksStore = atom<Notebook[]>([])

export async function fetchNotebooks() {
  try {
    const data = await api.getNotebooks(true)
    const normalized = data.map((nb: any) => ({ ...nb, pages: nb.pages ?? [] }))
    notebooksStore.set(normalized)
    return normalized
  } catch (e) {
    console.error('fetchNotebooks', e)
    throw e
  }
}

export function setNotebooks(list: Notebook[]) {
  notebooksStore.set(list)
}

export function addNotebookToStore(nb: Notebook) {
  const current = [...(notebooksStore.get() as Notebook[])]
  current.push(nb)
  notebooksStore.set(current)
}

export function removeNotebookFromStore(id: string | number) {
  const current = (notebooksStore.get() as Notebook[]).filter((n) => String(n.id) !== String(id))
  notebooksStore.set(current)
}

export default {
  notebooksStore,
  fetchNotebooks,
  setNotebooks,
  addNotebookToStore,
  removeNotebookFromStore,
}

import { notebooksStore, fetchNotebooks } from '../stores/notebooks'
import type { Notebook } from '../stores/notebooks'

export function useMutationNotebook() {
  const base = '/notebooks'

  async function createNotebook(title = 'New Notebook') {
    const res = await fetch(base, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    const created = await res.json()
    // optimistic: append to store
    const current = [...(notebooksStore.get() as Notebook[])]
    current.push(created)
    notebooksStore.set(current)
    return created
  }

  async function updateNotebook(id: number | string, updates: Partial<Notebook>) {
    const res = await fetch(`${base}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    const updated = await res.json()
    // refresh store
    await fetchNotebooks()
    return updated
  }

  async function deleteNotebook(id: number | string) {
    await fetch(`${base}/${id}`, { method: 'DELETE' })
    const current = (notebooksStore.get() as Notebook[]).filter((n) => String(n.id) !== String(id))
    notebooksStore.set(current)
  }

  return { createNotebook, updateNotebook, deleteNotebook }
}

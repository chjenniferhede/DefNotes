import { fetchNotebooks } from '../stores/notebooks'
import type { Page } from '../stores/notebooks'

export function useMutationPage() {
  async function createPage(notebookId: number | string, title = 'New Page') {
    const res = await fetch(`/notebooks/${notebookId}/pages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    const created = await res.json()
    // refresh notebooks
    await fetchNotebooks()
    return created
  }

  async function updatePage(notebookId: number | string, pageId: number | string, updates: Partial<Page>) {
    const res = await fetch(`/notebooks/${notebookId}/pages/${pageId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    const updated = await res.json()
    await fetchNotebooks()
    return updated
  }

  async function deletePage(notebookId: number | string, pageId: number | string) {
    await fetch(`/notebooks/${notebookId}/pages/${pageId}`, { method: 'DELETE' })
    await fetchNotebooks()
  }

  return { createPage, updatePage, deletePage }
}

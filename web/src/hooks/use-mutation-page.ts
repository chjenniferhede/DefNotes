import * as api from '../data/api'
import { fetchNotebooks } from '../stores/notebooks'
import type { Page } from '../data/types'

export function useMutationPage() {
  async function createPage(notebookId: number | string, title = 'New Page') {
    const created = await api.createPage(notebookId, { title })
    await fetchNotebooks()
    return created
  }

  async function updatePage(notebookId: number | string, pageId: number | string, updates: Partial<Page>) {
    const updated = await api.updatePage(notebookId, pageId, updates)
    await fetchNotebooks()
    return updated
  }

  async function deletePage(notebookId: number | string, pageId: number | string) {
    await api.deletePage(notebookId, pageId)
    await fetchNotebooks()
  }

  return { createPage, updatePage, deletePage }
}


import type { Notebook, Page, CreateNotebookPayload, UpdateNotebookPayload, CreatePagePayload, UpdatePagePayload } from './types'
const API_URL = import.meta.env.VITE_API_URL

const base = (API_URL ? API_URL.replace(/\/$/, '') : '') || ''

function notebooksBase() {
  return base ? `${base}/notebooks` : '/notebooks'
}

export async function getNotebooks(includePages = true): Promise<Notebook[]> {
  const url = `${notebooksBase()}?includePages=${includePages}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch notebooks')
  return res.json()
}

export async function getNotebook(id: string | number): Promise<Notebook> {
  const res = await fetch(`${notebooksBase()}/${id}`)
  if (!res.ok) throw new Error('Failed to fetch notebook')
  return res.json()
}

export async function createNotebook(payload: CreateNotebookPayload): Promise<Notebook> {
  const res = await fetch(notebooksBase(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Failed to create notebook')
  return res.json()
}

export async function updateNotebook(id: string | number, payload: UpdateNotebookPayload): Promise<Notebook> {
  const res = await fetch(`${notebooksBase()}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Failed to update notebook')
  return res.json()
}

export async function deleteNotebook(id: string | number): Promise<void> {
  const res = await fetch(`${notebooksBase()}/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete notebook')
}

// Pages nested under notebook
export async function getPages(notebookId: string | number): Promise<Page[]> {
  const res = await fetch(`${notebooksBase()}/${notebookId}/pages`)
  if (!res.ok) throw new Error('Failed to fetch pages')
  return res.json()
}

export async function createPage(notebookId: string | number, payload: CreatePagePayload): Promise<Page> {
  const res = await fetch(`${notebooksBase()}/${notebookId}/pages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Failed to create page')
  return res.json()
}

export async function updatePage(notebookId: string | number, pageId: string | number, payload: UpdatePagePayload): Promise<Page> {
  const res = await fetch(`${notebooksBase()}/${notebookId}/pages/${pageId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Failed to update page')
  return res.json()
}

export async function deletePage(notebookId: string | number, pageId: string | number): Promise<void> {
  const res = await fetch(`${notebooksBase()}/${notebookId}/pages/${pageId}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete page')
}

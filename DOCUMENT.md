# DefNote Architecture and Function Map

This document describes what is implemented in the current codebase, based on direct source reading of web and api folders.

## 1. Stack and Runtime

- Frontend: React 19 + Vite + TypeScript + Tailwind CSS + Radix UI wrappers + Nanostores + TipTap editor.
- Backend: Hono (Node server) + TypeScript + Drizzle ORM + better-sqlite3.
- Database: SQLite file at api/sqlite.db (via Drizzle config and db/index).
- AI integration: Google Gemini model gemini-2.5-flash through @google/genai.

## 2. Backend Structure

### 2.1 Entry and Middleware

- api/src/server.ts
  - Starts Hono server on port 3000 using app.fetch.
- api/src/app.ts
  - Creates Hono app.
  - Adds CORS middleware for all routes:
    - origin is reflected from request origin
    - credentials enabled
    - methods GET, POST, PUT, PATCH, DELETE, OPTIONS
    - headers Content-Type, Authorization
  - Adds logger middleware.
  - Base route GET / returns Hello DefNote!.
  - Mounts notebook routes and glossary routes under /notebooks.

### 2.2 Route Map to Controllers

Notebook routes (api/src/routes/notebook.ts):
- GET /notebooks -> listNotebooks
- GET /notebooks/:id -> getNotebook
- POST /notebooks -> createNotebook
- PUT /notebooks/:id -> updateNotebook
- DELETE /notebooks/:id -> deleteNotebook
- GET /notebooks/:id/pages -> listPages
- POST /notebooks/:id/pages -> createPage
- GET /notebooks/:id/pages/:pageId -> getPage
- PUT /notebooks/:id/pages/:pageId -> updatePage
- DELETE /notebooks/:id/pages/:pageId -> deletePage

Glossary routes (api/src/routes/glossary.ts):
- GET /notebooks/:id/glossary -> listEntries
- GET /notebooks/:id/glossary/:termId -> getEntry
- POST /notebooks/:id/glossary/:termId -> refreshEntry

### 2.3 Database Schema

Defined in api/src/db/schema.ts:
- notebook
  - id, title, createDate, updatedDate, numberPage
- page
  - id, notebookId (FK notebook), title, content, createDate, updatedDate
- terms
  - id, notebookId (FK notebook), term
- mentions
  - id, termId (FK terms), excerptsJson, updatedAt
- glossary_entry
  - id, notebookId (FK notebook), termId (FK terms), sourceHash, content

DB connection in api/src/db/index.ts:
- new Database("sqlite.db")
- drizzle(connection, { schema })

Seed script in api/src/db/seed.ts:
- seed()
  - clears notebook and page tables
  - creates 2-4 notebooks with biology subject names
  - creates 7-10 pages each with faker text
  - updates notebook.numberPage

### 2.4 Controller Functions

api/src/controllers/notebookController.ts
- listNotebooks(c)
  - reads query includePages
  - returns notebooks only, or notebooks + pages loaded per notebook
- getNotebook(c)
  - fetch by id
  - returns 404 text if missing
- createNotebook(c)
  - parses JSON body
  - validates with notebookCreateSchema
  - creates notebook with title default Untitled
  - returns latest inserted notebook
- updateNotebook(c)
  - parses JSON body
  - validates with notebookUpdateSchema
  - updates title and updatedDate
  - returns updated notebook
- deleteNotebook(c)
  - deletes notebook by id
  - returns Deleted text
- listPages(c)
  - lists pages for notebook id
- createPage(c)
  - parses JSON body
  - validates with pageCreateSchema
  - inserts page with defaults (title Untitled, content empty)
  - then collectTermChanges(notebookId, newPageId, content)
  - runs maybeRunGlossaryUpdates(changes) only when explicitSave is true
- getPage(c)
  - gets one page by pageId
  - returns 404 text if missing
- updatePage(c)
  - parses JSON body
  - validates with pageUpdateSchema
  - patches title/content and updatedDate
  - collects term changes from updated content
  - runs maybeRunGlossaryUpdates(changes) only when explicitSave is true
- deletePage(c)
  - deletes page by pageId

api/src/controllers/glossaryController.ts
- listEntries(c)
  - returns glossary entries for notebook (join includes term text)
- parseId(value)
  - Number conversion helper, returns null if invalid
- getEntry(c)
  - validates notebookId and termId
  - verifies term exists in notebook
  - reads mention excerpts and computes sourceHash (sha256 of parsed excerpts JSON)
  - cache hit condition:
    - glossary entry exists
    - sourceHash unchanged
    - content non-empty
  - on cache miss:
    - summarizeTermContexts(term, snippets)
    - insert/update glossary entry
  - returns response with cached flag and content
- refreshEntry(c)
  - same validation path as getEntry
  - always regenerates summary and writes insert/update
  - returns response with forced: true

### 2.5 Domain Functions

api/src/domain/terms.ts
- extractTermsFromContent(content)
  - finds terms declared with regex pattern: defn <term>
  - term chars allowed: letters, numbers, underscore, hyphen
  - deduplicates terms in the page
- buildSnippetAround(content, index, term) [internal]
  - returns +/- 60 chars around term occurrence
- collectTermChanges(notebookId, pageId, content)
  - extracts declared terms from current page content
  - ensures term row exists (findTerm/createTerm)
  - scans all notebook pages for bare term occurrences with word boundary regex
  - builds up to 10 snippets, preferring most recently updated pages
  - writes mentions via upsertMentionsForTerm
  - hashes excerpts JSON via computeExcerptsHash
  - returns array of change objects for glossary update pipeline

api/src/domain/glossary-update.ts
- maybeRunGlossaryUpdates(changes)
  - loops through term changes
  - compares stored glossary_entry.sourceHash with excerptsHash
  - skips unchanged
  - triggers processGlossaryUpdate as background fire-and-forget
- getOrRefreshGlossaryEntry(notebookId, termId, force = false)
  - currently partial helper
  - returns cached entry when available and not forced
  - otherwise returns null
  - not referenced by current routes/controllers
- processGlossaryUpdate(...) [internal]
  - parses excerpts
  - summarizes top 10 snippets with Gemini
  - insert or update glossary entry

### 2.6 AI Function

api/src/ai/gemini.ts
- summarizeTermContexts(term, excerpts)
  - returns empty string when no excerpts
  - builds prompt instructing model to avoid external facts and format bullet points
  - calls ai.models.generateContent with model gemini-2.5-flash
  - throws if no text
  - returns response text

### 2.7 Repository Layer

api/src/repos/glossaryRepo.ts
- getGlossaryEntry(termId, notebookId)
- insertGlossaryEntry(notebookId, termId, sourceHash, content)
- updateGlossaryEntry(id, sourceHash, content)
- getEntriesByNotebook(notebookId) (left join terms for term label)

api/src/repos/mentionRepo.ts
- getMentionsByTermId(termId)
- addSnippetToMentions(termId, snippet)
  - append-or-create behavior, trims to 10 snippets
  - currently not called by current domain/controller flow
- upsertMentionsForTerm(termId, excerpts)
  - replaces excerptsJson (trim to 10)
  - returns changed boolean

api/src/repos/pageRepo.ts
- getPagesByNotebook(notebookId)
  - returns id, content, updatedDate only

api/src/repos/termRepo.ts
- findTerm(notebookId, term)
- createTerm(notebookId, term)
- getTermById(termId)
- getTermsByNotebook(notebookId) [exported, no current caller]
- deleteTerm(termId) [exported, no current caller]
- updateTerm(termId, newTerm) [exported, no current caller]

### 2.8 Utility and Validation

api/src/lib/glossaryUtils.ts
- safeParseExcerpts(excerptsJson)
  - tolerant parser for string or object entries
  - normalizes into [{ pageId?, snippet }]
- computeExcerptsHash(excerptsJson)
  - sha256 hash helper

api/src/lib/validators.ts
- notebookCreateSchema
- notebookUpdateSchema
- pageCreateSchema (title/content/explicitSave)
- pageUpdateSchema (title/content/explicitSave)

## 3. Backend Behavior Flow

Page save path:
1. Frontend updates a page through PUT /notebooks/:id/pages/:pageId.
2. updatePage writes page content.
3. collectTermChanges extracts defn terms from that content and refreshes mentions.
4. Only when explicitSave is true, maybeRunGlossaryUpdates is called.
5. Glossary update computes hash and summarizes snippets if changed.

Glossary read path:
1. GET /notebooks/:id/glossary/:termId validates term ownership.
2. Mentions are parsed and hashed.
3. If hash matches existing glossary_entry and content exists, cached content is returned.
4. Otherwise AI summary is generated and persisted.

## 4. Frontend Design and Structure

### 4.1 Frontend Composition

- web/src/main.tsx mounts App in StrictMode.
- web/src/App.tsx defines the shell:
  - top Header with search input and Save button
  - left SideBar (about 20% width, min 220px)
  - right content area showing either NotePage or GlossaryContent
- Selection uses page id convention glossary-<notebookId> to render glossary view.

### 4.2 Visual Design (as implemented)

Core tokens and styling:
- web/src/index.css
  - Tailwind layers and CSS variables for semantic colors
  - light and dark token sets are defined
- web/src/components/notepage.css
  - TipTap editor typography and block styles
  - toolbar with light gray background and active buttons in blue
- web/src/components/glossary-content.tsx
  - glossary cards use purple accent palette (header and borders)
- web/src/App.css
  - default Vite starter styles still present (#root max-width, center alignment, logo animation classes)

Layout and interaction patterns:
- Sidebar notebook list uses accordion sections.
- Each notebook section exposes New Page and a synthetic Glossary page item.
- Page and notebook titles support inline editing by double click.
- Editor has a rich formatting toolbar (headings, lists, code, blockquote, alignment, undo/redo).

### 4.3 API Client Functions

web/src/data/api.ts
- getNotebooks(includePages)
- getNotebook(id)
- createNotebook(payload)
- updateNotebook(id, payload)
- deleteNotebook(id)
- getPages(notebookId)
- createPage(notebookId, payload)
- updatePage(notebookId, pageId, payload)
- deletePage(notebookId, pageId)
- getGlossaryEntries(notebookId)

Behavior:
- Base URL derived from VITE_API_URL.
- updatePage logs backend error body before throwing on non-OK response.

### 4.4 State Stores

web/src/lib/store-notepage.ts
- atoms:
  - notebooksStore
  - currentNotebookIdStore
  - currentPageIdStore
- computed:
  - currentNotebookStore
  - currentPageStore
- functions:
  - fetchNotebooks
  - setNotebooks
  - updatePageInStore
  - addNotebookToStore
  - removeNotebookFromStore

web/src/lib/store-glossary.ts
- glossaryStore: notebookId -> glossary entries map
- fetchGlossaryEntries(notebookId)
- getGlossaryEntriesFromStore(notebookId)

web/src/stores/notebooks.ts
- re-export shim to store-notepage APIs (commented as deprecated).

### 4.5 Hook Functions

web/src/hooks/use-selection.ts
- selectNotebook
- selectPage
- selectGlossaryPage
- isPageSelected
- isNotebookSelected
- isGlossaryPageSelected

web/src/hooks/use-app-initialization.ts
- useAppInitialization(notebooks)
  - if no active notebook, selects first notebook and first page.

web/src/hooks/use-notebooks.ts
- useNotebooks() returns:
  - notebooks, load
  - createNotebook, updateNotebook, deleteNotebook
  - createPage, updatePage, deletePage

web/src/hooks/use-mutation-notebook.ts
- createNotebook(title)
  - optimistic append to notebooksStore
- updateNotebook(id, updates)
  - backend update + full refresh
- deleteNotebook(id)
  - backend delete + local remove

web/src/hooks/use-mutation-page.ts
- createPage(notebookId, title)
  - backend create + refresh notebooks
- updatePage(notebookId, pageId, updates)
  - backend update
  - optimistic local page patch (without explicitSave field)
  - full refresh notebooks
- deletePage(notebookId, pageId)
  - backend delete + refresh notebooks

web/src/hooks/use-glossary.ts
- useGlossary(notebookId)
  - loads glossary entries into glossaryStore
  - exposes entries, loading, refresh

### 4.6 Component Functions

web/src/components/header.tsx
- Header({ title, onSave })
  - renders search input and Save button
  - title prop is accepted but not rendered in visible markup

web/src/components/sidebar.tsx
- SideBar({ onAddNotebook, onAddPage, onEditNotebook })
  - wraps New Notebook action + Notebooks list

web/src/components/notebooks.tsx
- Notebooks({ onAddPage, onEditNotebook })
  - renders accordion of notebooks from store
  - supports notebook title inline edit (startEditing, finishEditing, cancelEditing)
  - notebook click selects notebook
  - per notebook renders GlossaryPage + pages

web/src/components/page.tsx
- Page({ page, notebookExpanded, notebookId })
  - click selects page
  - double click enables inline title edit
  - finishEditing updates title through updatePage

web/src/components/glossary-page.tsx
- GlossaryPage({ notebookId })
  - selects synthetic glossary page id glossary-<notebookId>

web/src/components/glossary-content.tsx
- GlossaryContent({ notebookId })
  - loading state, empty state, and glossary entry rendering

web/src/components/notepage.tsx
- MenuBar({ editor })
  - rich-text command buttons using TipTap command chain
- NotePage (forwardRef)
  - creates TipTap editor
  - onUpdate serializes editor JSON and calls updatePage continuously
  - triggerSave exposed by ref; sends explicitSave true
  - on selected page change, loads page content as JSON if parseable, otherwise plain text fallback

web/src/components/notebook.tsx
- Notebook component exists but is not currently imported by active app flow.

web/src/components/ui/*
- Radix and utility wrappers:
  - accordion.tsx
  - button.tsx
  - input.tsx
  - context-menu.tsx (present, not referenced by current app components)

## 5. Notable Implementation Characteristics

- Glossary generation is tied to explicit save, not every autosave update.
- Editor autosaves on every content update and then mutation hook also triggers full notebook refresh.
- App.tsx contains duplicated selection-sync effect block (same dependency set and logic appears twice).
- Header search input is visual only; no search logic is wired.
- Some exported backend and frontend modules are currently unused but present for future extension.

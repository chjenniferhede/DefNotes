-- Enable pgvector extension (required for vector(768) column)
CREATE EXTENSION IF NOT EXISTS vector;

-- Notebooks
CREATE TABLE IF NOT EXISTS "notebook" (
  "id" serial PRIMARY KEY,
  "title" text NOT NULL,
  "create_date" timestamp,
  "updated_date" timestamp,
  "number_page" integer NOT NULL DEFAULT 0
);

-- Pages
CREATE TABLE IF NOT EXISTS "page" (
  "id" serial PRIMARY KEY,
  "notebook_id" integer NOT NULL REFERENCES "notebook"("id") ON DELETE CASCADE,
  "title" text NOT NULL,
  "content" text NOT NULL DEFAULT '',
  "create_date" timestamp,
  "updated_date" timestamp
);

-- Terms
CREATE TABLE IF NOT EXISTS "terms" (
  "id" serial PRIMARY KEY,
  "notebook_id" integer NOT NULL REFERENCES "notebook"("id") ON DELETE CASCADE,
  "term" text NOT NULL
);

-- Mentions (term occurrences across pages)
CREATE TABLE IF NOT EXISTS "mentions" (
  "id" serial PRIMARY KEY,
  "term_id" integer NOT NULL REFERENCES "terms"("id") ON DELETE CASCADE,
  "excerpts_json" text NOT NULL,
  "updated_at" timestamp
);

-- Glossary entries (AI-summarized per term)
CREATE TABLE IF NOT EXISTS "glossary_entry" (
  "id" serial PRIMARY KEY,
  "notebook_id" integer NOT NULL REFERENCES "notebook"("id") ON DELETE CASCADE,
  "term_id" integer NOT NULL REFERENCES "terms"("id") ON DELETE CASCADE,
  "source_hash" text NOT NULL,
  "content" text NOT NULL DEFAULT ''
);

-- Uploaded documents
CREATE TABLE IF NOT EXISTS "document" (
  "id" serial PRIMARY KEY,
  "notebook_id" integer NOT NULL REFERENCES "notebook"("id") ON DELETE CASCADE,
  "filename" text NOT NULL,
  "file_type" text NOT NULL,
  "total_tokens" integer NOT NULL DEFAULT 0,
  "status" text NOT NULL DEFAULT 'pending',
  "uploaded_at" timestamp DEFAULT now()
);

-- Document chunks with embeddings
CREATE TABLE IF NOT EXISTS "document_chunk" (
  "id" serial PRIMARY KEY,
  "document_id" integer NOT NULL REFERENCES "document"("id") ON DELETE CASCADE,
  "notebook_id" integer NOT NULL REFERENCES "notebook"("id") ON DELETE CASCADE,
  "chunk_index" integer NOT NULL,
  "content" text NOT NULL,
  "token_count" integer NOT NULL,
  "embedding" vector(768)
);

-- Index for fast vector similarity search per notebook
CREATE INDEX IF NOT EXISTS document_chunk_notebook_embedding_idx
  ON document_chunk USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

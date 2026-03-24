import { GoogleGenAI } from "@google/genai";
import { env } from "../env.js";

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

const EMBEDDING_MODEL = "text-embedding-004";

// Generate vector embeddings for a given text using Gemini AI
export async function embedText(text: string): Promise<number[]> {
  const response = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: { parts: [{ text }] },
  });
  return response.embeddings?.[0]?.values ?? [];
}

// Sequential to stay within API rate limits
export async function embedBatch(texts: string[]): Promise<number[][]> {
  const results: number[][] = [];
  for (const text of texts) {
    const values = await embedText(text);
    results.push(values);
  }
  return results;
}

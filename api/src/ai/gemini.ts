import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

// Summarizes term contexts using Gemini AI
export async function summarizeTermContexts(
  term: string,
  excerpts: string[],
): Promise<string> {
  if (excerpts.length === 0) return "";

  const prompt = `
    You are organizing the user's notes.
    Do NOT add external knowledge.
    Do NOT invent facts.

    Term: ${term}

    Contexts:
    ${excerpts.map((e) => `- ${e}`).join("\n")}

    Organize these contexts into concise bullet points.
    `;

  // Call Gemini AI to generate the summary
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  if (!response.text) {
    throw new Error("No response from AI");
  }

  return response.text;
}

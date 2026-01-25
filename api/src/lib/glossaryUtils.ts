import { sha256 } from "crypto-sha";

export type ExcerptEntry = { pageId?: number; snippet: string };

export function safeParseExcerpts(
  excerptsJson: string | null | undefined,
): ExcerptEntry[] {
  if (!excerptsJson) return [];
  try {
    const parsed = JSON.parse(excerptsJson);
    if (!Array.isArray(parsed)) return [];
    const normalized: ExcerptEntry[] = parsed
      .map((x: any) => {
        if (typeof x === "string")
          return { snippet: String(x) } as ExcerptEntry;
        if (x && typeof x === "object") {
          const pageId =
            x.pageId !== undefined && x.pageId !== null
              ? Number(x.pageId)
              : undefined;
          const snippet = x.snippet ?? x.text ?? x.excerpt ?? "";
          return { pageId, snippet: String(snippet) } as ExcerptEntry;
        }
        return null;
      })
      .filter((e: ExcerptEntry | null) => !!e) as ExcerptEntry[];
    return normalized;
  } catch {
    return [];
  }
}

export async function computeExcerptsHash(excerptsJson: string) {
  return await sha256(excerptsJson);
}

export default null;

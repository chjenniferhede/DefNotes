import { sha256 } from "crypto-sha";

export function safeParseExcerpts(
  excerptsJson: string | null | undefined,
): string[] {
  if (!excerptsJson) return [];
  try {
    const parsed = JSON.parse(excerptsJson);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((x) => String(x));
  } catch {
    return [];
  }
}

export async function computeExcerptsHash(excerptsJson: string) {
  return await sha256(excerptsJson);
}

export default null;

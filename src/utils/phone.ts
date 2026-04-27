/**
 * Normalize Kenyan phone numbers to the E.164-like format without the plus:
 *  - accepted inputs: +2547XXXXXXXX, 2547XXXXXXXX, 07XXXXXXXX, 7XXXXXXXX
 *  - output: 2547XXXXXXXX
 *  - returns null for invalid numbers
 */
export function normalizeKenyanPhone(input: string | undefined | null): string | null {
  if (!input) return null;
  const cleaned = input.replace(/[\s()-]/g, "");

  // +2547XXXXXXXX or 2547XXXXXXXX
  if (/^\+?2547\d{8}$/.test(cleaned)) {
    return cleaned.replace(/^\+/, "");
  }

  // 07XXXXXXXX -> 2547XXXXXXXX
  if (/^07\d{8}$/.test(cleaned)) {
    return `254${cleaned.slice(1)}`;
  }

  // 7XXXXXXXX -> 2547XXXXXXXX
  if (/^7\d{8}$/.test(cleaned)) {
    return `254${cleaned}`;
  }

  return null;
}
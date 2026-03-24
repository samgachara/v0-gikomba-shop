export function sanitizeSearchInput(input: string) {
  return input
    .replace(/[%_]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .slice(0, 80)
}

export function generateInitial(text: string) {
  if (!text) return '';

  return text.trim()[0]?.toUpperCase() || '';
}

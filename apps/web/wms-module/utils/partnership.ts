export function formatEnumType(value: string): string {
  if (!value) return '';
  return value
    .split('_')
    .map((word) => word[0] + word.slice(1).toLowerCase())
    .join(' ');
}

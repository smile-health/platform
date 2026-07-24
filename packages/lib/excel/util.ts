export function sanitizeCell(value) {
  if (typeof value !== "string") return value;

  const dangerousChars = ["=", "+", "-", "@", "\t", "\r"];
  if (dangerousChars.some((char) => value.startsWith(char))) {
    return `'${value}`; // Prefix with single quote
  }
  return value;
}

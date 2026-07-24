export const sortObjectsByKey = <T>(arr: T[], key: keyof T): T[] => {
  return arr.slice().sort((a, b) =>
    String(a[key]).toLowerCase().localeCompare(String(b[key]).toLowerCase())
  )
}

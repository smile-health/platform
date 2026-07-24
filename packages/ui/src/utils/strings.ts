export function replaceSpaceWithDash(str = ''): string {
  return str.replace(/\s/g, '-').toLowerCase()
}

export function getFullName(firstname?: string, lastname?: string | null) {
  if (firstname) {
    if (lastname) {
      return `${firstname} ${lastname}`
    }
    return firstname
  }
  return '-'
}

export function capitalizeFirstLetter(string: string) {
  const firstLetter = string?.slice(0, 1)
  const remainingLetter = string?.slice(1, string?.length)
  return `${firstLetter?.toUpperCase()}${remainingLetter?.toLowerCase()}`
}

export const capitalize = (text: string) => {
  if (text.includes(' '))
    return text
      .split(' ')
      .map((item) => item.charAt(0).toUpperCase() + item.slice(1).toLowerCase())
      .join(' ')
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() || ''
}

export function generateMetaTitle(
  title: string,
  useGlobal = false,
  isSmile = true
) {
  const titleGlobal = useGlobal ? `Global ${title}` : title
  return isSmile ? `SMILE | ${titleGlobal}` : `WMS | ${titleGlobal}`
}

export function generateInitials(text: string) {
  if (!text) return ''

  const words = text.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ''

  const first = words[0][0] || ''
  const second = words.length > 1 ? words[1][0] : words[0][1] || ''

  return `${first}${second}`.toUpperCase()
}

export function formatToCelcius(temp: number | string | null): string {
  const temperatureUnit = process.env.TEMPERATURE_UNIT ?? 'C'
  return `${temp} \u00B0${temperatureUnit}`
}

export function wrapText(text: string, maxLength: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxLength) {
      currentLine += ` ${word}`
    } else {
      lines.push(currentLine.trim())
      currentLine = word
    }
  }
  if (currentLine) lines.push(currentLine.trim())

  return lines
}

export const truncateText = (text: string, maxLength: number = 50) => {
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text
}

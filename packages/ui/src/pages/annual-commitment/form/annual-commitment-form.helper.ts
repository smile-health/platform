import { parseDate } from '@internationalized/date'

export const loadYears = async (
  search: string,
  _loadedOptions: unknown,
  additional?: { page: number }
) => {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => ({
    label: String(currentYear - 5 + i),
    value: currentYear - 5 + i,
  }))
  return {
    options: years.filter((y) =>
      y.label.toLowerCase().includes(search.toLowerCase())
    ),
    hasMore: false,
    additional: { page: (additional?.page ?? 1) + 1 },
  }
}

export const dateToCalendarDate = (date: Date | null) => {
  if (!date) return null
  const year = String(date.getFullYear()).padStart(4, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return parseDate(`${year}-${month}-${day}`)
}

export const calendarDateToDate = (
  calendarDate: { year: number; month: number; day: number } | null
) => {
  if (!calendarDate) return null
  return new Date(calendarDate.year, calendarDate.month - 1, calendarDate.day)
}

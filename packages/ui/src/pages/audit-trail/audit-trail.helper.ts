import { removeEmptyObject } from '#utils/object'
import { getReactSelectValue } from '#utils/react-select'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { Values } from 'nuqs'

dayjs.extend(utc)
dayjs.extend(timezone)

// Same zone the axios interceptor sends in the `timezone` header.
const getUserTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone

/**
 * created_at arrives as UTC ISO ('...Z'); render it in the user's timezone.
 */
export function formatAuditDateTime(
  value?: string | null,
  format = 'DD/MM/YYYY HH:mm',
  tz: string = getUserTimezone()
) {
  if (!value) return '-'
  const d = dayjs.utc(value)
  if (!d.isValid()) return String(value)
  try {
    return d.tz(tz).format(format)
  } catch {
    return d.format(format)
  }
}

export function handleFilterParams(values: Values<Record<string, any>>) {
  const newData = {
    page: values?.page,
    paginate: values?.paginate,
    module: getReactSelectValue(values?.module),
    service: getReactSelectValue(values?.service),
    action: getReactSelectValue(values?.action),
    actor_id: getReactSelectValue(values?.actor_id),
    program_id: getReactSelectValue(values?.program_id),
    ...(values?.date_range?.start && {
      // CalendarDate → YYYY-MM-DD, the format the BE repository parses
      date_from: values?.date_range?.start?.toString(),
    }),
    ...(values?.date_range?.end && {
      date_to: values?.date_range?.end?.toString(),
    }),
  }

  return removeEmptyObject(newData)
}

import { TAuditLog } from '#services/audit-log'
import { removeEmptyObject } from '#utils/object'
import { getReactSelectValue } from '#utils/react-select'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { Values } from 'nuqs'

import { humanize } from './audit-trail.constants'

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

// Loose on purpose: react-i18next's typed, overloaded `t` is passed straight in,
// and matching it against a precise signature crashes tsc (overload Debug Failure).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Translate = (...args: any[]) => unknown

export type AuditLogChange = {
  field: string
  before?: string
  after: string
}

export type AuditLogDescription = {
  summary: string
  changes: AuditLogChange[]
}

const DESCRIBED_ACTIONS = [
  'create',
  'update',
  'delete',
  'login',
  'logout',
  'export',
  'activate',
  'update_status',
  'refresh',
]

// Keys that identify the row rather than describe the change; the id is in the JSON.
const HIDDEN_FIELDS = new Set(['id', 'program_id'])
const LABEL_FIELDS = ['name', 'title', 'code']
const MAX_VALUE_LENGTH = 40
// Id columns with translated labels (auditTrail:field.* / auditTrail:value.*).
const LABELLED_FIELDS = new Set(['order_status_id'])

/** `isActive` / `is_active` -> `Is Active` */
function humanizeField(key: string) {
  return humanize(key.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase())
}

function formatValue(value: unknown, t: Translate): string {
  if (value === null || value === undefined || value === '') return '-'
  if (Array.isArray(value)) {
    return String(t('auditTrail:description.items', { count: value.length }))
  }
  if (typeof value === 'object') return '…'
  const text = String(value)
  return text.length > MAX_VALUE_LENGTH
    ? `${text.slice(0, MAX_VALUE_LENGTH)}…`
    : text
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

/**
 * Human-readable "what changed" for an audit row. The capture middleware only
 * stores the request body as `metadata.after` (before is null), so for most
 * rows this lists the submitted fields; a real before/after is diffed.
 */
export function describeAuditLog(
  item: Pick<TAuditLog, 'action' | 'module' | 'metadata'>,
  t: Translate
): AuditLogDescription {
  const rawBefore = item.metadata?.before
  const rawAfter = item.metadata?.after
  const before = isPlainObject(rawBefore) ? rawBefore : null
  const after = isPlainObject(rawAfter) ? rawAfter : null

  const module = humanize(item.module ?? '')
  const rawLabel = LABEL_FIELDS.map((key) => after?.[key] ?? before?.[key]).find(
    (value) => typeof value === 'string' || typeof value === 'number'
  )
  const label = rawLabel !== undefined ? formatValue(rawLabel, t) : ''

  const summary = DESCRIBED_ACTIONS.includes(item.action)
    ? String(
        t(`auditTrail:description.${item.action}${label ? '_labeled' : ''}`, {
          module,
          label,
        })
      )
    : `${humanize(item.action ?? '')} ${module}`.trim()

  const changes: AuditLogChange[] = []
  if (after) {
    for (const [key, value] of Object.entries(after)) {
      if (HIDDEN_FIELDS.has(key)) continue
      const labelled = LABELLED_FIELDS.has(key)
      const format = (raw: unknown) =>
        labelled && raw != null
          ? String(
              t(`auditTrail:value.${key}.${raw}`, { defaultValue: String(raw) })
            )
          : formatValue(raw, t)
      const change: AuditLogChange = {
        field: labelled
          ? String(t(`auditTrail:field.${key}`))
          : humanizeField(key),
        after: format(value),
      }
      // Body fields that aren't columns (notes, reasons) have no before value.
      if (before && key in before) {
        if (JSON.stringify(before[key]) === JSON.stringify(value)) continue
        change.before = format(before[key])
      }
      changes.push(change)
    }
  }

  return { summary, changes }
}

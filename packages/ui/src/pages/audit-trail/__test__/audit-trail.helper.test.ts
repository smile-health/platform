import { formatAuditDateTime, handleFilterParams } from '../audit-trail.helper'
import {
  AUDIT_TRAIL_MODULE_OPTIONS,
  humanize,
} from '../audit-trail.constants'

describe('handleFilterParams', () => {
  it('maps service/action/module selects and date range to query params', () => {
    const result = handleFilterParams({
      page: 2,
      paginate: 10,
      service: { value: 'core', label: 'CORE' },
      action: { value: 'update', label: 'Update' },
      module: { value: 'material', label: 'Material' },
      date_range: {
        start: { toString: () => '2026-09-01' },
        end: { toString: () => '2026-09-05' },
      },
    } as any)

    expect(result).toEqual({
      page: 2,
      paginate: 10,
      service: 'core',
      action: 'update',
      module: 'material',
      date_from: '2026-09-01',
      date_to: '2026-09-05',
    })
  })

  it('drops empty filters', () => {
    expect(handleFilterParams({ page: 1, paginate: 10, module: null } as any)).toEqual({
      page: 1,
      paginate: 10,
    })
  })
})

describe('audit trail constants', () => {
  it('humanizes module names', () => {
    expect(humanize('stock_opname_period')).toBe('Stock Opname Period')
  })

  it('lists unique modules from all services', () => {
    const values = AUDIT_TRAIL_MODULE_OPTIONS.map((o) => o.value)
    expect(new Set(values).size).toBe(values.length)
    expect(values).toEqual(expect.arrayContaining(['material', 'transaction', 'auth', 'export']))
  })
})

describe('formatAuditDateTime', () => {
  it('renders UTC ISO in the given timezone', () => {
    expect(formatAuditDateTime('2026-09-28T17:00:00.000Z', undefined, 'Asia/Jakarta')).toBe(
      '29/09/2026 00:00'
    )
    expect(
      formatAuditDateTime('2026-09-29T01:02:03Z', 'DD/MM/YYYY HH:mm:ss', 'America/New_York')
    ).toBe('28/09/2026 21:02:03')
  })

  it('returns "-" for empty and raw value for invalid', () => {
    expect(formatAuditDateTime(null)).toBe('-')
    expect(formatAuditDateTime('garbage', undefined, 'UTC')).toBe('garbage')
  })

  it('falls back to UTC on an invalid timezone', () => {
    expect(formatAuditDateTime('2026-09-29T01:02:00Z', undefined, 'Nope/Zone')).toBe(
      '29/09/2026 01:02'
    )
  })
})

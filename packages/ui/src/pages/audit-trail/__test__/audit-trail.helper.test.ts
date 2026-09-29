import {
  describeAuditLog,
  formatAuditDateTime,
  handleFilterParams,
} from '../audit-trail.helper'
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

describe('describeAuditLog', () => {
  // Echo the key plus interpolation values so templates can be asserted.
  const t = (key: string, options?: Record<string, unknown>) =>
    options ? `${key}|${JSON.stringify(options)}` : key

  const log = (action: string, metadata: any, module = 'material') => ({
    action,
    module,
    metadata,
  })

  it('labels the record by name and lists submitted fields', () => {
    const result = describeAuditLog(
      log('create', { before: null, after: { id: 3, name: 'Paracetamol', isActive: 1 } }),
      t
    )
    expect(result.summary).toBe(
      'auditTrail:description.create_labeled|{"module":"Material","label":"Paracetamol"}'
    )
    expect(result.changes).toEqual([
      { field: 'Name', after: 'Paracetamol' },
      { field: 'Is Active', after: '1' },
    ])
  })

  it('diffs a real before/after and skips unchanged keys', () => {
    const result = describeAuditLog(
      log(
        'update',
        { before: { status: 1, period: 'Q1' }, after: { status: 2, period: 'Q1' } },
        'stock_opname_period'
      ),
      t
    )
    expect(result.summary).toBe(
      'auditTrail:description.update|{"module":"Stock Opname Period","label":""}'
    )
    expect(result.changes).toEqual([{ field: 'Status', before: '1', after: '2' }])
  })

  it('summarises arrays, objects and long values', () => {
    const result = describeAuditLog(
      log('update', {
        before: null,
        after: { material_ids: [1, 2, 3], detail: { a: 1 }, note: 'x'.repeat(50) },
      }),
      t
    )
    expect(result.changes).toEqual([
      { field: 'Material Ids', after: 'auditTrail:description.items|{"count":3}' },
      { field: 'Detail', after: '…' },
      { field: 'Note', after: `${'x'.repeat(40)}…` },
    ])
  })

  it('translates labelled id fields such as the order status', () => {
    const result = describeAuditLog(
      log(
        'update_status',
        { before: { order_status_id: 2 }, after: { comment: 'ok', order_status_id: 3 } },
        'order'
      ),
      t
    )
    expect(result.changes).toEqual([
      { field: 'Comment', after: 'ok' },
      {
        field: 'auditTrail:field.order_status_id',
        before: 'auditTrail:value.order_status_id.2|{"defaultValue":"2"}',
        after: 'auditTrail:value.order_status_id.3|{"defaultValue":"3"}',
      },
    ])
  })

  it('handles null metadata and unknown actions', () => {
    expect(describeAuditLog(log('delete', null), t)).toEqual({
      summary: 'auditTrail:description.delete|{"module":"Material","label":""}',
      changes: [],
    })
    expect(describeAuditLog(log('approve_all', null, 'order'), t).summary).toBe(
      'Approve All Order'
    )
  })
})

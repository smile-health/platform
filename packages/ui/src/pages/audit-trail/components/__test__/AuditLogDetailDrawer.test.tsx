import '../../../../__mocks__/i18next.mock'
import '../../../../__mocks__/common.mock'

jest.mock('#components/drawer', () => ({
  Drawer: ({ open, children }: any) => (open ? <div>{children}</div> : null),
  DrawerHeader: ({ title }: any) => <div>{title}</div>,
  DrawerContent: ({ children }: any) => <div>{children}</div>,
  DrawerFooter: ({ children }: any) => <div>{children}</div>,
}))

import React from 'react'
import { render, screen } from '@testing-library/react'
import { useTranslation } from 'react-i18next'

import AuditLogDetailDrawer from '../AuditLogDetailDrawer'

const item = {
  id: '1',
  service: 'core',
  program_id: '1',
  actor_id: '9',
  actor_name: 'admin',
  actor_role: 'SUPERADMIN',
  action: 'update',
  module: 'material',
  entity_id: '5',
  metadata: { before: { name: 'a' }, after: { name: 'b' } },
  ip: '10.0.0.1',
  created_at: '2026-09-01T10:00:00Z',
}

beforeEach(() => {
  ;(useTranslation as jest.Mock).mockReturnValue({
    t: (key: string) => key,
    i18n: { language: 'en' },
  })
})

describe('AuditLogDetailDrawer', () => {
  it('renders nothing when no item is selected', () => {
    render(<AuditLogDetailDrawer item={null} onClose={jest.fn()} />)
    expect(screen.queryByTestId('audit-log-metadata')).toBeNull()
  })

  it('shows pretty-printed metadata JSON', () => {
    render(<AuditLogDetailDrawer item={item} onClose={jest.fn()} />)
    const pre = screen.getByTestId('audit-log-metadata')
    expect(pre.textContent).toBe(JSON.stringify(item.metadata, null, 2))
  })

  it('shows the change summary above the JSON', () => {
    render(<AuditLogDetailDrawer item={item} onClose={jest.fn()} />)
    const changes = screen.getByTestId('audit-log-changes')
    expect(changes.textContent).toContain('auditTrail:description.update_labeled')
    expect(changes.textContent).toContain('Name: a → b')
  })

  it('shows empty state when metadata is null', () => {
    render(<AuditLogDetailDrawer item={{ ...item, metadata: null }} onClose={jest.fn()} />)
    expect(screen.getByText('auditTrail:detail.no_metadata')).toBeTruthy()
    expect(screen.getByText('auditTrail:description.no_changes')).toBeTruthy()
  })
})

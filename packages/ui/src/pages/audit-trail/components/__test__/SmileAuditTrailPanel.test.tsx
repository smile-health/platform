import '../../../../__mocks__/i18next.mock'
import '../../../../__mocks__/common.mock'

jest.mock('#hooks/useSetLoading', () => ({ useSetLoadingPopupStore: jest.fn() }))
jest.mock('#components/filter', () => ({
  useFilter: jest.fn(() => ({ query: {} })),
}))
jest.mock('#components/pagination', () => ({
  Pagination: () => null,
  PaginationContainer: ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  ),
  PaginationInfo: () => null,
  PaginationSelectLimit: () => null,
}))
jest.mock('#components/data-table', () => ({
  DataTable: ({ data }: { data?: unknown[] }) => (
    <table data-testid="audit-trail-table">
      <tbody>
        {(data ?? []).map((_, index) => (
          <tr key={index} data-testid="audit-trail-row" />
        ))}
      </tbody>
    </table>
  ),
}))
jest.mock('../AuditTrailFilter', () => ({
  __esModule: true,
  default: () => <div data-testid="audit-trail-filter" />,
}))
jest.mock('../RetentionSettingCard', () => ({
  __esModule: true,
  default: () => <div data-testid="retention-card" />,
}))
jest.mock('../AuditLogDetailDrawer', () => ({
  __esModule: true,
  default: () => null,
}))
jest.mock('../../hooks/useAuditTrailTable', () => ({
  __esModule: true,
  default: jest.fn(),
}))

import React from 'react'
import { render, screen } from '@testing-library/react'
import { useTranslation } from 'react-i18next'

import useAuditTrailTable from '../../hooks/useAuditTrailTable'
import SmileAuditTrailPanel from '../SmileAuditTrailPanel'

const mockedUseAuditTrailTable = useAuditTrailTable as jest.Mock
const mockedUseTranslation = useTranslation as jest.Mock

beforeEach(() => {
  jest.clearAllMocks()
  mockedUseTranslation.mockReturnValue({
    t: (key: string) => key,
    i18n: { language: 'id' },
  })
  mockedUseAuditTrailTable.mockReturnValue({
    tableColumns: [],
    dataSource: { data: [{ id: '1' }, { id: '2' }], total_item: 2, total_page: 1 },
    isLoading: false,
    page: 1,
    paginate: 10,
    handleChangePage: jest.fn(),
    handleChangePaginate: jest.fn(),
  })
})

describe('SmileAuditTrailPanel', () => {
  it('renders the filter and the read-only table', () => {
    render(<SmileAuditTrailPanel />)

    expect(screen.getByTestId('audit-trail-filter')).toBeTruthy()
    expect(screen.getByTestId('retention-card')).toBeTruthy()
    expect(screen.getByTestId('audit-trail-table')).toBeTruthy()
    expect(screen.getAllByTestId('audit-trail-row')).toHaveLength(2)
  })

  it('never renders a create/edit/delete action button', () => {
    render(<SmileAuditTrailPanel />)

    expect(screen.queryByRole('button', { name: /add|create|edit|delete/i })).toBeNull()
  })
})

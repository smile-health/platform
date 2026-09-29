import '../../../../__mocks__/i18next.mock'
import '../../../../__mocks__/common.mock'

jest.mock('#components/pagination', () => ({
  Pagination: () => null,
  PaginationContainer: ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  ),
  PaginationInfo: () => null,
}))
jest.mock('#components/data-table', () => ({
  DataTable: ({ data }: { data?: unknown[] }) => (
    <table data-testid="wms-audit-trail-table">
      <tbody>
        {(data ?? []).map((_, index) => (
          <tr key={index} data-testid="wms-audit-trail-row" />
        ))}
      </tbody>
    </table>
  ),
}))
jest.mock('../../hooks/useWasteBagAuditTrailTable', () => ({
  __esModule: true,
  default: jest.fn(),
}))

import React from 'react'
import { render, screen } from '@testing-library/react'
import { useTranslation } from 'react-i18next'

import useWasteBagAuditTrailTable from '../../hooks/useWasteBagAuditTrailTable'
import WasteBagAuditTrailPanel from '../WasteBagAuditTrailPanel'

const mockedUseWasteBagAuditTrailTable = useWasteBagAuditTrailTable as jest.Mock
const mockedUseTranslation = useTranslation as jest.Mock

beforeEach(() => {
  jest.clearAllMocks()
  mockedUseTranslation.mockReturnValue({
    t: (key: string) => key,
    i18n: { language: 'id' },
  })
  mockedUseWasteBagAuditTrailTable.mockReturnValue({
    tableColumns: [],
    dataSource: {
      data: [{ id: 1 }, { id: 2 }],
      pagination: { total: 2, pages: 1, currentPage: 1, perPage: 10 },
    },
    isLoading: false,
    page: 1,
    paginate: 10,
    search: '',
    handleChangePage: jest.fn(),
    handleChangePaginate: jest.fn(),
    handleChangeSearch: jest.fn(),
  })
})

describe('WasteBagAuditTrailPanel', () => {
  it('renders the WMS read-only table', () => {
    render(<WasteBagAuditTrailPanel />)

    expect(screen.getByTestId('wms-audit-trail-table')).toBeTruthy()
    expect(screen.getAllByTestId('wms-audit-trail-row')).toHaveLength(2)
  })

  it('never renders a create/edit/delete action button', () => {
    render(<WasteBagAuditTrailPanel />)

    expect(screen.queryByRole('button', { name: /add|create|edit|delete/i })).toBeNull()
  })
})

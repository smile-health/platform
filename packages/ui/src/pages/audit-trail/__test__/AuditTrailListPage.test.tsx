import '../../../__mocks__/i18next.mock'
import '../../../__mocks__/common.mock'

jest.mock('#hooks/usePermission', () => ({ usePermission: jest.fn(() => true) }))
jest.mock('#components/layouts/PageContainer', () => ({
  __esModule: true,
  default: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}))
jest.mock('#components/layouts/Meta', () => ({
  __esModule: true,
  default: () => null,
}))
jest.mock('../components/SmileAuditTrailPanel', () => ({
  __esModule: true,
  default: () => <div data-testid="smile-panel" />,
}))
jest.mock('../components/WasteBagAuditTrailPanel', () => ({
  __esModule: true,
  default: () => <div data-testid="wms-panel" />,
}))

import React from 'react'
import { render, screen } from '@testing-library/react'
import { useTranslation } from 'react-i18next'

import AuditTrailListPage from '../AuditTrailListPage'

const mockedUseTranslation = useTranslation as jest.Mock

beforeEach(() => {
  jest.clearAllMocks()
  mockedUseTranslation.mockReturnValue({
    t: (key: string) => key,
    i18n: { language: 'id' },
  })
})

describe('AuditTrailListPage', () => {
  it('shows both SMILE and WMS tabs, defaulting to SMILE', () => {
    render(<AuditTrailListPage />)

    expect(screen.getByText('auditTrail:tab.smile')).toBeTruthy()
    expect(screen.getByText('auditTrail:tab.wms')).toBeTruthy()
    expect(screen.getByTestId('smile-panel')).toBeTruthy()
  })
})

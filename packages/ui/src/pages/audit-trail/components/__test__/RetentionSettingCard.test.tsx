import '../../../../__mocks__/i18next.mock'
import '../../../../__mocks__/common.mock'

jest.mock('#shared/permission/index', () => ({ usePermission: jest.fn(() => true) }))
jest.mock('#components/toast', () => ({
  toast: { success: jest.fn(), danger: jest.fn() },
}))
jest.mock('#services/audit-log', () => ({
  getAuditLogSettings: jest.fn(),
  updateAuditLogSettings: jest.fn(),
}))

import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { toast } from '#components/toast'
import { getAuditLogSettings, updateAuditLogSettings } from '#services/audit-log'
import { useTranslation } from 'react-i18next'

import RetentionSettingCard from '../RetentionSettingCard'

const renderCard = () =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <RetentionSettingCard />
    </QueryClientProvider>
  )

beforeEach(() => {
  jest.clearAllMocks()
  ;(useTranslation as jest.Mock).mockReturnValue({
    t: (key: string) => key,
    i18n: { language: 'en' },
  })
  ;(getAuditLogSettings as jest.Mock).mockResolvedValue({ retention_days: 7 })
})

describe('RetentionSettingCard', () => {
  it('loads the current retention and saves a new value', async () => {
    ;(updateAuditLogSettings as jest.Mock).mockResolvedValue({ retention_days: 30 })
    renderCard()

    const input = (await screen.findByDisplayValue('7')) as HTMLInputElement
    fireEvent.change(input, { target: { value: '30' } })
    fireEvent.click(screen.getByText('auditTrail:retention.save'))

    await waitFor(() =>
      expect(updateAuditLogSettings).toHaveBeenCalledWith({ retention_days: 30 })
    )
    await waitFor(() => expect(toast.success).toHaveBeenCalled())
  })

  it('blocks out-of-range values', async () => {
    renderCard()
    const input = await screen.findByDisplayValue('7')
    fireEvent.change(input, { target: { value: '91' } })

    expect(screen.getByText('auditTrail:retention.invalid')).toBeTruthy()
    expect((screen.getByText('auditTrail:retention.save').closest('button') as HTMLButtonElement).disabled).toBe(true)
  })

  it('shows an error toast when saving fails', async () => {
    ;(updateAuditLogSettings as jest.Mock).mockRejectedValue(new Error('x'))
    renderCard()
    const input = await screen.findByDisplayValue('7')
    fireEvent.change(input, { target: { value: '10' } })
    fireEvent.click(screen.getByText('auditTrail:retention.save'))

    await waitFor(() => expect(toast.danger).toHaveBeenCalled())
  })
})

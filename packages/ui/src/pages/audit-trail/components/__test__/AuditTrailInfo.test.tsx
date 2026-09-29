import '../../../../__mocks__/i18next.mock'
import '../../../../__mocks__/common.mock'

import React from 'react'
import { render, screen } from '@testing-library/react'
import { useTranslation } from 'react-i18next'

import id from '../../locales/id.json'
import AuditTrailInfo from '../AuditTrailInfo'

// Resolve keys against the real Indonesian locale so the lists render.
const t = (key: string) =>
  key.split('.').reduce<any>((value, part) => value?.[part], id) ?? key

beforeEach(() => {
  ;(useTranslation as jest.Mock).mockReturnValue({ t, i18n: { language: 'id' } })
})

describe('AuditTrailInfo', () => {
  it('lists the data source and what is not included', () => {
    render(<AuditTrailInfo />)
    expect(screen.getByText(id.info.title)).toBeTruthy()
    expect(screen.getByText(id.info.source_title)).toBeTruthy()
    expect(screen.getByText(id.info.excluded_title)).toBeTruthy()
    expect(screen.getAllByRole('listitem')).toHaveLength(
      id.info.source.length + id.info.excluded.length
    )
  })

  it('shows the WMS note on the WMS tab', () => {
    render(<AuditTrailInfo variant="wms" />)
    expect(screen.getByText(id.info.wms)).toBeTruthy()
    expect(screen.queryByTestId('audit-trail-info')).toBeNull()
  })
})

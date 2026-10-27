import { getProgramHref } from '../program'

const fallback = (key?: string) => `/id/${key}/v5`

describe('getProgramHref', () => {
  it('routes waste_management programs to /wms/{lang}', () => {
    expect(
      getProgramHref({ app_type: 'waste_management' }, 'en', fallback, 'wms')
    ).toBe('/wms/en')
  })

  it('prefers explicit href and base_url over the WMS route', () => {
    expect(
      getProgramHref(
        { app_type: 'waste_management', href: '/custom' },
        'en',
        fallback
      )
    ).toBe('/custom')
    expect(
      getProgramHref(
        { app_type: 'waste_management', config: { base_url: 'https://x.test' } },
        'en',
        fallback
      )
    ).toBe('https://x.test')
  })

  it('uses the fallback for other programs', () => {
    expect(getProgramHref({ app_type: 'logistic' }, 'id', fallback, 'tb')).toBe(
      '/id/tb/v5'
    )
  })
})

import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { WmsProviders } from '@/provider/WmsProviders'
import { WmsAuthGate } from '@/components/WmsAuthGate'
import { LocaleProvider } from '@/utils/context/localeContext'
import {
  generateTailwindPalette,
  getReadableTextColor,
  resetTheme,
} from '@repo/ui/utils/color'

// packages/ui's shared components (e.g. Navbar's ui-bg-primary-500) key their color off
// --color-primary-* CSS vars, normally set by @repo/ui's useTheme() hook reading the
// active program from the [program] URL segment. WMS pages live at /wms/[lang]/** — no
// [program] segment — so that hook never finds 'waste-management' and silently falls
// back to the default (smile blue) theme. Force it here instead, matching
// ProgramWasteManagement().config.color from packages/ui/src/constants/program.ts.
const WMS_THEME_COLOR = '#068009'

function useWmsTheme() {
  useEffect(() => {
    const palette = generateTailwindPalette(WMS_THEME_COLOR)
    const textColor = getReadableTextColor(WMS_THEME_COLOR)

    if (textColor === 'dark') {
      document.documentElement.style.setProperty('--color-primary-contrast', palette[900])
      document.documentElement.style.setProperty('--color-primary-surface', palette[800])
    } else {
      document.documentElement.style.setProperty('--color-primary-contrast', palette[50])
      document.documentElement.style.setProperty('--color-primary-surface', palette[500])
    }

    Object.entries(palette).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-primary-${key}`, value)
    })

    return () => resetTheme()
  }, [])
}

// Mounted only for /wms/* routes (see pages/_app.js) — everything else on the platform
// renders through @repo/ui's own Provider untouched, so this never runs, and its bundle
// (redux, a second i18next instance, etc.) is only fetched when it's actually needed via
// next/dynamic in _app.js.
export function WmsRouteWrapper({ children }: { children: React.ReactNode }) {
  const { query } = useRouter()
  const locale = (query?.lang as string) || 'id'

  useWmsTheme()

  return (
    <LocaleProvider lang={locale}>
      <WmsProviders locale={locale}>
        <WmsAuthGate>{children}</WmsAuthGate>
      </WmsProviders>
    </LocaleProvider>
  )
}

export default WmsRouteWrapper

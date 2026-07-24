import { useEffect, useState } from 'react'

/** Breakpoints (px) — adjust to match your design system */
export const BREAKPOINTS = {
  mobile: 768,   // < 768px  → mobile
  tablet: 1024,  // 768–1023px → tablet
} as const

/**
 * Returns true while the viewport matches the given CSS media query string.
 *
 * @example
 * const isSmall = useMediaQuery('(max-width: 767px)')
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mql = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)

    // Modern browsers
    mql.addEventListener('change', handler)
    // Sync immediately in case query changed between render and effect
    setMatches(mql.matches)

    return () => mql.removeEventListener('change', handler)
  }, [query])

  return matches
}

/**
 * Convenience hook — returns flags for common breakpoints.
 *
 * | flag       | condition              |
 * |------------|------------------------|
 * | isMobile   | width < 768 px         |
 * | isTablet   | 768 px ≤ width < 1024 px |
 * | isDesktop  | width ≥ 1024 px        |
 *
 * @example
 * const { isMobile, isTablet } = useBreakpoint()
 */
export function useBreakpoint() {
  const isMobile = useMediaQuery(`(max-width: ${BREAKPOINTS.mobile - 1}px)`)
  const isTablet = useMediaQuery(
    `(min-width: ${BREAKPOINTS.mobile}px) and (max-width: ${BREAKPOINTS.tablet - 1}px)`
  )
  const isDesktop = useMediaQuery(`(min-width: ${BREAKPOINTS.tablet}px)`)

  return { isMobile, isTablet, isDesktop }
}

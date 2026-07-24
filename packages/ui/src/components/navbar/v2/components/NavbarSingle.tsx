import React, { forwardRef } from 'react'
import Link from 'next/link'
import useSmileRouter from '#hooks/useSmileRouter'
import cx from '#lib/cx'

type NavbarSingleProps = {
  title?: string
  active?: boolean
  url?: string
  isGlobal?: boolean
}

const NavbarSingle = forwardRef<HTMLButtonElement, NavbarSingleProps>(
  ({ title = '', active = false, url = '', isGlobal = false }, ref) => {
    const titleStyle = cx(
      'menu__main ui-font-thin ui-relative ui-h-full ui-w-auto ui-px-2 ui-py-2 ui-cursor-default hover:ui-text-primary-contrast ui-outline-none focus:ui-outline-none focus:ui-ring-0 focus-visible:outline-none',
      {
        'ui-font-bold': active,
      }
    )

    const router = useSmileRouter()

    const getParsedQueryFromAsPath = () => {
      const currentUrl = isGlobal
        ? router.getAsLinkGlobal(url)
        : router.getAsLink(url)
      if (window.location.pathname !== currentUrl) return undefined

      const queryString = router.asPath.split('?')[1] || ''
      const query: Record<string, string> = {}

      new URLSearchParams(queryString).forEach((value, key) => {
        query[key] = value
      })

      return query
    }

    const targetUrl = isGlobal
      ? router.getAsLinkGlobal(url, undefined, getParsedQueryFromAsPath())
      : router.getAsLink(url, undefined, getParsedQueryFromAsPath())
    return (
      <Link href={url ? targetUrl : '#'}>
        <button
          ref={ref}
          type="button"
          className={titleStyle}
          tabIndex={0}
          aria-label={title}
        >
          <div className="ui-flex ui-items-center ui-justify-start">
            {title}
          </div>
        </button>
      </Link>
    )
  }
)

export default NavbarSingle

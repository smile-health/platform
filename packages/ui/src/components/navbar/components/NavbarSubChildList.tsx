import React from 'react'
import Link from 'next/link'
import useSmileRouter from '#hooks/useSmileRouter'

const NavbarSubChildList = ({ title = '', url = '/', isGlobal = false }) => {
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
    <Link href={targetUrl}>
      <div className="ui-block ui-h-full ui-w-full">
        <div className="ui-my-1 ui-flex ui-cursor-pointer ui-items-center ui-justify-start ui-p-2 ui-will-change-transform ui-duration-300 ui-ease-in-out hover:ui-bg-primary-500/30 hover:ui-scale-[1.02]">
          <div className="ui-bg-neutral-500 ui-h-2 ui-w-2" />
          <div className="ui-text-dark-teal ui-ml-2 ui-h-full ui-w-full">
            {title}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default NavbarSubChildList

import React, { useContext, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import useSmileRouter from '#hooks/useSmileRouter'
import cx from '#lib/cx'
import { getReadableTextColor } from '#utils/color'

import { convertRgbToHex } from '../../libs/navbar.commons'
import { NavbarContext } from '../../libs/navbar.context'

const NavbarMenuListV2 = ({ title = '', url = '', isGlobal = false }) => {
  const { menuClicked } = useContext(NavbarContext)
  const [bgColor, setBgColor] = useState('#ffffff')

  useEffect(() => {
    const el = document.querySelector('.main__nav')
    if (el) {
      const computed = window.getComputedStyle(el).backgroundColor
      setBgColor(convertRgbToHex(computed))
    }
  }, [])

  const textColor = useMemo(() => getReadableTextColor(bgColor), [bgColor])

  if (title === '') return null

  const isActive = title === menuClicked?.title

  const titleStyle = cx(
    'menu__list ui-w-full ui-my-1 ui-flex ui-items-center ui-justify-start ui-gap-2 ui-bg-transparent ui-transition-colors ui-duration-300 ui-ease-in-out ui-p-2 ui-font-bold ui-text-primary-500 hover:ui-bg-primary-500/20 hover:ui-text-primary-500 hover:ui-brightness-200 ui-outline-none focus:ui-outline-none focus:ui-ring-0 focus-visible:outline-none',
    {
      'ui-text-primary-500 ui-brightness-200': isActive,
      'ui-cursor-default ui-text-primary-contrast hover:ui-text-primary-contrast hover:ui-bg-primary-500/60':
        isActive && textColor === 'dark',
      'ui-text-dark-teal ui-cursor-pointer hover:ui-bg-primary-500/60 hover:ui-text-primary-contrast':
        !isActive && textColor === 'dark',
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
      <button type="button" className={titleStyle} aria-pressed={isActive}>
        <span>{title}</span>
      </button>
    </Link>
  )
}

export default NavbarMenuListV2

import React, { useContext, useEffect, useMemo, useState } from 'react'
import ChevronRight from '#components/icons/ChevronRight'
import cx from '#lib/cx'
import { getReadableTextColor } from '#utils/color'

import { convertRgbToHex } from '../libs/navbar.commons'
import { NavbarContext } from '../libs/navbar.context'

const NavbarMenuList = ({ title = '', onClick = () => {} }) => {
  const { menuClicked } = useContext(NavbarContext)
  const [bgColor, setBgColor] = useState('#ffffff')
  const [show, setShow] = useState(false)

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

  const chevronRightStyle = cx(
    'ui-transition-opacity ui-duration-300 ui-ease-in-out',
    {
      'ui-opacity-100': show,
      'ui-opacity-0': !show,
    }
  )

  return (
    <button
      type="button"
      className={titleStyle}
      onClick={onClick}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      aria-pressed={isActive}
    >
      <span>{title}</span>
      <ChevronRight className={chevronRightStyle} />
    </button>
  )
}

export default NavbarMenuList

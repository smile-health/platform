import React, { useContext } from 'react'
import { HoverCardContent } from '@repo/ui/components/hover-card'

import { NavbarContext } from '../libs/navbar.context'
import { TLeftMenu } from '../libs/navbar.types'
import NavbarMenuList from './NavbarMenuList'
import NavbarOverviewLink from './NavbarOverviewLink'
import NavbarSubChildList from './NavbarSubChildList'

type NavbarSubmenuBoxProps = {
  submenuTitle?: string
  submenuDescription?: string
  isFirstMenu?: boolean
  leftSideMenus?: Array<TLeftMenu>
}

const NavbarSubmenuBox: React.FC<NavbarSubmenuBoxProps> = ({
  submenuTitle = '',
  submenuDescription = '',
  isFirstMenu = false,
  leftSideMenus = [],
}) => {
  const { setMenuClicked, menuClicked } = useContext(NavbarContext)

  const handleClick = (menu: TLeftMenu) => {
    setMenuClicked(menu)
  }

  const renderSubMenus = () => {
    return (
      menuClicked?.sub &&
      menuClicked?.sub?.length > 0 &&
      menuClicked?.sub?.map((sb, index) => (
        <div key={`sub__${sb?.subTitle ?? index}`} className="ui-mt-6">
          {sb?.subTitle && (
            <div className="ui-text-neutral-500 ui-border-neutral-300 ui-border-b ui-p-2 ui-uppercase">
              {sb.subTitle}
            </div>
          )}
          <div className="ui-mt-2">
            {sb?.subChild &&
              sb?.subChild?.length > 0 &&
              sb?.subChild?.map((sbChild, i) => (
                <div key={`sub__child__${sbChild?.title ?? i}`}>
                  {sbChild?.separator && (
                    <div className="ui-border-neutral-300 ui-border-b ui-my-2 ui-h-1 ui-w-full" />
                  )}
                  <NavbarSubChildList
                    title={sbChild?.title}
                    url={sbChild?.url}
                    isGlobal={sbChild?.isGlobal}
                  />
                </div>
              ))}
          </div>
        </div>
      ))
    )
  }

  return (
    <HoverCardContent
      align="start"
      className="!ui-p-0 !ui-w-[640px] ui-shadow-lg"
    >
      <nav className="ui-flex ui-items-start ui-justify-start ui-overflow-hidden ui-z-20 ui-text-sm">
        <div className="menu__left__submenu ui-h-full ui-px-2 ui-py-6 ui-bg-slate-50 ui-w-60">
          <div className="px-2">
            <h1 className="ui-text-dark-teal ui-mb-2 ui-text-lg ui-font-bold">
              {submenuTitle}
            </h1>
            <p className="ui-text-neutral-500 ui-text-sm ui-leading-5">
              {submenuDescription}
            </p>
            {isFirstMenu && <NavbarOverviewLink />}
          </div>
          {leftSideMenus.length > 0 && (
            <ul className="ui-my-8 ui-px-2">
              {leftSideMenus.length > 0 &&
                leftSideMenus?.map((menu, index) => (
                  <li key={index?.toString()}>
                    <NavbarMenuList
                      title={menu?.title}
                      onClick={() => handleClick(menu)}
                    />
                  </li>
                ))}
            </ul>
          )}
        </div>
        <div className="ui-h-full ui-flex-1 ui-bg-white ui-px-4 ui-py-5">
          {menuClicked?.chosenTitle && (
            <div className="ui-text-neutral-500 ui-p-2 ui-font-bold ui-uppercase">
              {menuClicked.chosenTitle}
            </div>
          )}
          {renderSubMenus()}
        </div>
      </nav>
    </HoverCardContent>
  )
}

export default NavbarSubmenuBox

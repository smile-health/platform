import React from 'react'
import { HoverCardContent } from '@repo/ui/components/hover-card'

import { TLeftMenu } from '../../libs/navbar.types'
import NavbarMenuListV2 from './NavbarMenuListV2'

type NavbarSubmenuBoxV2Props = {
  submenuTitle?: string
  submenuDescription?: string
  isFirstMenu?: boolean
  leftSideMenus?: Array<TLeftMenu>
}

const NavbarSubmenuBoxV2: React.FC<NavbarSubmenuBoxV2Props> = ({
  leftSideMenus = [],
}) => {
  return (
    <HoverCardContent
      align="start"
      className="!ui-p-0 !ui-w-[250px] ui-shadow-lg"
    >
      <nav className="ui-flex ui-items-start ui-justify-start ui-overflow-hidden ui-z-20 ui-text-sm">
        <div className="menu__left__submenu ui-h-full ui-py-4 ui-bg-[#FFFFFF] ui-w-60">
          {leftSideMenus.length > 0 && (
            <ul className="ui-px-2">
              {leftSideMenus.length > 0 &&
                leftSideMenus?.map((menu, index) => (
                  <li key={index?.toString()}>
                    <NavbarMenuListV2
                      title={menu?.title}
                      url={menu?.url}
                      isGlobal={menu?.isGlobal}
                    />
                  </li>
                ))}
            </ul>
          )}
        </div>
      </nav>
    </HoverCardContent>
  )
}

export default NavbarSubmenuBoxV2

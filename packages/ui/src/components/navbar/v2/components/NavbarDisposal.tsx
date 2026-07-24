import { useMemo } from 'react'
import { NextRouter } from 'next/router'
import { HoverCardRoot } from '#components/hover-card'
import useSmileRouter from '#hooks/useSmileRouter'
import { hasPermission } from '#shared/permission/index'
import { useTranslation } from 'react-i18next'

import NavbarList from '../../components/NavbarList'
import {
  filterSingleMenus,
  isActiveSingleMenu,
} from '../../libs/navbar.commons'
import { TLeftMenu } from '../../libs/navbar.types'
import NavbarSubmenuBoxV2 from './NavbarSubmenuBoxV2'

const NavbarDisposal = () => {
  const { t } = useTranslation(['common', 'navbar'])
  const router = useSmileRouter()

  const rawMenus: TLeftMenu[] = useMemo(
    () => [
      {
        title: t('navbar:navbar_disposal_shipping'),
        url: `/v5/disposal-shipment`,
        isHidden: !hasPermission('disposal-distribution-view'),
      },
      {
        title: t('navbar:navbar_self_disposal'),
        url: `/v5/self-disposal`,
        isHidden: !hasPermission('self-disposal-view'),
      },
      {
        title: t('navbar:navbar_disposal_instruction'),
        url: `/v5/disposal-instruction`,
        isHidden: !hasPermission('disposal-instruction-view'),
      },
    ],
    [t]
  )

  const leftSideMenus = useMemo(() => filterSingleMenus(rawMenus), [rawMenus])

  const title = t('common:menu.disposal.title')

  if (leftSideMenus.length <= 0) return null
  return (
    <HoverCardRoot defaultOpen={false} openDelay={100} closeDelay={100}>
      <NavbarList
        title={title}
        active={isActiveSingleMenu(router as NextRouter, leftSideMenus)}
        className="!ui-px-2"
      />
      <NavbarSubmenuBoxV2 leftSideMenus={leftSideMenus} />
    </HoverCardRoot>
  )
}

export default NavbarDisposal

import React, { useMemo } from 'react'
import { NextRouter } from 'next/router'
import { HoverCardRoot } from '#components/hover-card'
import useSmileRouter from '#hooks/useSmileRouter'
import { useTranslation } from 'react-i18next'
import { useFeatureIsOn } from '@growthbook/growthbook-react'

import NavbarList from '../../components/NavbarList'
import {
  filterSingleMenus,
  isActiveSingleMenu,
} from '../../libs/navbar.commons'
import { TLeftMenu } from '../../libs/navbar.types'
import NavbarSubmenuBoxV2 from './NavbarSubmenuBoxV2'
import { getProgramStorage } from '#utils/storage/program'
import { ProgramEnum } from '#constants/program'

const NavbarDashboard = () => {
  const { t } = useTranslation(['common', 'navbar'])
  const router = useSmileRouter()
  const program = getProgramStorage()
  const isShowMicroplanning = useFeatureIsOn('dashboard.microplanning')

  const rawMenus: TLeftMenu[] = useMemo(
    () => [
      {
        title: t('navbar:nav_dashboard_microplanning'),
        url: `/v5/dashboard/microplanning`,
        isHidden: program?.key !== ProgramEnum.Immunization || !isShowMicroplanning,
      },
    ],
    [t, isShowMicroplanning]
  )

  const leftSideMenus = useMemo(() => filterSingleMenus(rawMenus), [rawMenus])
  const title = t('common:menu.dashboard.title')

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

export default NavbarDashboard

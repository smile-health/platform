import React, { useMemo } from 'react'
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
import { useFeatureIsOn } from '@growthbook/growthbook-react'
import { getProgramStorage } from '#utils/storage/program'
import { ProgramEnum } from '#constants/program'

const NavbarScreening = () => {
  const { t } = useTranslation(['common', 'navbar'])
  const router = useSmileRouter()
  const isCursor = useFeatureIsOn('list-screening-cursor')
  const program = getProgramStorage()
  const rawMenus: TLeftMenu[] = useMemo(
    () => [
      {
        title: t('common:menu.setting.item.environmental_health_history'),
        url: `/v5/environmental-health-history`,
        isHidden: program?.key !== ProgramEnum.Kesling || !hasPermission('environmental-health-history-view'),
      },
    ],
    [t, isCursor]
  )

  const leftSideMenus = useMemo(() => filterSingleMenus(rawMenus), [rawMenus])

  const title = t('navbar:nav_screening')

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

export default NavbarScreening

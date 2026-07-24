import React, { useMemo } from 'react'
import { NextRouter } from 'next/router'
import { useFeatureIsOn } from '@growthbook/growthbook-react'
import { HoverCardRoot } from '#components/hover-card'
import useSmileRouter from '#hooks/useSmileRouter'
import { hasPermission } from '#shared/permission/index'
import { getProgramStorage } from '#utils/storage/program'
import { useTranslation } from 'react-i18next'

import NavbarList from '../../components/NavbarList'
import {
  filterSingleMenus,
  isActiveSingleMenu,
} from '../../libs/navbar.commons'
import { TLeftMenu } from '../../libs/navbar.types'
import NavbarSubmenuBoxV2 from './NavbarSubmenuBoxV2'

const NavbarAnnual = () => {
  const { t } = useTranslation(['common', 'navbar'])
  const router = useSmileRouter()
  const program = getProgramStorage()

  const isShowAnnualPlanningProcess = useFeatureIsOn('annual_planning.process')
  const isShowAnnualPlanningProgramPlan = useFeatureIsOn(
    'annual_planning.program_plan'
  )
  const isShowAnnualPlanningRealization = useFeatureIsOn(
    'annual_planning.realization'
  )
  const isEnabledAnnualPlanning = program?.config?.is_annual_planning

  const isShowAnnualCommitment = useFeatureIsOn('annual_commitment')

  const rawMenus: TLeftMenu[] = useMemo(
    () => [
      {
        title: t('navbar:nav_annual_planning'),
        url: `/v5/annual-planning`,
        isHidden:
          !hasPermission('annual-planning-process-view') ||
          !isShowAnnualPlanningProcess ||
          !isEnabledAnnualPlanning,
      },
      {
        title: t('navbar:nav_annual_commitment'),
        url: `/v5/annual-commitment`,
        isHidden:
          !hasPermission('annual-commitment-view') ||
          !isShowAnnualCommitment ||
          !isEnabledAnnualPlanning,
      },
      {
        title: t('navbar:nav_program_plan'),
        url: `/v5/program-plan`,
        isHidden:
          !hasPermission('program-plan-view') ||
          !isShowAnnualPlanningProgramPlan ||
          !isEnabledAnnualPlanning,
      },
      {
        title: t('navbar:nav_realization'),
        url: `/v5/annual-realization`,
        isHidden:
          !isShowAnnualPlanningRealization ||
          !isEnabledAnnualPlanning,
      },
    ],
    [
      t,
      isShowAnnualPlanningProcess,
      isShowAnnualCommitment,
      isShowAnnualPlanningProgramPlan,
      isShowAnnualPlanningRealization,
      isEnabledAnnualPlanning,
    ]
  )

  const leftSideMenus = useMemo(() => filterSingleMenus(rawMenus), [rawMenus])
  const title = t('common:menu.annual.title')

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

export default NavbarAnnual

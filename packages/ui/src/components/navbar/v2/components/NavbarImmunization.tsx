import React, { useMemo } from 'react'
import { NextRouter } from 'next/router'
import { useFeatureIsOn } from '@growthbook/growthbook-react'
import { HoverCardRoot } from '@repo/ui/components/hover-card'
import { ProgramEnum } from '#constants/program'
import { USER_ROLE } from '#constants/roles'
import useSmileRouter from '#hooks/useSmileRouter'
import { getProgramStorage } from '#utils/storage/program'
import { getUserStorage } from '#utils/storage/user'
import { useTranslation } from 'react-i18next'

import NavbarList from '../../components/NavbarList'
import {
  filterSingleMenus,
  getBmhpApprovalUrl,
  isActiveSingleMenu,
} from '../../libs/navbar.commons'
import { TLeftMenu } from '../../libs/navbar.types'
import NavbarSubmenuBoxV2 from './NavbarSubmenuBoxV2'

const NavbarImmunization = () => {
  const { t } = useTranslation(['common', 'navbar'])
  const router = useSmileRouter()
  const program = getProgramStorage()
  const user = getUserStorage()
  const isBmhpEnabled = useFeatureIsOn('feature.bmhp')
  const isBmhpApprovalEnabled = useFeatureIsOn('feature.bmhp-approval')

  const rawMenus: TLeftMenu[] = useMemo(
    () => [
      {
        title: t('common:menu.immunization.item.bmhp_history'),
        url: `/v5/bmhp-planning/history`,
        isHidden: program?.key !== ProgramEnum.BMHP || !isBmhpEnabled,
      },
      {
        title: t('common:menu.immunization.item.master_pemeriksaan_label'),
        url: `/v5/bmhp-planning`,
        isHidden:
          program?.key !== ProgramEnum.BMHP ||
          !isBmhpEnabled ||
          !(
            user?.role &&
            [USER_ROLE.SUPERADMIN, USER_ROLE.ADMIN].includes(user.role)
          ),
      },
      {
        title: t('common:menu.immunization.item.annual_needs_calculation'),
        url: getBmhpApprovalUrl(user?.entity?.type),
        isHidden: program?.key !== ProgramEnum.BMHP || !isBmhpApprovalEnabled,
      },
    ],
    [t, program?.key, user?.role, isBmhpEnabled, isBmhpApprovalEnabled]
  )

  const leftSideMenus = useMemo(() => filterSingleMenus(rawMenus), [rawMenus])
  const title = t('common:menu.immunization.title')

  // Only show for bmhp-skrining program with feature flag enabled
  if (program?.key !== 'bmhp-skrining' || !isBmhpEnabled) return null

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

export default NavbarImmunization
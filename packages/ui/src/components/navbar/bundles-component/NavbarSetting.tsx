import React, { useEffect, useMemo, useState } from 'react'
import { NextRouter } from 'next/router'
import { HoverCardRoot } from '@repo/ui/components/hover-card'
import useSmileRouter from '#hooks/useSmileRouter'
import { hasPermission } from '#shared/permission/index'
import { getProgramStorage } from '#utils/storage/program'
import { useTranslation } from 'react-i18next'

import NavbarList from '../components/NavbarList'
import NavbarSubmenuBox from '../components/NavbarSubmenuBox'
import { filterLeftMenus, isActiveMenu } from '../libs/navbar.commons'
import { FIRST_SUBMENU_INDEX } from '../libs/navbar.constants'
import { NavbarContext } from '../libs/navbar.context'
import { TLeftMenu } from '../libs/navbar.types'
import { useTransactionBeneficiaryConfigFlag } from '#hooks/useTransactionBeneficiaryConfigFlag'

const NavbarSetting = () => {
  const { t } = useTranslation(['common', 'navbar'])
  const [menuClicked, setMenuClicked] = useState<TLeftMenu>(null)
  const router = useSmileRouter()
  const contextValue = useMemo(
    () => ({ setMenuClicked, menuClicked }),
    [setMenuClicked, menuClicked]
  )
  const program = getProgramStorage()
  const {
    showMenuProtocol
  } = useTransactionBeneficiaryConfigFlag()

  const rawMenus: TLeftMenu[] = useMemo(
    () => [
      {
        title: t('navbar:navbar_setting_general'),
        chosenTitle: t('navbar:navbar_setting_general'),
        sub: [
          {
            subChild: [
              {
                title: t('common:menu.setting.item.user'),
                url: `/v5/user`,
                isHidden: !hasPermission('user-view'),
              },
              {
                title: t('common:menu.setting.item.activity'),
                url: `/v5/activity`,
                isHidden: !hasPermission('activity-view'),
              },
              {
                title: t('common:menu.setting.item.entity'),
                url: `/v5/entity`,
                isHidden: !hasPermission('entity-view'),
              },
              {
                title: t('common:menu.setting.item.budget_source'),
                url: `/v5/budget-source`,
                isHidden: !hasPermission('budget-source-view'),
              },
            ],
          },
        ],
      },
      {
        title: t('common:menu.dashboard.item.stock_taking'),
        chosenTitle: t('common:menu.dashboard.item.stock_taking'),
        sub: [
          {
            subChild: [
              {
                title: t('common:menu.setting.item.stocktacking_period'),
                url: `/v5/period-of-stock-taking`,
                isHidden: !hasPermission('period-of-stock-taking-view'),
              },
              {
                //  Not found
                title: t('navbar:nav_freeze_transaction'),
                url: `/v5/freeze-transaction`,
                isHidden: true,
              },
            ],
          },
        ],
      },
      {
        title: t('navbar:nav_material'),
        chosenTitle: t('navbar:nav_material'),
        sub: [
          {
            subChild: [
              {
                title: t('navbar:nav_material'),
                url: `/v5/material`,
                isHidden: !hasPermission('material-view'),
              },
              {
                title: t('navbar:nav_material_volume_management'),
                url: `/v5/material-volume-management`,
                isHidden:
                  program?.config?.material?.is_hierarchy_enabled ||
                  !hasPermission('material-volume-management-global-view'),
              },
              {
                title: t('common:menu.setting.item.import_material_entity'),
                url: `/v5/entity-material-bulk`,
                isHidden: !hasPermission('entity-mutate'),
              },
              {
                title: t('common:menu.setting.item.protocol'),
                url: `/v5/protocol`,
                isHidden: !hasPermission('protocol-view') || !showMenuProtocol,
              },
            ],
          },
        ],
      },
      {
        title: t('navbar:nav_asset'),
        chosenTitle: t('navbar:nav_asset'),
        sub: [
          {
            subChild: [
              {
                title: 'Master WHO PQS',
                url: `/v5/cold-chain-equipment`,
                isHidden:
                  program?.config?.material?.is_hierarchy_enabled ||
                  !hasPermission('coldchain-equipment-view'),
              },
              {
                title: t('navbar:nav_manufacture'),
                url: `/v5/manufacturer`,
                isHidden: !hasPermission('manufacturer-view'),
              },
              {
                title: t('navbar:navbar_temp_monitoring_tool_management'),
                url: `/v5/asset-management`,
                isHidden:
                  program?.config?.material?.is_hierarchy_enabled ||
                  !hasPermission('asset-management-view'),
              },
              {
                title: t('navbar:nav_communication_provider'),
                url: `/v5/communication-provider`,
                isHidden:
                  program?.config?.material?.is_hierarchy_enabled ||
                  !hasPermission('communication-provider-view'),
              },
            ],
          },
        ],
      },
    ],
    [t, program]
  )

  const leftSideMenus = useMemo(() => filterLeftMenus(rawMenus), [rawMenus])

  const hasMatchingSubChildUrl = (menu: TLeftMenu, path: string) => {
    return menu?.sub?.some((child) =>
      child?.subChild?.some((subChild) =>
        path.includes(subChild?.url as string)
      )
    )
  }

  useEffect(() => {
    const targetIndex = leftSideMenus?.findIndex((menu) =>
      hasMatchingSubChildUrl(menu, router.asPath)
    )
    setMenuClicked(
      leftSideMenus[
      targetIndex !== -1 ? targetIndex : FIRST_SUBMENU_INDEX
      ] as TLeftMenu
    )
  }, [t])

  const title = t('navbar:nav_setting')

  if (leftSideMenus.length <= 0) return null
  return (
    <NavbarContext.Provider value={contextValue}>
      <HoverCardRoot defaultOpen={false} openDelay={100} closeDelay={100}>
        <NavbarList
          title={title}
          active={
            isActiveMenu(router as NextRouter, leftSideMenus) ||
            router.asPath.includes(`/v5/dashboard/inventory-overview`)
          }
        />
        <NavbarSubmenuBox
          submenuTitle={title}
          submenuDescription={t('navbar:navbar_setting_description')}
          leftSideMenus={leftSideMenus}
        />
      </HoverCardRoot>
    </NavbarContext.Provider>
  )
}

export default NavbarSetting

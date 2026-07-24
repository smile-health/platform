import React, { useEffect, useMemo, useState } from 'react'
import { NextRouter } from 'next/router'
import { HoverCardRoot } from '@repo/ui/components/hover-card'
import useSmileRouter from '#hooks/useSmileRouter'
import { hasPermission } from '#shared/permission/index'
import { useTranslation } from 'react-i18next'

import NavbarList from '../components/NavbarList'
import NavbarSubmenuBox from '../components/NavbarSubmenuBox'
import { filterLeftMenus, isActiveMenu } from '../libs/navbar.commons'
import { FIRST_SUBMENU_INDEX } from '../libs/navbar.constants'
import { NavbarContext } from '../libs/navbar.context'
import { TLeftMenu } from '../libs/navbar.types'

const NavbarDashboard = () => {
  const { t } = useTranslation(['common', 'navbar'])
  const [menuClicked, setMenuClicked] = useState<TLeftMenu>(null)
  const router = useSmileRouter()
  const contextValue = useMemo(
    () => ({ setMenuClicked, menuClicked }),
    [setMenuClicked, menuClicked]
  )

  const rawMenus: TLeftMenu[] = useMemo(
    () => [
      {
        title: t('common:menu.report.item.planning.title'),
        chosenTitle: t('navbar:navbar_planning_dashboard'),
        sub: [
          {
            subChild: [
              {
                // Not found
                title: t('common:menu.report.item.yearly'),
                url: `/v5/perencanaan-tahunan`,
                isHidden: true,
              },
              {
                // Not found
                title: t(
                  'navbar:nav_dashboard_annual_commitment_vs_realization'
                ),
                url: `/v5/dashboard-annual-commitment-vs-realization`,
                isHidden: true,
              },
              {
                // Not found
                title: 'SMILE vs SMDV',
                url: `/v5/smile-vs-smdv`,
                isHidden: true,
              },
            ],
          },
        ],
      },
      {
        title: t('navbar:nav_order'),
        chosenTitle: t('navbar:navbar_dashboard_order'),
        sub: [
          {
            subChild: [
              {
                // Not found
                title: t('navbar:nav_order_response'),
                url: `/v5/dashboard/order-response`,
                isHidden: !hasPermission('dashboard-order-response-view'),
              },
              {
                //  Not found
                title: t('navbar:nav_order_difference'),
                url: `/v5/dashboard/order-difference`,
                isHidden: !hasPermission('dashboard-order-difference-view'),
              },
              {
                //  Not found
                title: t('navbar:nav_consumption_supply'),
                url: `/v5/dashboard/consumption-supply`,
                isHidden: !hasPermission('dashboard-consumption-supply-view'),
              },
            ],
          },
        ],
      },
      {
        title: t('common:menu.dashboard.item.transaction.title'),
        chosenTitle: t('navbar:navbar_dashboard_transaction'),
        sub: [
          {
            subTitle: t('common:menu.dashboard.item.transaction.title'),
            subChild: [
              {
                //  Not found
                title: t('navbar:nav_dashboard_general_transaction'),
                url: `/v5/dashboard/covid-19/big-data`,
                isHidden: true,
              },
              {
                //   Not found
                title: t('navbar:nav_dashboard_detail_transaction_v2'),
                url: `/v5/dashboard/covid-19/v3/big-data`,
                isHidden: true,
              },
              {
                //   Not found
                title: t('navbar:nav_dashboard_cascade'),
                url: `/v5/dashboard/cascade-transaction/big-data`,
                isHidden: true,
              },
              {
                //   Not found
                title: t('navbar:nav_dashboard_monev'),
                url: `/v5/dashboard/monev/big-data`,
                isHidden: true,
              },
              {
                //   Not found
                title: t('navbar:nav_count_transaction'),
                url: `/v5/report/count-transaction/big-data`,
                isHidden: true,
              },
              {
                //   Not found
                title: t('navbar:nav_reconciliation_activity'),
                url: `/v5/report/reconciliation`,
                isHidden: !hasPermission('reconciliation-activity-view'),
              },
            ],
          },
          {
            subTitle: t('navbar:nav_consumption'),
            subChild: [
              {
                title: t('navbar:nav_dashboard_monitoring_transaction'),
                url: `/v5/dashboard/transaction-monitoring`,
                isHidden: !hasPermission(
                  'dashboard-monitoring-transaction-view'
                ),
              },
              {
                title: 'SMILE vs ASIK',
                url: `/v5/dashboard/asik`,
                isHidden: !hasPermission('dashboard-asik-view'),
              },
              {
                //  Not found
                title: t('navbar:navbar_rabies'),
                url: `/v5/dashboard/immunization-rabies`,
                isHidden: true,
              },
            ],
          },
        ],
      },
      {
        title: t('navbar:navbar_inventory'),
        chosenTitle: t('navbar:navbar_inventory_dashboard'),
        sub: [
          {
            subChild: [
              {
                title: t('navbar:nav_on_hand_stock'),
                url: `/v5/dashboard/stock`,
                isHidden: !hasPermission('dashboard-stock-view'),
              },
              {
                title: t('navbar:navbar_inventory_stock_detail'),
                url: `/v5/stock`,
                isHidden: !hasPermission('stock-view'),
              },
              {
                //  Not found
                title: t('navbar:nav_abnormal_stock'),
                url: `/v5/dashboard/abnormal-stock`,
                isHidden: !hasPermission('dashboard-abnormal-stock-view'),
              },
              {
                //  Not found
                title: t('navbar:nav_stock_availability'),
                url: `/v5/dashboard/stock-availability`,
                isHidden: !hasPermission('dashboard-stock-availability-view'),
              },
              {
                //  Not found
                title: t('navbar:nav_count_stock'),
                url: `/v5/dashboard/count-stock`,
                isHidden: !hasPermission('dashboard-count-stock-view'),
              },
              {
                title: t('common:menu.inventory.item.stock.opname'),
                url: `/v5/dashboard/stock-taking`,
                isHidden: !hasPermission('dashboard-stock-taking-view'),
              },
            ],
          },
          {
            subTitle: t('navbar:navbar_filling'),
            subChild: [
              {
                //   Not found
                title: t('navbar:navbar_filling_from_out_of_stock'),
                url: `/v5/report/zero-stock/big-data`,
                isHidden: true,
              },
              {
                //   Not found
                title: t('navbar:navbar_filling_to_normal_bound'),
                url: `/v5/dashboard/filling-stock`,
                isHidden: !hasPermission('dashboard-filling-stock-view'),
              },
            ],
          },
        ],
      },
      {
        title: t('navbar:navbar_quality_monitoring'),
        chosenTitle: t('navbar:navbar_quality_monitoring_dashboard'),
        sub: [
          {
            subTitle: t('navbar:navbar_tool'),
            subChild: [
              {
                //  Not found
                title: t('navbar:nav_dashboard_asset_ownership'),
                url: `/v5/dashboard/asset-ownership`,
                isHidden: true,
              },
              {
                //   Not found
                title: t('navbar:nav_view_capacity_dashboard_annual'),
                url: `/v5/dashboard/cold-storage-capacity/annual`,
                isHidden: true,
              },
              {
                //    Not found
                title: t('navbar:navbar_dashboard_cold_storage_capacity'),
                url: `/v5/dashboard/cold-storage-capacity/v2`,
                isHidden: true,
              },
              {
                //    Not found
                title: t('navbar:nav_dashboard_logger_monitoring'),
                url: `/v5/dashboard/logger-monitoring`,
                isHidden: true,
              },
            ],
          },
          {
            subTitle: t('navbar:nav_discard_report'),
            subChild: [
              {
                //   Not found
                title: t('navbar:nav_discard_report'),
                url: `/v5/dashboard/discard`,
                isHidden: !hasPermission('dashboard-discard-view'),
              },
              {
                //   Not found
                title: t('navbar:navbar_damage'),
                url: `/v5/report/damage/big-data`, // Still has no URL, it's random
                isHidden: true,
              },
            ],
          },
          {
            subTitle: t('navbar:navbar_activeness'),
            subChild: [
              {
                title: t('navbar:navbar_activity_user'),
                url: `v5/report/user-activity`,
                isHidden: !hasPermission('user-activity-view'),
              },
              {
                //  Not found
                title: t('navbar:navbar_customer_activity'),
                url: `/v5/dashboard/consumed/big-data`,
                isHidden: true,
              },
            ],
          },
        ],
      },
    ],
    [t]
  )

  const leftSideMenus = useMemo(() => {
    return filterLeftMenus(rawMenus)
  }, [rawMenus])

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
        targetIndex >= 0 ? targetIndex : FIRST_SUBMENU_INDEX
      ] as TLeftMenu
    )
  }, [t])

  const title = t('common:menu.dashboard.title')

  if (leftSideMenus.length <= 0) return null
  return (
    <NavbarContext.Provider value={contextValue}>
      <HoverCardRoot defaultOpen={false} openDelay={100} closeDelay={100}>
        <NavbarList
          title={t('common:menu.dashboard.title')}
          active={
            isActiveMenu(router as NextRouter, leftSideMenus) ||
            router.asPath.includes(`/v5/dashboard/inventory-overview`)
          }
        />
        <NavbarSubmenuBox
          submenuTitle={title}
          submenuDescription={t('navbar:navbar_dashboard_description')}
          leftSideMenus={leftSideMenus}
        />
      </HoverCardRoot>
    </NavbarContext.Provider>
  )
}

export default NavbarDashboard

import React, { useEffect, useMemo, useState } from 'react'
import { NextRouter } from 'next/router'
import { useFeatureIsOn } from '@growthbook/growthbook-react'
import { HoverCardRoot } from '#components/hover-card'
import useSmileRouter from '#hooks/useSmileRouter'
import { hasPermission } from '#shared/permission/index'
import { useTranslation } from 'react-i18next'

import NavbarList from '../../components/NavbarList'
import NavbarSubmenuBox from '../../components/NavbarSubmenuBox'
import { filterLeftMenus, isActiveMenu } from '../../libs/navbar.commons'
import { FIRST_SUBMENU_INDEX } from '../../libs/navbar.constants'
import { NavbarContext } from '../../libs/navbar.context'
import { TLeftMenu } from '../../libs/navbar.types'

const NavbarAnalysis = () => {
  const { t } = useTranslation(['common', 'navbar'])
  const [menuClicked, setMenuClicked] = useState<TLeftMenu>(null)
  const router = useSmileRouter()
  const contextValue = useMemo(
    () => ({ setMenuClicked, menuClicked }),
    [setMenuClicked, menuClicked]
  )

  const isShowResponseTime = useFeatureIsOn('dashboard.response_time')
  const isShowReceptionDistribution = useFeatureIsOn(
    'dashboard.reception_distribution'
  )
  const isShowStockAvailability = useFeatureIsOn('dashboard.stock_availability')
  const isShowAbnormalStock = useFeatureIsOn('dashboard.abnormal_stock')
  const isShowDiscard = useFeatureIsOn('dashboard.discard')

  const rawMenus: TLeftMenu[] = useMemo(() => {
    return [
      {
        title: t('navbar:nav_order'),
        chosenTitle: t('navbar:navbar_order_management'),
        sub: [
          {
            subChild: [
              {
                // Not found
                title: t('navbar:nav_order_response'),
                url: `/v5/dashboard/order-response`,
                isHidden:
                  !hasPermission('dashboard-order-response-view') ||
                  !isShowResponseTime,
              },
              {
                title: t('navbar:nav_consumption_supply'),
                url: `/v5/dashboard/consumption-supply`,
                isHidden:
                  !hasPermission('dashboard-consumption-supply-view') ||
                  !isShowReceptionDistribution,
              },
            ],
          },
        ],
      },
      {
        title: t('common:menu.dashboard.item.transaction.title'),
        chosenTitle: t('navbar:navbar_transaction_management'),
        sub: [
          {
            subChild: [
              {
                title: t('navbar:nav_dashboard_monitoring_transaction'),
                url: `/v5/dashboard/transaction-monitoring`,
                isHidden: !hasPermission(
                  'dashboard-monitoring-transaction-view'
                ),
              },
              {
                title: t('navbar:nav_discard_report'),
                url: `/v5/dashboard/discard`,
                isHidden:
                  !hasPermission('dashboard-discard-view') || !isShowDiscard,
              },
            ],
          },
        ],
      },
      {
        title: t('navbar:navbar_inventory'),
        chosenTitle: t('navbar:navbar_inventory_management'),
        sub: [
          {
            subChild: [
              {
                title: t('navbar:navbar_inventory_stock_detail'),
                url: `/v5/stock`,
                isHidden: !hasPermission('stock-view'),
              },
              {
                title: t('common:menu.inventory.item.stock.opname'),
                url: `/v5/dashboard/stock-taking`,
                isHidden: !hasPermission('dashboard-stock-taking-view'),
              },
              {
                title: t('navbar:nav_reconciliation_activity'),
                url: `/v5/report/reconciliation`,
                isHidden: !hasPermission('reconciliation-activity-view'),
              },
              {
                title: t('navbar:nav_abnormal_stock'),
                url: `/v5/dashboard/abnormal-stock`,
                isHidden:
                  !hasPermission('dashboard-abnormal-stock-view') ||
                  !isShowAbnormalStock,
              },
              {
                title: t('navbar:nav_stock_availability'),
                url: `/v5/dashboard/stock-availability`,
                isHidden:
                  !hasPermission('dashboard-stock-availability-view') ||
                  !isShowStockAvailability,
              },
            ],
          },
        ],
      },
    ]
  }, [
    t,
    isShowResponseTime,
    isShowReceptionDistribution,
    isShowStockAvailability,
    isShowAbnormalStock,
    isShowDiscard,
  ])

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
        targetIndex !== -1 ? targetIndex : FIRST_SUBMENU_INDEX
      ] as TLeftMenu
    )
  }, [t])

  const title = t('common:menu.analysis.title')

  if (leftSideMenus.length <= 0) return null
  return (
    <NavbarContext.Provider value={contextValue}>
      <HoverCardRoot defaultOpen={false} openDelay={100} closeDelay={100}>
        <NavbarList
          title={title}
          active={isActiveMenu(router as NextRouter, leftSideMenus)}
          className="!ui-px-2"
        />
        <NavbarSubmenuBox
          submenuTitle={title}
          submenuDescription={t('navbar:navbar_analysis_description')}
          leftSideMenus={leftSideMenus}
        />
      </HoverCardRoot>
    </NavbarContext.Provider>
  )
}

export default NavbarAnalysis

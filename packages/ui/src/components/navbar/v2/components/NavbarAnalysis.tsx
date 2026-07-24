import React, { useEffect, useMemo, useState } from 'react'
import { NextRouter } from 'next/router'
import { useFeatureIsOn } from '@growthbook/growthbook-react'
import { HoverCardRoot } from '#components/hover-card'
import { ProgramEnum } from '#constants/program'
import useSmileRouter from '#hooks/useSmileRouter'
import { hasPermission } from '#shared/permission/index'
import { getProgramStorage } from '#utils/storage/program'
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
  const isShowOrderDifference = useFeatureIsOn('dashboard.order_difference')
  const isShowReceptionDistribution = useFeatureIsOn(
    'dashboard.reception_distribution'
  )
  const isShowStockAvailability = useFeatureIsOn('dashboard.stock_availability')
  const isShowAbnormalStock = useFeatureIsOn('dashboard.abnormal_stock')
  const isShowCountStock = useFeatureIsOn('dashboard.add_remove_stock')
  const isShowFillingStock = useFeatureIsOn('dashboard.filling_stock')
  const isShowDiscard = useFeatureIsOn('dashboard.discard')
  const isShowMonthlyReport = useFeatureIsOn('dashboard.report.monthly')
  const isShowYearlyReport = useFeatureIsOn('dashboard.report.yearly')
  const isShowInventoryOverview = useFeatureIsOn('dashboard.inventory_overview')
  const isShowRabies = useFeatureIsOn('dashboard.rabies')
  const isShowLPO = useFeatureIsOn('report_lplpo')
  const isShowMicroplanning = useFeatureIsOn('dashboard.microplanning')
  const isShowAnnualCommitmentVsRealization = useFeatureIsOn(
    'dashboard.annual_commitment_vs_realization'
  )

  const rawMenus: TLeftMenu[] = useMemo(() => {
    const program = getProgramStorage()
    const isEnabledAnnualPlanning = program?.config?.is_annual_planning
    const isRabiesWorkspace = program?.key === ProgramEnum.Rabies

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
                title: t('navbar:nav_order_difference'),
                url: `/v5/dashboard/order-difference`,
                isHidden:
                  !hasPermission('dashboard-order-difference-view') ||
                  !isShowOrderDifference,
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
              {
                title: 'Rabies',
                url: `/v5/dashboard/rabies`,
                isHidden:
                  !hasPermission('dashboard-rabies-view') ||
                  !isShowRabies ||
                  !isRabiesWorkspace,
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
                title: t('navbar:nav_dashboard_inventory_overview'),
                url: `/v5/dashboard/inventory-overview`,
                isHidden:
                  !hasPermission('dashboard-inventory-overview-view') ||
                  !isShowInventoryOverview,
              },
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
              {
                title: t('navbar:nav_count_stock'),
                url: `/v5/dashboard/count-stock`,
                isHidden:
                  !hasPermission('dashboard-count-stock-view') ||
                  !isShowCountStock,
              },
              {
                title: t('navbar:navbar_filling_to_normal_bound'),
                url: `/v5/dashboard/filling-stock`,
                isHidden:
                  !hasPermission('dashboard-filling-stock-view') ||
                  !isShowFillingStock,
              },
            ],
          },
        ],
      },
      {
        title: t('navbar:navbar_disposal'),
        chosenTitle: t('navbar:navbar_disposal_management'),
        sub: [
          {
            subChild: [
              {
                title: t('navbar:navbar_view_disposal_stock'),
                url: `/v5/stock-pemusnahan`,
                isHidden: !hasPermission('disposal-list-view'),
              },
            ],
          },
        ],
      },
      {
        title: t('navbar:navbar_activeness'),
        chosenTitle: t('navbar:navbar_activeness_management'),
        sub: [
          {
            subChild: [
              {
                title: t('navbar:navbar_activity_user'),
                url: `v5/report/user-activity`,
                isHidden: !hasPermission('user-activity-view'),
              },
            ],
          },
        ],
      },
      {
        title: t('navbar:navbar_report'),
        chosenTitle: t('navbar:navbar_report_management'),
        sub: [
          {
            subChild: [
              {
                title: t('navbar:nav_monthly_report'),
                url: '/v5/dashboard/monthly-report',
                isHidden:
                  !hasPermission('dashboard-monthly-report-view') ||
                  !isShowMonthlyReport ||
                  program?.key !== ProgramEnum.Immunization,
              },
              {
                title: t('navbar:nav_yearly_report'),
                url: '/v5/dashboard/yearly-report',
                isHidden:
                  !hasPermission('dashboard-yearly-report-view') ||
                  !isShowYearlyReport ||
                  program?.key !== ProgramEnum.Immunization,
              },
              {
                title: t('common:menu.report.item.stock_book'),
                url: `/v5/report/stock-book`,
                isHidden: !hasPermission('stock-book-view'),
              },
              {
                title: t('navbar:nav_dashboard_download_page'),
                url: `/v5/dashboard/download`,
                isHidden: !hasPermission('dashboard-download-view'),
              },
              {
                title: t('common:menu.analysis.lplpo'),
                url: `/v5/report/lplpo`,
                isHidden: !hasPermission('lplpo-view') || !isShowLPO,
              },
            ],
          },
        ],
      },
      {
        title: t('navbar:nav_planning'),
        chosenTitle: t('navbar:navbar_planning_management'),
        sub: [
          {
            subChild: [
              {
                title: t('navbar:nav_dashboard_microplanning'),
                url: `/v5/dashboard/microplanning`,
                isHidden:
                  program?.key !== ProgramEnum.Immunization ||
                  !isShowMicroplanning ||
                  !hasPermission('dashboard-microplanning-view'),
              },
              {
                title: t(
                  'navbar:nav_dashboard_annual_commitment_vs_realization'
                ),
                url: `/v5/dashboard/annual-commitment-vs-realization`,
                isHidden:
                  !isEnabledAnnualPlanning ||
                  !isShowAnnualCommitmentVsRealization ||
                  !hasPermission(
                    'dashboard-annual-commitment-vs-realization-view'
                  ),
              },
            ],
          },
        ],
      },
    ]
  }, [
    t,
    isShowResponseTime,
    isShowOrderDifference,
    isShowReceptionDistribution,
    isShowStockAvailability,
    isShowAbnormalStock,
    isShowCountStock,
    isShowFillingStock,
    isShowDiscard,
    isShowMonthlyReport,
    isShowYearlyReport,
    isShowInventoryOverview,
    isShowRabies,
    isShowLPO,
    isShowMicroplanning,
    isShowAnnualCommitmentVsRealization,
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

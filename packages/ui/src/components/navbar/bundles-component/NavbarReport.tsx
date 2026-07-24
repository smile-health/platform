import React, { useEffect, useMemo, useState } from 'react'
import { NextRouter } from 'next/router'
import { useFeatureIsOn } from '@growthbook/growthbook-react'
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

const NavbarReport = () => {
  const { t } = useTranslation(['common', 'navbar'])
  const [menuClicked, setMenuClicked] = useState<TLeftMenu>(null)
  const router = useSmileRouter()

  const isEnabledMonthlyReport = useFeatureIsOn('dashboard.report.monthly')
  const isEnabledYearlyReport = useFeatureIsOn('dashboard.report.yearly')

  const contextValue = useMemo(
    () => ({ setMenuClicked, menuClicked }),
    [setMenuClicked, menuClicked]
  )

  const rawMenus: TLeftMenu[] = useMemo(
    () => [
      {
        sub: [
          {
            subChild: [
              {
                title: t('navbar:nav_monthly_report'),
                url: '/v5/dashboard/monthly-report',
                isHidden:
                  !hasPermission('dashboard-monthly-report-view') ||
                  !isEnabledMonthlyReport,
              },
              {
                title: t('navbar:nav_yearly_report'),
                url: '/v5/dashboard/yearly-report',
                isHidden:
                  !hasPermission('dashboard-yearly-report-view') ||
                  !isEnabledYearlyReport,
              },
              {
                title: t('common:menu.report.item.stock_book'),
                url: '/v5/report/stock-book',
                isHidden: !hasPermission('stock-book-view'),
              },
              {
                title: t('navbar:navbar_stock_opname_report'),
                url: 'skipped',
                isHidden: true,
              },
              {
                separator: true,
                title: t('navbar:nav_dashboard_download_page'),
                url: '/v5/dashboard/download',
                isHidden: !hasPermission('dashboard-download-view'),
              },
              {
                title: 'LPLPO',
                url: '/v5/report/lplpo',
                isHidden: !hasPermission('lplpo-view'),
              },
            ],
          },
        ],
      },
    ],
    [t, isEnabledMonthlyReport, isEnabledYearlyReport]
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

  const title = t('navbar:nav_report')

  if (leftSideMenus.length <= 0) return null
  return (
    <NavbarContext.Provider value={contextValue}>
      <HoverCardRoot defaultOpen={false} openDelay={100} closeDelay={100}>
        <NavbarList
          title={title}
          active={
            isActiveMenu(router as NextRouter, leftSideMenus) ||
            router.asPath.includes('/dashboard/overview/big-data')
          }
        />
        <NavbarSubmenuBox
          submenuTitle={title}
          submenuDescription={t('navbar:navbar_report_description')}
          leftSideMenus={leftSideMenus}
        />
      </HoverCardRoot>
    </NavbarContext.Provider>
  )
}

export default NavbarReport

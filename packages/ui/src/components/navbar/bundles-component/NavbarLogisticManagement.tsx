import { useEffect, useMemo, useState } from 'react'
import { NextRouter } from 'next/router'
import { HoverCardRoot } from '@repo/ui/components/hover-card'
import useSmileRouter from '#hooks/useSmileRouter'
import { hasPermission } from '#shared/permission/index'
import { getProgramStorage } from '#utils/storage/program'
import { getUserStorage } from '#utils/storage/user'
import { useTranslation } from 'react-i18next'

import NavbarList from '../components/NavbarList'
import NavbarSubmenuBox from '../components/NavbarSubmenuBox'
import { filterLeftMenus, isActiveMenu } from '../libs/navbar.commons'
import { FIRST_SUBMENU_INDEX } from '../libs/navbar.constants'
import { NavbarContext } from '../libs/navbar.context'
import { TLeftMenu } from '../libs/navbar.types'

const NavbarLogisticManagement = () => {
  const { t } = useTranslation(['common', 'navbar'])
  const [menuClicked, setMenuClicked] = useState<TLeftMenu>(null)
  const router = useSmileRouter()
  const contextValue = useMemo(
    () => ({ setMenuClicked, menuClicked }),
    [setMenuClicked, menuClicked]
  )
  const user = getUserStorage()
  const program = getProgramStorage()

  const rawMenus: TLeftMenu[] = useMemo(
    () => [
      {
        title: t('common:menu.report.item.planning.title'),
        chosenTitle: t('navbar:navbar_planning_management'),
        sub: [
          {
            subChild: [
              {
                // Not found
                title: t('navbar:nav_annual_commitment'),
                url: `/v5/annual-commitment`,
                isHidden: true,
              },
            ],
          },
        ],
      },
      {
        title: t('navbar:nav_order'),
        chosenTitle: t('navbar:navbar_order_management'),
        sub: [
          {
            subChild: [
              {
                title: t('navbar:nav_order_list'),
                url: `/v5/order`,
                isHidden: false,
              },
              {
                title: t('common:menu.order.item.ticketing'),
                url: `/v5/ticketing-system`,
                isHidden: !hasPermission('ticketing-system-view'),
              },
            ],
          },
        ],
      },
      {
        title: t('common:menu.inventory.item.transaction'),
        chosenTitle: t('navbar:navbar_transaction_management'),
        sub: [
          {
            subChild: [
              {
                title: t('navbar:nav_transaction_list'),
                url: `/v5/transaction`,
                isHidden: !hasPermission('transaction-view'),
              },
              {
                title: t('common:menu.inventory.item.reconciliation'),
                url: `/v5/reconciliation`,
                isHidden: !hasPermission('reconciliation-view'),
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
                title: t('common:menu.dashboard.item.stock_taking'),
                url: `/v5/stock-opname`,
                isHidden: !hasPermission('stock-opname-view'),
              },
            ],
          },
        ],
      },
      {
        title: t('navbar:navbar_quality_monitoring'),
        chosenTitle: t('navbar:navbar_quality_monitoring_management'),
        sub: [
          {
            subTitle: t('common:menu.asset.title'),
            subChild: [
              {
                title: t('navbar:navbar_asset_inventory'),
                url: `/v5/asset-inventory`,
                isHidden: !hasPermission('asset-inventory-view'),
              },
              {
                title: t('navbar:nav_view_temperature'),
                url: `/v5/asset`,
                isHidden:
                  program?.config?.material?.is_hierarchy_enabled ||
                  !hasPermission('asset-temperature-view'),
              },
              {
                // Not found
                title: t('navbar:nav_view_asset_stock_opname'),
                url: `/v5/asset/stock-opname`,
                isHidden: true,
              },
            ],
          },
          {
            subTitle: t('common:menu.disposal.title'),
            subChild: [
              {
                title: t('navbar:navbar_view_disposal_stock'),
                url: `/v5/stock-pemusnahan`,
                isHidden: !hasPermission('disposal-list-view'),
              },
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

  const title = t('navbar:navbar_logsitic_management')

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
          submenuDescription={t(
            'navbar:navbar_logsitic_management_description'
          )}
          leftSideMenus={leftSideMenus}
        />
      </HoverCardRoot>
    </NavbarContext.Provider>
  )
}

export default NavbarLogisticManagement

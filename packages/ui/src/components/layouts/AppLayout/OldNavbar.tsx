import Link from 'next/link'
import { ChevronDownIcon } from '@heroicons/react/24/solid'
import {
  DropdownMenuContent,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from '#components/dropdown-menu'
import { Exists } from '#components/exists'
import {
  menuAssetChilds,
  menuConsumedChilds,
  menuDashboardChilds,
  menuDashboardCovidChilds,
  menuExterminationChilds,
  menuInventarisChilds,
  menuSettingChilds,
} from '#constants/menus'
import useSmileRouter from '#hooks/useSmileRouter'
import { hasPermission } from '#shared/permission/index'
import { useTranslation } from 'react-i18next'

import { ButtonGroup } from '../../button'
import DropdownNav from './DropdownNav'
import ReportNav from './ReportNav'
import RightMenuNav from './RightMenuNav'

const styleHover =
  'hover:ui-text-primary-300 ui-flex ui-flex-row ui-text-white ui-cursor-pointer ui-items-center ui-px-[2px]'
const styleHoverChild =
  'ui-text-left ui-block ui-text-primary-500 ui-cursor-pointer hover:ui-text-primary-700 hover:ui-bg-gray-100 ui-px-6 ui-py-1'

const Navbar: React.FC = () => {
  const router = useSmileRouter()
  const { t } = useTranslation()

  return (
    <div className="ui-bg-primary-500 ui-h-10">
      <ButtonGroup className="ui-gap-x-3 ui-container ui-mx-auto ui-px-6 ui-h-full">
        <DropdownMenuRoot>
          <DropdownMenuTrigger>
            <div
              className={styleHover}
              id="trigger-navbar-dashboard/overview/big-data"
            >
              <div className="ui-text-primary-contrast">
                {t('menu.dashboard.title')}
              </div>
              <div className="ui-py-1 ui-pl-2">
                <ChevronDownIcon className="ui-h-3 ui-w-3 ui-text-primary-contrast" />
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <div className="ui-flex ui-flex-col ui-gap-1">
              <Link
                className={styleHoverChild}
                id="navbar-dashboard/overview/big-data"
                href={router.getAsLink('/v5/dashboard/inventory-overview')}
              >
                {t('menu.dashboard.item.inventory_overview')}
              </Link>
              <Exists useIt={false}>
                <RightMenuNav
                  title={t('menu.dashboard.item.transaction.title')}
                  left={210}
                  rNavChild={menuDashboardCovidChilds(t)}
                />

                <RightMenuNav
                  title="Consumed"
                  left={210}
                  rNavChild={menuConsumedChilds(t)}
                />
              </Exists>

              {menuDashboardChilds(t).map((item) => (
                <Link
                  className={`${item.className} ${styleHoverChild} ui-text-primary-surface`}
                  id={`navbar-${item.link}`}
                  key={`navbar-${item.link}`}
                  href={router.getAsLink(item.link)}
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenuRoot>

        <DropdownNav
          title={t('menu.inventory.title')}
          navChild={menuInventarisChilds(t)}
          className={styleHover}
        />

        <DropdownNav
          title={t('menu.order.title')}
          className={styleHover}
          navChild={[
            {
              link: '/v5/order',
              title: t('menu.order.item.list'),
              className: 'ui-text-left',
            },
            {
              link: '/v5/ticketing-system',
              title: t('menu.order.item.ticketing'),
              className: 'ui-text-left',
            },
          ]}
        />

        <DropdownNav
          title={t('menu.disposal.title')}
          className={styleHover}
          navChild={menuExterminationChilds(t)}
        />

        <ReportNav className={styleHover} />

        <DropdownNav
          title={t('menu.asset.title')}
          className={styleHover}
          navChild={menuAssetChilds(t)}
        />

        <DropdownNav
          title={t('menu.setting.title')}
          className={styleHover}
          navChild={menuSettingChilds(t)}
          show={hasPermission('settings-menu')}
        />
      </ButtonGroup>
    </div>
  )
}

export default Navbar

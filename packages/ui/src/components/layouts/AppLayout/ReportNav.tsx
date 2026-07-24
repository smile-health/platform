import React, { ReactNode } from 'react'
import Link from 'next/link'
import {
  DropdownMenuContent,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from '#components/dropdown-menu'
import { Exists } from '#components/exists'
import { menuReportChilds } from '#constants/menus'
import useSmileRouter from '#hooks/useSmileRouter'
import { useTranslation } from 'react-i18next'
import { ChevronDownIcon } from '@heroicons/react/24/solid'

type Props = {
  title: string
  children: ReactNode
}

const Group = ({ children, title }: Props) => (
  <div className="ui-p-6" id={`navbar-group-${title}`}>
    <div className="ui-text-dark ui-font-bold mb-2">{title}</div>
    <div>{children}</div>
  </div>
)

const Item = ({ children, link }: { children: ReactNode; link: string }) => {
  const router = useSmileRouter()

  return (
    <Link
      id={`navbar-${link}`}
      className="ui-text-left ui-block ui-cursor-pointer ui-py-1 ui-text-black hover:ui-text-primary-surface"
      href={router.getAsLink(link)}
    >
      {children}
    </Link>
  )
}

const ItemLink = ({
  children,
  link,
}: {
  children: ReactNode
  link: string
}) => {
  const router = useSmileRouter()

  if (!link) {
    return (
      <button className="ui-text-left ui-block ui-cursor-pointer ui-py-1 ui-active:ui-outline-none ui-focus:ui-outline-none">
        {children}
      </button>
    )
  }

  return (
    <Link
      id={`navbar-${link}`}
      className="ui-text-left ui-block ui-cursor-pointer ui-py-1 ui-active:ui-outline-none ui-focus:ui-outline-none hover:ui-text-primary-surface"
      href={router.getAsLink(link)}
    >
      {children}
    </Link>
  )
}

const ReportNav: React.FC<{ className?: string }> = ({ className }) => {
  const { t } = useTranslation()
  const menu = menuReportChilds(t)
  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger>
        <div className={className} id="trigger-Laporan">
          <div className="ui-text-primary-contrast">{t('menu.report.title')}</div>
          <div className="ui-py-1 ui-pl-2">
            <ChevronDownIcon className="ui-h-3 ui-w-3 ui-text-primary-contrast" />
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <div className="ui-flex ui-flex-col ui-gap-1 ui-w-screen ui-shadow-sm">
          <div className="ui-relative ui-bg-white ui-flex ui-z-50 ui-pt-2 ui-pb-4 ui-px-6 ui-flex-wrap">
            <Group title={menu.activity.title}>
              {menu.activity.menus.map((x) =>
                x.variant === 'item' ? (
                  <Exists useIt={x?.show} key={`navbar-${x.link}`}>
                    <Item link={x.link}>{x.title}</Item>
                  </Exists>
                ) : (
                  <Exists useIt={x?.show} key={`navbar-${x.link}`}>
                    <ItemLink link={x.link}>{x.title}</ItemLink>
                  </Exists>
                )
              )}
            </Group>

            <Exists useIt={false}>
              <Group title={menu.inventory.title}>
                {menu.inventory.menus.map((x) => (
                  <ItemLink key={`navbar-${x.link}`} link={x.link}>
                    {x.title}
                  </ItemLink>
                ))}
              </Group>

              <Group title={menu.order.title}>
                {menu.order.menus.map((x) => (
                  <ItemLink key={`navbar-${x.link}`} link={x.link}>
                    {x.title}
                  </ItemLink>
                ))}
              </Group>

              <Group title={menu.asset.title}>
                {menu.asset.menus.map((x) => (
                  <ItemLink key={`navbar-${x.link}`} link={x.link}>
                    {x.title}
                  </ItemLink>
                ))}
              </Group>
            </Exists>

            <Group title={menu.report.title}>
              {menu.report.menus.map((x) => (
                <Exists useIt={x?.show} key={`navbar-${x.link}`}>
                  <ItemLink link={x.link}>{x.title}</ItemLink>
                </Exists>
              ))}
            </Group>

            <Exists useIt={false}>
              <Group title={menu.planning.title}>
                {menu.planning.menus.map((x) => (
                  <ItemLink key={`navbar-${x.link}`} link={x.link}>
                    {x.title}
                  </ItemLink>
                ))}
              </Group>
            </Exists>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenuRoot>
  )
}

export default ReportNav

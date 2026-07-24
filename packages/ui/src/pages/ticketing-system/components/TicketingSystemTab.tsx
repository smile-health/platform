'use client'

import { usePathname } from 'next/navigation'
import {
  TabsLinkList,
  TabsLinkRoot,
  TabsLinkTrigger,
} from '#components/tabs-link'
import useSmileRouter from '#hooks/useSmileRouter'
import { hasPermission } from '#shared/permission/index'
import { useTranslation } from 'react-i18next'

const ACTIVE_TAB_LIST = 'ticketing-system'
const ACTIVE_TAB_CREATE = 'create'

export default function TicketingSystemTab(): JSX.Element {
  const { t } = useTranslation('ticketingSystem')

  const pathname = usePathname()
  const active = pathname.split('/').pop()
  const { getAsLink } = useSmileRouter()
  const tabItems = [
    {
      label: t('tab.list'),
      href: getAsLink(`/v5/ticketing-system`),
      active: active === ACTIVE_TAB_LIST,
      hasPermission: hasPermission('ticketing-system-view'),
    },
    {
      label: t('tab.create'),
      href: getAsLink(`/v5/ticketing-system/create`),
      active: active === ACTIVE_TAB_CREATE,
      hasPermission: hasPermission('ticketing-system-create'),
    },
  ]

  return (
    <TabsLinkRoot variant="default">
      <TabsLinkList>
        {tabItems.map((item) =>
          item?.hasPermission ? (
            <TabsLinkTrigger
              key={item.label}
              href={item.href}
              active={item.active}
            >
              {item.label}
            </TabsLinkTrigger>
          ) : null
        )}
      </TabsLinkList>
    </TabsLinkRoot>
  )
}

import React from 'react'
import { usePathname } from 'next/navigation'
import {
  TabsLinkList,
  TabsLinkRoot,
  TabsLinkTrigger,
} from '#components/tabs-link'
import useSmileRouter from '#hooks/useSmileRouter'
import { useTranslation } from 'react-i18next'

import { ACTIVE_TAB_CREATE, ACTIVE_TAB_LIST } from '../self-disposal.constant'

const SelfDisposalTab = () => {
  const { t } = useTranslation('selfDisposal')

  const pathname = usePathname()
  const active = pathname.split('/').pop()
  const { getAsLink } = useSmileRouter()
  const tabItems = [
    {
      label: t('tab.list'),
      href: getAsLink(`/v5/self-disposal`),
      active: active === ACTIVE_TAB_LIST,
      hasPermission: true,
    },
    {
      label: t('tab.create'),
      href: getAsLink(`/v5/self-disposal/create`),
      active: active === ACTIVE_TAB_CREATE,
      hasPermission: true,
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

export default SelfDisposalTab

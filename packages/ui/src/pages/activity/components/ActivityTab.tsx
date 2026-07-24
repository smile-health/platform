'use client'

import {
  TabsLinkList,
  TabsLinkRoot,
  TabsLinkTrigger,
} from '#components/tabs-link'
import { isViewOnly } from '#utils/user'
import { useTranslation } from 'react-i18next'

type ActivityTabProps = {
  readonly type?: 'list' | 'create'
}

export default function ActivityTab({
  type = 'list',
}: ActivityTabProps): JSX.Element {
  const { t, i18n } = useTranslation('activity')
  const locale = i18n.language
  const onlyView = isViewOnly()

  const TABS_ITEM = [
    {
      label: t('title.list'),
      href: `/${locale}/v5/activity`,
      active: type === 'list',
    },
    ...(!onlyView
      ? [
          {
            label: t('title.create'),
            href: `/${locale}/v5/activity/create`,
            active: type === 'create',
          },
        ]
      : []),
  ]

  return (
    <TabsLinkRoot variant="default">
      <TabsLinkList>
        {TABS_ITEM.map((item) => {
          return (
            <TabsLinkTrigger key={item.label} {...item}>
              {item.label}
            </TabsLinkTrigger>
          )
        })}
      </TabsLinkList>
    </TabsLinkRoot>
  )
}

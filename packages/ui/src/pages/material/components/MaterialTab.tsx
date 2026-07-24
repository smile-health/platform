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

export default function MaterialTab({
  type = 'list',
}: ActivityTabProps): JSX.Element {
  const { t, i18n } = useTranslation('material')
  const locale = i18n.language
  const onlyView = isViewOnly()

  const TABS_ITEM = [
    {
      label: t('title.list'),
      href: `/${locale}/v5/material`,
      active: type === 'list',
    },
    ...(!onlyView
      ? [
          {
            label: t('title.create'),
            href: `/${locale}/v5/material/create`,
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

import { isViewOnly } from '#utils/user'
import { TFunction } from 'i18next'

export const tabsMaterial = ({
  t,
  locale,
}: {
  locale: string
  t: TFunction<['material', 'common']>
}) => [
  {
    label: t('list.tab.list'),
    url: `/${locale}/v5/material`,
  },
  ...(!isViewOnly()
    ? [
        {
          label: t('list.tab.create'),
          url: `/${locale}/v5/material/create`,
        },
      ]
    : []),
]

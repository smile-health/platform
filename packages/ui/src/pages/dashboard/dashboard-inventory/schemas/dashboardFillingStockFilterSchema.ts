import { TFunction } from 'i18next'

import { defaultEntityTags, EntityTag } from '../../dashboard.constant'
import dashboardInventoryFilterSchema from './dashboardInventoryFilterSchema'

export default function dashboardFillingStockFilterSchema(
  t: TFunction<'dashboardInventory'>,
  tDashboard: TFunction<'dashboard'>,
  lang = 'en'
) {
  const defaultEntityTag = defaultEntityTags(tDashboard).filter(
    (tag) => tag.value === EntityTag.Puskesmas
  )

  const periods = [
    {
      label: t('data.montly'),
      value: 'month',
    },
  ]

  return dashboardInventoryFilterSchema(
    t,
    tDashboard,
    lang,
    periods,
    defaultEntityTag
  )
}

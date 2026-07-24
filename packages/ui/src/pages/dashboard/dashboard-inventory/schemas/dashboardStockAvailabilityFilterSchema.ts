import { UseFilter } from '#components/filter'
import { growthbook } from '#lib/growthbook'
import { TFunction } from 'i18next'

import { defaultEntityTags, EntityTag } from '../../dashboard.constant'
import dashboardInventoryFilterSchema from './dashboardInventoryFilterSchema'

export default function dashboardStockAvailabilityFilterSchema(
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

  const enabledActivity = growthbook.getFeatureValue(
    'dashboard.stock_availability.activity_filter',
    false
  )

  const initialSchema = dashboardInventoryFilterSchema(
    t,
    tDashboard,
    lang,
    periods,
    defaultEntityTag,
    enabledActivity
  )

  const additionalSchema = [
    {
      id: 'select-information-type',
      type: 'select',
      name: 'information_type',
      label: t('form.information_type.label'),
      placeholder: t('form.information_type.placeholder'),
      isClearable: false,
      isUsingReactQuery: false,
      options: [
        { value: 1, label: t('data.percent.availability') },
        { value: 3, label: t('data.percent.entity') },
        { value: 4, label: t('data.percent.material') },
      ],
      defaultValue: {
        value: 1,
        label: t('data.percent.availability'),
      },
    },
  ] satisfies UseFilter

  return [...initialSchema, ...additionalSchema]
}

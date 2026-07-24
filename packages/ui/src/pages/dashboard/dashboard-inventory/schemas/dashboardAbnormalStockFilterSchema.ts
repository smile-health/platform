import { UseFilter } from '#components/filter'
import { growthbook } from '#lib/growthbook'
import { TFunction } from 'i18next'

import { defaultEntityTags, EntityTag } from '../../dashboard.constant'
import dashboardInventoryFilterSchema from './dashboardInventoryFilterSchema'

export default function dashboardAbnormalStockFilterSchema(
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
    'dashboard.abnormal_stock.activity_filter',
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
      id: 'select-transaction-type',
      type: 'select',
      name: 'transaction_type',
      label: t('form.transaction_type.label'),
      placeholder: t('form.transaction_type.placeholder'),
      isUsingReactQuery: false,
      isClearable: false,
      options: [
        { value: 'min', label: '< Min' },
        { value: 'max', label: '> Max' },
        { value: 'zero', label: t('data.stock.empty') },
      ],
      defaultValue: {
        label: '> Max',
        value: 'max',
      },
    },
    {
      id: 'select-information-type',
      type: 'select',
      name: 'information_type',
      label: t('form.information_type.label'),
      placeholder: t('form.information_type.placeholder'),
      isClearable: false,
      isUsingReactQuery: false,
      options: [
        { value: 'count', label: t('data.frequency') },
        { value: 'days', label: t('data.duration') },
      ],
      defaultValue: {
        value: 'count',
        label: t('data.frequency'),
      },
    },
  ] satisfies UseFilter

  return [...initialSchema, ...additionalSchema]
}

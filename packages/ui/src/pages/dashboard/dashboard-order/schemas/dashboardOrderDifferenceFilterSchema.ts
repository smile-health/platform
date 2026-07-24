import { UseFilter } from '#components/filter'
import { TFunction } from 'i18next'

import dashboardOrderResponseTimeFilterSchema from './dashboardOrderResponseTimeFilterSchema'

export default function dashboardOrderDifferenceFilterSchema(
  t: TFunction<'dashboardOrder'>,
  tDashboard: TFunction<'dashboard'>,
  lang = 'en'
) {
  const initialSchema = dashboardOrderResponseTimeFilterSchema(
    t,
    tDashboard,
    lang
  )

  const additionalSchema = [
    {
      id: 'select-information-type',
      type: 'select',
      name: 'information_type',
      label: t('form.information_type.label'),
      placeholder: t('form.information_type.placeholder'),
      isUsingReactQuery: false,
      options: [
        {
          label: t('data.information_type.new_order'),
          value: 1,
        },
        {
          label: t('data.information_type.shipping'),
          value: 2,
        },
        {
          label: t('data.information_type.receptions'),
          value: 3,
        },
      ],
      defaultValue: null,
    },
    {
      id: 'select-reason',
      type: 'select',
      name: 'reason',
      label: t('form.reason.label'),
      placeholder: t('form.reason.placeholder'),
      isUsingReactQuery: false,
      options: [
        {
          label: t('data.reason.stock.low'),
          value: 1,
        },
        {
          label: t('data.reason.population_growth'),
          value: 2,
        },
        {
          label: t('data.reason.plague'),
          value: 3,
        },
        {
          label: t('data.reason.stock.sufficient'),
          value: 4,
        },
        {
          label: t('data.reason.others'),
          value: 9,
        },
      ],
      defaultValue: null,
    },
  ] satisfies UseFilter

  return [...initialSchema, ...additionalSchema]
}

import { UseFilter } from '#components/filter'
import { TFunction } from 'i18next'

import dashboardOrderResponseTimeFilterSchema from './dashboardOrderResponseTimeFilterSchema'

export default function dashboardConsumptionSupplyFilterSchema(
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
          label: t('data.information_type.supply'),
          value: 'supply',
        },
        {
          label: t('data.information_type.issue'),
          value: 'consumption',
        },
      ],
      defaultValue: null,
    },
  ] satisfies UseFilter

  return [...initialSchema, ...additionalSchema]
}

import { UseFilter } from '#components/filter'
import { TFunction } from 'i18next'

type Params = {
  t: TFunction<['common', 'periodOfStockTaking']>
}

export const periodOfStockTakingFilterSchema = ({ t }: Params): UseFilter => {
  return [
    {
      id: 'period_of_stock_taking__list__date_range',
      type: 'date-range-picker',
      name: 'date_range',
      label: t('common:form.date_range.label'),
      className: '',
      defaultValue: null,
    },
  ]
}

export default {}

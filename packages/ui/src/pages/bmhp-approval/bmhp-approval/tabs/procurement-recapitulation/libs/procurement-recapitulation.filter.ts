import { UseFilter } from '#components/filter'
import dayjs from 'dayjs'
import { TFunction } from 'i18next'

type TFilterSchema = {
  t: TFunction<['bmhpApproval']>
}

export const procurementRecapitulationFilterSchema = ({
  t,
}: TFilterSchema): UseFilter => [
  {
    id: 'procurement_recap_stock_date_filter',
    type: 'date-picker',
    name: 'remaining_stock_date',
    label: t('bmhpApproval:procurement_recapitulation.filter.stock_date_label'),
    required: true,
    className: 'ui-flex-1 ui-w-full',
    defaultValue: dayjs().toISOString(),
  },
]

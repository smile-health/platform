import { UseFilter } from '#components/filter'
import { TFunction } from 'i18next'

export const createFilterSchema = (t: TFunction<['common', 'entityMaterialBulk']>): UseFilter => [
  {
    id: 'date-range-picker',
    type: 'date-range-picker',
    name: 'date_range',
    withPreset: true,
    multicalendar: true,
    label: t('entityMaterialBulk:list.filter.label.date'),
    className: '',
    defaultValue: null,
  },
]
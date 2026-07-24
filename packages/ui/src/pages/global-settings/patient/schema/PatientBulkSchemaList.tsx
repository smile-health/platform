import { UseFilter } from '#components/filter'
import { TFunction } from 'i18next'

export const createFilterSchema = (
  t: TFunction<['common', 'patient']>
): UseFilter => [
  {
    id: 'date-range-picker',
    type: 'date-range-picker',
    name: 'date_range',
    withPreset: true,
    multicalendar: true,
    label: t('patient:list.filter.label.date'),
    className: '',
    defaultValue: null,
  },
]

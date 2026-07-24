import { UseFilter } from '#components/filter'
import { TFunction } from 'i18next'

export const masterMethodListFilterSchema = (
  t: TFunction
): UseFilter => [
  {
    type: 'text',
    name: 'name',
    label: t('master-method:list.filter.name'),
    placeholder: t('master-method:list.filter.name_placeholder'),
    defaultValue: '',
  },
]

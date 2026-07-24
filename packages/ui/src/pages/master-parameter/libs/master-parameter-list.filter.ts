import { UseFilter } from '#components/filter'
import { TFunction } from 'i18next'

export const masterParameterListFilterSchema = (t: TFunction): UseFilter => [
  {
    type: 'text',
    name: 'name',
    label: t('master-parameter:list.filter.name'),
    placeholder: t('master-parameter:list.filter.name_placeholder'),
    defaultValue: '',
  },
]

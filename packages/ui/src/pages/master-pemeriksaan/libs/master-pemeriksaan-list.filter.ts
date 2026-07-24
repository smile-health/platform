import { UseFilter } from '#components/filter'
import { TFunction } from 'i18next'

export const masterPemeriksaanListFilterSchema = (t: TFunction): UseFilter => [
  {
    type: 'text',
    name: 'name',
    label: t('master-pemeriksaan:list.filter.name'),
    placeholder: t('master-pemeriksaan:list.filter.name_placeholder'),
    defaultValue: '',
  },
]

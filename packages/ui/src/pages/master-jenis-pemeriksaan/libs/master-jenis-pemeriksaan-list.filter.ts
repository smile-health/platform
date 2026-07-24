import { UseFilter } from '#components/filter'
import { TFunction } from 'i18next'

export const masterJenisPemeriksaanListFilterSchema = (
  t: TFunction
): UseFilter => [
  {
    type: 'text',
    name: 'name',
    label: t('master-jenis-pemeriksaan:list.filter.name'),
    placeholder: t('master-jenis-pemeriksaan:list.filter.name_placeholder'),
    defaultValue: '',
  },
]

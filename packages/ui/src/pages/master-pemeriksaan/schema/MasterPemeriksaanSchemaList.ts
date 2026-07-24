import { FilterFormField } from '#components/filter/FilterFormBody'
import { DUMMY_JENIS_PEMERIKSAAN, DUMMY_METODE } from '../utils/dummyData'

export const masterPemeriksaanFilterSchema = (t: any): FilterFormField[] => [
  {
    name: 'nama_material',
    type: 'text',
    placeholder: t('master-pemeriksaan:list.filter.nama_material'),
    label: t('master-pemeriksaan:list.filter.nama_material'),
    defaultValue: '',
  },
  {
    name: 'jenis_pemeriksaan_id',
    type: 'select',
    isMulti: true,
    options: DUMMY_JENIS_PEMERIKSAAN,
    placeholder: t('master-pemeriksaan:list.filter.jenis_pemeriksaan'),
    label: t('master-pemeriksaan:list.filter.jenis_pemeriksaan'),
    defaultValue: null,
  },
  {
    name: 'metode_id',
    type: 'select',
    isMulti: true,
    options: DUMMY_METODE,
    placeholder: t('master-pemeriksaan:list.filter.metode'),
    label: t('master-pemeriksaan:list.filter.metode'),
    defaultValue: null,
  },
]

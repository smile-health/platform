import { UseFilter } from '#components/filter'
import { loadRegencies } from '#services/location'

import { listBmhpPemeriksaan } from '../../../../../bmhp/bmhp-pemeriksaan/list/master.service'

type TFilterSchema = {
  provinceId?: string
}

export const provinceCompletenessFilterSchema = ({
  provinceId,
}: TFilterSchema): UseFilter => [
  {
    id: 'province_completeness_examination_filter',
    type: 'select-async-paginate',
    name: 'examination',
    label: 'Jenis Pemeriksaan',
    placeholder: 'Pilih Jenis Pemeriksaan',
    className: 'ui-mb-4',
    defaultValue: null,
    loadOptions: async (
      search: string,
      _: unknown,
      additional: { page: number }
    ) => {
      const result = await listBmhpPemeriksaan({
        page: additional?.page || 1,
        paginate: 50,
        keyword: search || undefined,
        is_active: 1,
      })
      return {
        options:
          result?.data?.map((item) => ({
            value: item.id,
            label: item.name,
          })) ?? [],
        hasMore: (result?.data?.length ?? 0) >= 50,
        additional: { page: (additional?.page || 1) + 1 },
      }
    },
    additional: { page: 1 },
  },
  {
    id: 'province_completeness_city_filter',
    type: 'select-async-paginate',
    name: 'city',
    label: 'Kota/Kabupaten',
    placeholder: 'Pilih Kota/Kabupaten',
    className: 'ui-mb-4',
    defaultValue: null,
    loadOptions: async (
      search: string,
      _: unknown,
      additional: { page: number }
    ) => {
      return loadRegencies(search, _, {
        province_ids: provinceId,
        ...additional,
      })
    },
    additional: { page: 1 },
  },
  {
    id: 'province_completeness_show_not_submitted',
    type: 'switch',
    name: 'show_not_submitted',
    label: 'Tampilkan Hanya Belum Submit',
    className: 'ui-mb-4',
    callBack: ({ setValue, value }) => {
      setValue('show_not_submitted', value === 1 ? 0 : 1)
    },
  },
]

import { UseFilter, useFilter } from '#components/filter'
import { loadProvinces } from '#services/location'
import { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

export function masterTableFilter(t: TFunction<['common']>) {
  return [
    {
      id: 'province-filter',
      type: 'select-async-paginate',
      name: 'province_id',
      label: t('common:label.province', 'Provinsi'),
      placeholder: t('common:placeholder.select_province', 'Pilih Provinsi'),
      loadOptions: loadProvinces,
      additional: { page: 1 },
      defaultValue: null,
    },
  ] satisfies UseFilter
}

export const useTableFilter = () => {
  const { t } = useTranslation(['common'])
  const filter = useFilter(masterTableFilter(t))

  return { filter }
}

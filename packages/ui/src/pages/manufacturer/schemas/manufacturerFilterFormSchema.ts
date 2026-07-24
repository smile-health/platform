import { UseFilter } from '#components/filter'
import { noProgram } from '#constants/program'
import { listPrograms } from '#services/program'
import { TFunction } from 'i18next'

import { getManufacturerOptions } from '../manufacturer.helper'

export default function manufacturerFilterFormSchema(
  t: TFunction<['common', 'manufacturer']>,
  isGlobal = false
) {
  return [
    {
      id: 'input-search',
      type: 'text',
      name: 'keyword',
      label: t('common:search'),
      placeholder: t('manufacturer:form.search.placeholder'),
      defaultValue: '',
      maxLength: 255,
    },
    {
      id: 'select-type',
      type: 'select',
      name: 'type',
      isMulti: false,
      label: t('common:type'),
      placeholder: t('common:select_type'),
      loadOptions: getManufacturerOptions,
      defaultValue: null,
    },
    {
      type: 'select',
      name: 'program_ids',
      id: 'select-program',
      isMulti: true,
      hidden: !isGlobal,
      label: t('form.program.title'),
      placeholder: t('form.program.placeholder.select'),
      defaultValue: null,
      loadOptions: async () => {
        const response = await listPrograms({
          page: 1,
          paginate: 100,
        })

        const result =
          response?.data?.map((item) => ({
            value: item?.id,
            label: item?.name,
          })) || []

        return [noProgram(t), ...result]
      },
    },
  ] satisfies UseFilter
}

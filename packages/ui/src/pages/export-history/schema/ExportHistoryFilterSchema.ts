import { UseFilter } from '#components/filter'
import { listPrograms } from '#services/program'
import { TFunction } from 'i18next'

export default function ExportHistoryFilterSchema(
  t: TFunction<'exportHistory'>
) {
  const paramsFilter = { page: 1, paginate: 50 }
  return [
    {
      type: 'text',
      name: 'keyword',
      label: t('filter.search.label'),
      placeholder: t('filter.search.placeholder'),
      maxLength: 255,
      id: 'input-export-history-search',
      defaultValue: '',
    },
    {
      id: 'export-histy-request-date',
      type: 'date-range-picker',
      name: 'request_date',
      label: t('filter.request_date.label'),
      className: '',
      defaultValue: null,
    },
    {
      id: 'export-history-program_id',
      type: 'select',
      name: 'program_id',
      isMulti: false,
      label: t('filter.program.label'),
      placeholder: t('filter.program.placeholder'),
      loadOptions: async () => {
        const result = await listPrograms(paramsFilter)
        const reformatResult =
          result?.data?.map((x) => ({ value: x.id, label: x.name })) || []
        const defaultList = [
          {
            value: 0,
            label: t('filter.program.without_program'),
          },
        ]

        return [...defaultList, ...reformatResult]
      },
      defaultValue: null,
    },
  ] satisfies UseFilter
}

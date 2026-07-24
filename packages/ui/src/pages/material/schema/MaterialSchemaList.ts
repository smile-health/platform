import { FilterFormSchema, UseFilter } from '#components/filter'
import { loadActivityOptions } from '#services/activity'
import { getMaterialTypes } from '#services/material'
import { listPrograms } from '#services/program'
import { TFunction } from 'i18next'
import * as yup from 'yup'

export const filterSchema = yup.object({
  keyword: yup.string().notRequired(),
  activity_id: yup
    .object({
      value: yup.number(),
      label: yup.string(),
    })
    .notRequired(),
  program_ids: yup.string().notRequired(),
  material_level_ids: yup.string().notRequired(),
  material_level_id: yup.string().notRequired(),
  material_type_id: yup.string().notRequired(),
  material_type_ids: yup.string().notRequired(),
})

type Params = {
  t: TFunction<['common', 'material']>
  isGlobal?: boolean
  isProgramKFAEnabled?: boolean
}
const paramsFilter = { page: 1, paginate: 100 }
export const createFilterSchema = ({
  t,
  isGlobal,
  isProgramKFAEnabled,
}: Params): UseFilter => [
  {
    type: 'text',
    name: 'keyword',
    id: 'input-search',
    label: t('material:list.filter.search.label'),
    placeholder: t('material:list.filter.search.placeholder'),
    className: '',
    defaultValue: '',
    maxLength: 255,
  },
  {
    type: 'select',
    name: 'material_type_ids',
    id: 'select-material-type',
    label: t('material:list.filter.material_type.label'),
    placeholder: t('material:list.filter.material_type.placeholder'),
    className: '',
    defaultValue: null,
    loadOptions: async () => {
      let result = await getMaterialTypes(paramsFilter)
      return result.data.map((x) => ({ value: x.id, label: x.name })) || []
    },
  },
  ...(isGlobal
    ? [
        {
          type: 'select',
          name: 'program_ids',
          id: 'select-program',
          isMulti: true,
          label: t('material:list.filter.program.label'),
          placeholder: t('material:list.filter.program.placeholder'),
          className: '',
          defaultValue: null,
          loadOptions: async () => {
            const result = await listPrograms(paramsFilter)
            const reformatResult =
              result?.data?.map((x) => ({
                value: x.id,
                label: x.name,
                is_hierarchy: x.config.material.is_hierarchy_enabled,
              })) || []
            const defaultList = [
              {
                value: 0,
                label: t('material:list.filter.without_program'),
                is_hierarchy: 0,
              },
            ]

            return [...defaultList, ...reformatResult]
          },
        } as FilterFormSchema,
      ]
    : [
        {
          type: 'select-async-paginate',
          name: 'activity_id',
          id: 'select-activity',
          isMulti: true,
          label: t('material:list.filter.activity.label'),
          placeholder: t('material:list.filter.activity.placeholder'),
          loadOptions: loadActivityOptions,
          clearOnChangeFields: [],
          additional: { page: 1 },
          defaultValue: null,
        } as FilterFormSchema,
      ]),
  ...(!isGlobal
    ? [
        ...(isProgramKFAEnabled
          ? [
              {
                type: 'radio',
                name: 'material_level_id',
                id: 'radio-material-level',
                label: t('material:list.filter.material_level.label'),
                disabled: false,
                options: [
                  {
                    label: t(
                      'material:list.filter.material_level.radio.active_substance'
                    ),
                    value: '2',
                    id: 'radio-material-active-substance',
                  },
                  {
                    label: t(
                      'material:list.filter.material_level.radio.trademark'
                    ),
                    value: '3',
                    id: 'radio-material-trademark',
                  },
                ],
                defaultValue: '3',
              } as FilterFormSchema,
            ]
          : []),
      ]
    : [
        {
          type: 'select',
          name: 'material_level_ids',
          id: 'select-material-level',
          isMulti: true,
          label: t('material:list.filter.material_level.label'),
          placeholder: t('material:list.filter.material_level.placeholder'),
          className: '',
          defaultValue: null,
          options: [
            {
              value: 2,
              label: t(
                'material:list.filter.material_level.radio.active_substance'
              ),
            },
            {
              value: 3,
              label: t('material:list.filter.material_level.radio.trademark'),
            },
          ],
        } as FilterFormSchema,
      ]),
]

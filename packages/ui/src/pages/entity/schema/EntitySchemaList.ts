import { FilterFormSchema, UseFilter } from '#components/filter'
import {
  getEntityType,
  getGlobalEntityType,
  loadEntityTags,
} from '#services/entity'
import {
  loadProvinces,
  loadRegencies,
  loadSubdistricts,
  loadVillages,
} from '#services/location'
import { listPrograms } from '#services/program'
import { hasPermission } from '#shared/permission/index'
import { TFunction } from 'i18next'

type Params = {
  t: TFunction<['common', 'entity']>
  isGlobal?: boolean
}
const paramsFilter = { page: 1, paginate: 100 }
export const createFilterSchema = ({ t, isGlobal }: Params): UseFilter => [
  {
    id: 'input-search',
    type: 'text',
    name: 'keyword',
    label: t('entity:list.filter.search.label'),
    placeholder: t('entity:list.filter.search.placeholder'),
    className: '',
    defaultValue: '',
  },
  {
    id: 'select-type',
    type: 'select',
    name: 'type_ids',
    isMulti: true,
    label: t('entity:list.filter.type.label'),
    placeholder: t('entity:list.filter.type.placeholder'),
    className: '',
    defaultValue: null,
    loadOptions: async () => {
      let result = isGlobal
        ? await getGlobalEntityType(paramsFilter)
        : await getEntityType(paramsFilter)

      return result.data.map((x) => ({ value: x.id, label: x.name })) || []
    },
  },
  {
    id: 'select-tag',
    type: 'select-async-paginate',
    name: 'entity_tag_ids',
    isMulti: true,
    label: 'Tag',
    placeholder: t('entity:list.filter.tag.placeholder'),
    className: '',
    defaultValue: null,
    loadOptions: loadEntityTags,
    additional: { page: 1, isGlobal },
  },
  ...(isGlobal && hasPermission('program-global-view')
    ? [
        {
          id: 'select-program',
          type: 'select',
          name: 'program_ids',
          isMulti: true,
          label: 'Program',
          placeholder: t('entity:list.filter.program.placeholder'),
          className: '',
          defaultValue: null,
          loadOptions: async () => {
            const result = await listPrograms(paramsFilter)
            const reformatResult =
              result?.data?.map((x) => ({ value: x.id, label: x.name })) || []
            const defaultList = [
              { value: 0, label: t('entity:list.filter.without_program') },
            ]

            return [...defaultList, ...reformatResult]
          },
        } as FilterFormSchema,
        {
          id: 'select-province',
          type: 'select-async-paginate',
          name: 'province_ids',
          isMulti: true,
          label: t('common:form.province.label'),
          placeholder: t('common:form.province.placeholder'),
          loadOptions: loadProvinces,
          clearOnChangeFields: [
            'regency_ids',
            'sub_district_ids',
            'village_ids',
          ],
          additional: { page: 1 },
          defaultValue: null,
        } as FilterFormSchema,
      ]
    : [
        {
          id: 'select-province',
          type: 'select-async-paginate',
          name: 'province_ids',
          isMulti: true,
          label: t('common:form.province.label'),
          placeholder: t('common:form.province.placeholder'),
          loadOptions: loadProvinces,
          clearOnChangeFields: [
            'regency_ids',
            'sub_district_ids',
            'village_ids',
          ],
          additional: { page: 1 },
          defaultValue: null,
        } as FilterFormSchema,
      ]),
  {
    id: 'select-regency',
    type: 'select-async-paginate',
    name: 'regency_ids',
    isMulti: true,
    label: t('common:form.city.label'),
    placeholder: t('common:form.city.placeholder'),
    loadOptions: loadRegencies,
    disabled: ({ getReactSelectValue }) => !getReactSelectValue('province_ids'),
    clearOnChangeFields: ['sub_district_ids', 'village_ids'],
    additional: ({ getReactSelectValue }: { getReactSelectValue: any }) => ({
      page: 1,
      ...(getReactSelectValue('province_ids') && {
        parent_id: getReactSelectValue('province_ids'),
      }),
    }),
    defaultValue: null,
  },
  {
    id: 'select-sub-district',
    type: 'select-async-paginate',
    name: 'sub_district_ids',
    isMulti: true,
    label: t('common:form.subdistrict.label'),
    placeholder: t('common:form.subdistrict.placeholder'),
    loadOptions: loadSubdistricts,
    disabled: ({ getReactSelectValue }) => !getReactSelectValue('regency_ids'),
    clearOnChangeFields: ['village_ids'],
    additional: ({ getReactSelectValue }: { getReactSelectValue: any }) => ({
      page: 1,
      ...(getReactSelectValue('regency_ids') && {
        parent_id: getReactSelectValue('regency_ids'),
      }),
    }),
    defaultValue: null,
  },
  {
    id: 'select-village',
    type: 'select-async-paginate',
    name: 'village_ids',
    isMulti: true,
    label: t('common:form.village.label'),
    placeholder: t('common:form.village.placeholder'),
    loadOptions: loadVillages,
    disabled: ({ getReactSelectValue }) =>
      !getReactSelectValue('sub_district_ids'),
    clearOnChangeFields: [],
    additional: ({ getReactSelectValue }: { getReactSelectValue: any }) => ({
      page: 1,
      ...(getReactSelectValue('sub_district_ids') && {
        parent_id: getReactSelectValue('sub_district_ids'),
      }),
    }),
    defaultValue: null,
  },
  {
    id: 'input-id-satu-sehat',
    type: 'text',
    name: 'id_satu_sehat',
    label: t('entity:satu_sehat_code'),
    placeholder: t('entity:placeholder_satu_sehat_code'),
    className: '',
    defaultValue: '',
  },
]

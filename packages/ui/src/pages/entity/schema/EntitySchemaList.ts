import { FilterFormSchema, UseFilter } from '#components/filter'
import {
  getEntityType,
  getGlobalEntityType,
  loadEntityTags,
} from '#services/entity'
import { listPrograms } from '#services/program'
import { ProgramEnum, WORKSPACE } from '#constants/program'
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

            const wasteManagementOption = {
              value: ProgramEnum.WasteManagement,
              label: WORKSPACE[ProgramEnum.WasteManagement].name,
            }

            return [...defaultList, wasteManagementOption, ...reformatResult]
          },
        } as FilterFormSchema,
      ]
    : []),
  // Collapsed province/regency/sub_district/village multi-selects into a
  // single generic multi-select cascade: the resolved `location_ids` is the
  // UNION of every level's selections (not just the deepest level), matching
  // the backend's at-or-under-any-selected-node OR semantics. The isGlobal
  // branch above/below had no actual difference between its two variants
  // (both defined the same province field), so no isGlobal-conditional
  // structure is needed for this field.
  {
    id: 'select-location',
    type: 'locationCascade',
    name: 'location_ids',
    isMulti: true,
    // No maxLevel: this filter should cover the full hierarchy, so depth
    // is left to default from the live-fetched depth rather than a
    // hardcoded number that would go stale if a level is ever added.
    label: t('common:form.province.label'),
    defaultValue: null,
  } as FilterFormSchema,
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

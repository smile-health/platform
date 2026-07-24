import { UseFilter } from "#components/filter";
import { KfaLevelEnum } from "#constants/material";
import { getMaterialTypes, loadMaterial } from "#services/material";
import { loadContract } from "./dashboard-annual-commitment-vs-realization.service";
import { CreateFilterSchemaParams } from "./dashboard-annual-commitment-vs-realization.type";
import { generateYearOptions } from "./dashboard-annual-commitment-vs-realization.util";

export const createFilterSchema = ({ t, program_id }: CreateFilterSchemaParams): UseFilter => [
  {
    id: 'select-year',
    type: 'select',
    name: 'year',
    label: t('filter.label.year'),
    placeholder: t('filter.placeholder.year'),
    options: generateYearOptions(),
    defaultValue: { label: new Date().getFullYear().toString(), value: new Date().getFullYear() },
    isClearable: false,
    clearOnChangeFields: ['contract_numbers'],
  },
  {
    type: 'select',
    name: 'material_type_id',
    id: 'select-material-type',
    label: t('filter.label.material_type'),
    placeholder: t('filter.placeholder.material_type'),
    defaultValue: { value: 2, label: t('filter.default_value.vaccine') },
    loadOptions: async () => {
      let result = await getMaterialTypes({ page: 1, paginate: 100 })
      return result.data.map((x) => ({ value: x.id, label: x.name })) || []
    },
    clearOnChangeFields: ['material_ids', 'contract_numbers'],
  },
  {
    id: 'select-material',
    type: 'select-async-paginate',
    name: 'material_ids',
    label: t('filter.label.material'),
    placeholder: t('filter.placeholder.material'),
    loadOptions: loadMaterial,
    additional: ({ getReactSelectValue }) => ({
      page: 1,
      status: 1,
      material_type_ids: getReactSelectValue('material_type_id'),
      material_level_id: KfaLevelEnum.KFA_92,
      program_id,
    }),
    isMulti: true,
    defaultValue: null,
    clearOnChangeFields: ['contract_numbers'],
  },
  {
    id: 'select-contract-number',
    type: 'select-async-paginate',
    name: 'contract_numbers',
    label: t('filter.label.contract_number'),
    placeholder: t('filter.placeholder.contract_number'),
    loadOptions: loadContract,
    additional: ({ getReactSelectValue }) => ({
      page: 1,
      material_parent_id: getReactSelectValue('material_ids'),
      year: getReactSelectValue('year')
    }),
    isMulti: true,
    defaultValue: null,
  },
]
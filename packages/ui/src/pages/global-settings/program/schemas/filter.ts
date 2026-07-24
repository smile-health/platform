import { UseFilter } from "#components/filter"
import { TFunction } from "i18next"
import { configurationMaterialOptions } from "../constants/options"

export const createFilterSchema = (t: TFunction<['common', 'programGlobalSettings']>): UseFilter => [
  {
    id: 'input-search',
    type: 'text',
    name: 'keyword',
    label: t('programGlobalSettings:filter.search.label'),
    placeholder: t('programGlobalSettings:filter.search.placeholder'),
    className: '',
    defaultValue: '',
  },
  {
    id: 'select-type',
    type: 'select',
    name: 'is_hierarchy_enabled',
    isMulti: true,
    label: t('programGlobalSettings:filter.classification_material.label'),
    placeholder: t('programGlobalSettings:filter.classification_material.placeholder'),
    className: '',
    defaultValue: null,
    options: configurationMaterialOptions(t),
  },
]
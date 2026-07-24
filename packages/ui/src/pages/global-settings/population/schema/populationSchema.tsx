import { UseFilter } from '#components/filter'
import { loadProvinces } from '#services/location'
import { TFunction } from 'i18next'
import * as yup from 'yup'

export const generateFilterListPopulationSchema = (
  t: TFunction<['common', 'population']>
): UseFilter => [
  {
    id: 'keyword',
    type: 'text',
    name: 'keyword',
    label: t('common:search'),
    placeholder: t('common:search_by_keyword'),
    className: '',
    defaultValue: '',
  },
]

export const generateFilterDetailPopulationSchema = (
  t: TFunction<['common', 'population']>
): UseFilter => [
  {
    id: 'province',
    type: 'select-async-paginate',
    name: 'province',
    label: t('common:form.province.label'),
    className: '',
    loadOptions: loadProvinces,
    additional: { page: 1 },
    defaultValue: null,
  },
]

export const schemaImportPopulation = (
  t: TFunction<['common', 'population']>
) =>
  yup.object().shape({
    year_plan: yup.number().required(t('population:import.form.year.error')),
  })

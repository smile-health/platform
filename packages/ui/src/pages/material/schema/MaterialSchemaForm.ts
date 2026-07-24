import { TFunction } from 'i18next'
import * as yup from 'yup'

import { DEFAULT_VALUE, MATERIAL_LEVEL } from '../utils/material.constants'

type ConditionalRequiredSchema = (
  t: TFunction<['common', 'material']>,
  isHierarchicalValue: number
) => yup.StringSchema

const conditionalRequired: ConditionalRequiredSchema = (
  t,
  isHierarchicalValue
) =>
  yup.string().when(['is_hierarchy', 'material_level'], {
    is: (is_hierarchy: number) => {
      return is_hierarchy === isHierarchicalValue
    },
    then: (schema) => schema.required(t('common:validation.required')),
    otherwise: (schema) => schema.notRequired(),
  })

export const materialGlobalFormSchema = (
  t: TFunction<['common', 'material']>
) => {
  return yup.object().shape({
    name: yup.string().required(t('common:validation.required')),
    description: yup.string(),
    is_hierarchy: yup.number().required(t('common:validation.required')),
    material_level_id: yup.number().when(['is_hierarchy'], {
      is: (is_hierarchy: number) => is_hierarchy === DEFAULT_VALUE.YES,
      then: (schema) => schema.required(t('common:validation.required')),
      otherwise: (schema) => schema.notRequired(),
    }),
    hierarchy_code: conditionalRequired(t, DEFAULT_VALUE.YES),
    material_parent_ids: yup.mixed().when(['material_level'], {
      is: (material_level: number) => {
        return material_level === MATERIAL_LEVEL.TRADEMARK
      },
      then: (schema) => schema.required(t('common:validation.required')),
      otherwise: (schema) => schema.notRequired(),
    }),
    code: yup.string().required(t('common:validation.required')),
    unit_of_consumption_id: yup
      .mixed()
      .required(t('common:validation.required')),
    unit_of_distribution_id: yup
      .mixed()
      .required(t('common:validation.required')),
    consumption_unit_per_distribution_unit: yup
      .string()
      .required(t('common:validation.required')),
    min_retail_price: yup
      .number()
      .required(t('common:validation.required'))
      .test(
        'min_greater_max',
        t('material:detail.retail.validation.min_greater_max'),
        function (value) {
          const maxPrice = Number(this.parent.max_retail_price)
          return Number(value) <= maxPrice
        }
      ),
    max_retail_price: yup
      .number()
      .required(t('common:validation.required'))
      .test(
        'max-greater-min',
        t('material:detail.retail.validation.max_greater_min'),
        function (value) {
          const minPrice = Number(this.parent.min_retail_price)
          return Number(value) >= minPrice
        }
      ),
    is_temperature_sensitive: yup
      .number()
      .required(t('common:validation.required')),
    min_temperature: yup
      .number()
      .test(
        'min_greater_max',
        t('material:detail.temperature.validation.min_greater_max'),
        function (value: any) {
          const { createError } = this
          if (value === undefined) {
            return createError({
              path: this.path,
              message: t('common:validation.required'),
            })
          }

          const maxTemperature = Number(this.parent.max_temperature)
          return Number(value) <= maxTemperature
        }
      ),
    max_temperature: yup
      .number()
      .test(
        'max-greater-min',
        t('material:detail.temperature.validation.max_greater_min'),
        function (value: any) {
          const { createError } = this
          if (value === undefined) {
            return createError({
              path: this.path,
              message: t('common:validation.required'),
            })
          }

          const minTemperature = Number(this.parent.min_temperature)
          return Number(value) >= minTemperature
        }
      ),
    material_type_id: yup.mixed().required(t('common:validation.required')),
    material_subtype_id: yup.mixed().nullable(),
    is_managed_in_batch: yup.number().required(t('common:validation.required')),
    is_stock_opname_mandatory: yup
      .number()
      .required(t('common:validation.required')),
    program_ids: yup.array().of(yup.number()).notRequired(),
  })
}

export const materialProgramFormSchema = (
  t: TFunction<['common', 'material']>,
  material_level_id?: number
) => {
  return yup.object().shape({
    manufactures: yup
      .array()
      .of(yup.mixed())
      .min(1, t('common:validation.required'))
      .required(t('common:validation.required')),
    activities: yup
      .array()
      .of(
        yup.object({
          label: yup.string(),
          value: yup.number(),
          isPatientNeeded: yup.boolean(),
        })
      )
      .min(1, t('common:validation.required'))
      .required(t('common:validation.required')),
    material_companion: yup.array().of(yup.mixed()).notRequired(),
    is_addremove: yup
      .mixed<string | number | typeof NaN>()
      .test(
        'is-addremove-required',
        t('common:validation.required'),
        function (value) {
          if (material_level_id === 3) {
            return value != null && value !== '' && !Number.isNaN(value)
          }
          return true
        }
      ),
    entity_types: yup.array().when(['is_addremove'], {
      is: (is_addremove: number) => is_addremove === DEFAULT_VALUE.YES,
      then: (schema) =>
        schema
          .min(1, t('common:validation.required'))
          .required(t('common:validation.required')),
      otherwise: (schema) => schema.notRequired(),
    }),
    roles: yup.array().when(['is_addremove'], {
      is: (is_addremove: number) => is_addremove === DEFAULT_VALUE.YES,
      then: (schema) =>
        schema
          .min(1, t('common:validation.required'))
          .required(t('common:validation.required')),
      otherwise: (schema) => schema.notRequired(),
    }),
  })
}

export type MaterialGlobalFormData = yup.InferType<
  ReturnType<typeof materialGlobalFormSchema>
>
export type MaterialProgramFormData = yup.InferType<
  ReturnType<typeof materialProgramFormSchema>
>

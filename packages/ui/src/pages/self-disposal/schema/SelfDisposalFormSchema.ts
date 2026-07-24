import i18next from '#locales/i18n'
import * as yup from 'yup'

const t = i18next.t
const schemaItems = yup.object({
  id: yup.number().required(),
  activity: yup.object({
    id: yup.number().required(),
    name: yup.string().required(),
  }),
  batch: yup
    .object({
      id: yup.number().required(),
      code: yup.string().required(),
      production_date: yup.string().nullable(),
      expired_date: yup.string().nullable(),
      manufacture: yup
        .object({
          id: yup.number().required(),
          name: yup.string().required(),
        })
        .required(),
    })
    .nullable(),
  disposal_discard_qty: yup.number().required(),
  disposal_received_qty: yup.number().required(),
  disposals: yup
    .array()
    .of(
      yup
        .object({
          id: yup.number().required(),
          piece_per_unit: yup.number().nullable(),
          max_disposal_discard_qty: yup.number(),
          max_disposal_received_qty: yup.number(),
          disposal_discard_qty: yup
            .number()
            .nullable()
            .when('piece_per_unit', ([piece_per_unit], schema) => {
              if (!piece_per_unit) {
                return schema.nullable()
              }
              return schema.test(
                'is-multiply',
                t('selfDisposal:create.validation.quantity_must_multiply', {
                  number: piece_per_unit,
                }),
                function (v) {
                  if (!v) {
                    return true
                  }
                  return v % piece_per_unit === 0
                }
              )
            })
            .when(
              'max_disposal_discard_qty',
              ([max_disposal_discard_qty], schema) => {
                return schema.test(
                  'max',
                  t('selfDisposal:create.validation.max_qty'),
                  function (v) {
                    if (!v) {
                      return true
                    }
                    return v > max_disposal_discard_qty ? false : true
                  }
                )
              }
            ),
          disposal_received_qty: yup
            .number()
            .nullable()
            .when('piece_per_unit', ([piece_per_unit], schema) => {
              if (!piece_per_unit) {
                return schema.nullable()
              }
              return schema.test(
                'is-multiply',
                t('selfDisposal:create.validation.quantity_must_multiply', {
                  number: piece_per_unit,
                }),
                function (v) {
                  if (!v) {
                    return true
                  }
                  return v % piece_per_unit === 0
                }
              )
            })
            .when(
              'max_disposal_received_qty',
              ([max_disposal_discard_qty], schema) => {
                return schema.test(
                  'max',
                  t('selfDisposal:create.validation.max_qty'),
                  function (v) {
                    if (!v) {
                      return true
                    }
                    return v > max_disposal_discard_qty ? false : true
                  }
                )
              }
            ),
          transaction_reason: yup
            .object({
              id: yup.number(),
              title: yup.string(),
            })
            .required(),
        })
        .required()
    )
    .required(),
})

export const schemaDetail = yup.object({
  material: yup.object({
    id: yup.number().required(),
    name: yup.string().required(),
    is_managed_batch: yup.boolean().required(),
  }),
  activity: yup.object({
    id: yup.number().required(),
    name: yup.string().required(),
  }),
  activities: yup.array().of(
    yup.object({
      id: yup.number().required(),
      name: yup.string().required(),
    })
  ),
  selected_activities: yup.array().of(yup.number().required()).required(),
  disposal_qty: yup.number().required(),
  items: yup.array().of(schemaItems).required(),
  other_items: yup.array().of(schemaItems).required(),
})

export const schema = yup.object({
  entity: yup
    .object({
      label: yup.string(),
      value: yup.number(),
    })
    .required(t('common:validation.required')),
  activity: yup
    .object({
      label: yup.string(),
      value: yup.number(),
    })
    .required(t('common:validation.required')),
  disposal_method: yup
    .object({
      label: yup.string(),
      value: yup.number(),
    })
    .required(t('common:validation.required')),
  no_document: yup.string().nullable(),
  comment: yup.string().nullable(),
  materials: yup.array().of(schemaDetail).nonNullable(),
})

export type FormData = yup.InferType<typeof schema>
export type FormDataDetail = yup.InferType<typeof schemaDetail>

// Example JSON dummy data matching the schema

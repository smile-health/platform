import { TFunction } from 'i18next'
import * as Yup from 'yup'

export const schemaCreate = (t: TFunction<'reconciliation'>) =>
  Yup.object().shape({
    entity: Yup.object()
      .shape({
        value: Yup.mixed().nullable(),
        label: Yup.mixed().nullable(),
      })
      .required(t('create.validation.required')),
    activity: Yup.object()
      .shape({
        value: Yup.mixed().nullable(),
        label: Yup.mixed().nullable(),
      })
      .required(t('create.validation.required')),
    period_date: Yup.mixed().required(t('create.validation.required')),
    material: Yup.object()
      .shape({
        id: Yup.mixed().nullable(),
        name: Yup.mixed().nullable(),
      })
      .required(t('create.validation.required')),
    opname_stock_items: Yup.array().of(
      Yup.object().shape({
        reconciliation_category_label: Yup.string().required(
          t('create.validation.required')
        ),
        recorded_qty: Yup.number().required(t('create.validation.required')),
        actual_qty: Yup.string()
          .nullable()
          .required(t('create.validation.required'))
          .matches(/^[0-9]+$/, t('create.validation.numeric_only')),
        reasons: Yup.array()
          .of(
            Yup.object()
              .shape({
                label: Yup.mixed(),
                value: Yup.mixed(),
              })
              .nullable()
          )
          .when(['recorded_qty', 'actual_qty'], {
            is: (recorded_qty: any, actual_qty: any) =>
              Number(recorded_qty) !== Number(actual_qty),
            then: (schema) => schema.min(1, t('create.validation.required')),
            otherwise: (schema) => schema.nullable(),
          }),
        actions: Yup.array()
          .of(
            Yup.object()
              .shape({
                label: Yup.mixed(),
                value: Yup.mixed(),
              })
              .nullable()
          )
          .when(['recorded_qty', 'actual_qty'], {
            is: (recorded_qty: any, actual_qty: any) =>
              Number(recorded_qty) !== Number(actual_qty),
            then: (schema) => schema.min(1, t('create.validation.required')),
            otherwise: (schema) => schema.nullable(),
          }),
      })
    ),
  })

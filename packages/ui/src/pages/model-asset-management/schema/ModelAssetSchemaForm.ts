import { TFunction } from 'i18next'
import * as Yup from 'yup'

import { AssetUtilization } from '../asset-model.constants'

const buildCapacityFieldSchema = (
  t: TFunction<['common', 'modelAsset']>,
  selfLabelKey: string,
  counterpartLabelKey: string,
  compareFieldName: 'gross_capacity' | 'net_capacity',
  compareOp: 'lte' | 'gte'
) => {
  return Yup.mixed()
    .transform((_, orig) => {
      return isNaN(Number(orig)) ? null : Number(orig)
    })
    .nullable()
    .transform((v, orig) => (orig === '' ? null : v))
    .test(
      'capacity-required-cond',
      t('common:validation.required'),
      (value, context) => {
        const root = context?.from?.[context.from.length - 1]?.value || {}
        const required =
          Number(root?.is_capacity) === 1 ||
          Number(root?.asset_type_id?.data?.is_cce) === 1
        return !required || (value !== null && value !== undefined)
      }
    )
    .test(
      'capacity-greater-than-zero',
      t('common:validation.greater_than_zero', {
        value: t(selfLabelKey as any),
      }),
      (value, context) => {
        if (
          value === null ||
          value === undefined ||
          context?.from?.[context.from.length - 1]?.value?.asset_utilization
            ?.id === AssetUtilization.Warehouse
        )
          return true
        return Number(value) > 0
      }
    )
    .test(
      'capacity-compare',
      compareOp === 'lte'
        ? t('common:validation.lesser_or_equal_than', {
            first_value: t(selfLabelKey as any),
            second_value: t(counterpartLabelKey as any),
          })
        : t('common:validation.greater_or_equal_than', {
            first_value: t(selfLabelKey as any),
            second_value: t(counterpartLabelKey as any),
          }),
      (value, context) => {
        const counterpart = context.parent?.[compareFieldName]
        if (
          value === null ||
          value === undefined ||
          counterpart === null ||
          counterpart === undefined
        )
          return true
        return compareOp === 'lte' ? value <= counterpart : value >= counterpart
      }
    )
}

export const formSchema = (t: TFunction<['common', 'modelAsset']>) =>
  Yup.object().shape({
    name: Yup.string()
      .required(t('common:validation.required'))
      .max(255, t('common:validation.char.max', { char: 255 })),
    asset_utilization: Yup.object()
      .shape({
        is_warehouse: Yup.number(),
        is_cce: Yup.number(),
        id: Yup.string(),
      })
      .test('required', t('common:validation.required'), (value) => {
        return value !== undefined && Object.keys(value).length > 0
      }),
    asset_type_id: Yup.object()
      .shape({
        value: Yup.mixed(),
        label: Yup.string(),
      })
      .test('required', t('common:validation.required'), (value) => {
        return value !== undefined && Object.keys(value).length > 0
      }),
    manufacture_id: Yup.object()
      .shape({
        value: Yup.mixed(),
        label: Yup.string(),
      })
      .test('required', t('common:validation.required'), (value) => {
        return value !== undefined && Object.keys(value).length > 0
      }),
    is_capacity: Yup.number().notRequired(),
    asset_model_capacity: Yup.object()
      .shape({
        pqs_code_id: Yup.object()
          .shape({
            value: Yup.mixed().nullable(),
            label: Yup.string(),
          })
          .notRequired(),
        capacities: Yup.array()
          .of(
            Yup.object().shape({
              id_temperature_threshold: Yup.number().notRequired(),
              net_capacity: buildCapacityFieldSchema(
                t,
                'modelAsset:form.detail.capacity.column.net_capacity',
                'modelAsset:form.detail.capacity.column.gross_capacity',
                'gross_capacity',
                'lte'
              ),
              gross_capacity: buildCapacityFieldSchema(
                t,
                'modelAsset:form.detail.capacity.column.gross_capacity',
                'modelAsset:form.detail.capacity.column.net_capacity',
                'net_capacity',
                'gte'
              ),
            })
          )
          .test(
            'capacities-required',
            t('common:validation.required'),
            (value, context) => {
              const root = context?.from?.[context.from.length - 1]?.value || {}
              const required =
                Number(root?.is_capacity) === 1 ||
                Number(root?.asset_type_id?.data?.is_cce) === 1
              return !required || (Array.isArray(value) && value.length > 0)
            }
          ),
      })
      .required(t('common:validation.required')),
  })

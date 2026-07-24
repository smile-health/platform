import { ColumnDef } from '@tanstack/react-table'
import { Button } from '#components/button'
import { Checkbox } from '#components/checkbox'
import { FormErrorMessage } from '#components/form-control'
import Plus from '#components/icons/Plus'
import { Stock } from '#types/stock'
import { TFunction } from 'i18next'
import { FieldErrors } from 'react-hook-form'

import {
  handleMaterialTableClass,
  isSelectedStock,
  parseDate,
} from './order-create-central-distribution.helper'
import {
  TEntityMaterial,
  TOrderFormItemsValues,
  TOrderFormValues,
} from './order-create-central-distribution.type'

type TableMaterialColumnsParams = {
  t: TFunction<'orderCentralDistribution'>
  selectedMaterial: number[]
}

type TableFormColumnsParams = {
  t: TFunction<'orderCentralDistribution'>
  onClickBatch: (data: TOrderFormItemsValues, index: number) => void
  onRemove: (index: number) => void
  errors: FieldErrors<TOrderFormValues>
}

export function tableMaterialColumns({
  t,
  selectedMaterial,
}: TableMaterialColumnsParams) {
  const getClass = handleMaterialTableClass
  const schema: Array<ColumnDef<Stock>> = [
    {
      header: t('column.material_name'),
      accessorKey: 'name',
      cell: ({ row: { original } }) => original?.material?.name,
      meta: {
        cellClassName: ({ original }) => getClass(original, selectedMaterial),
      },
    },
    {
      header: t('column.selection'),
      accessorKey: 'selection',
      size: 100,
      meta: {
        cellClassName: ({ original }) => getClass(original, selectedMaterial),
      },
      cell: ({ row: { original } }) => {
        return (
          <Checkbox
            checked={isSelectedStock(original?.material?.id, selectedMaterial)}
            readOnly
            value={original?.material?.id}
          />
        )
      },
    },
  ]

  return schema
}

export function tableFormColumns({
  t,
  onClickBatch,
  onRemove,
  errors,
}: TableFormColumnsParams) {
  const schema: Array<ColumnDef<TOrderFormItemsValues>> = [
    {
      header: 'Material',
      accessorKey: 'name',
      size: 400,
    },
    {
      header: t('column.quantity'),
      accessorKey: 'qty',
      size: 400,
      cell: ({ row: { original, ...row } }) => {
        const stocks = original?.stocks?.filter((item) => !!item?.ordered_qty)
        const errorMsg = errors?.order_items?.[row?.index]?.stocks?.message
        return (
          <div className="ui-space-y-4">
            {stocks?.map((item) => (
              <div key={item?.batch_code}>
                {Boolean(original?.is_managed_in_batch) && (
                  <>
                    <p>
                      {t('label.batch_code')}: {item?.batch_code}
                    </p>
                    <p>
                      {t('label.date.expired')}: {parseDate(item?.expired_date)}
                    </p>
                    <p>
                      {t('label.date.production')}:{' '}
                      {parseDate(item?.production_date)}
                    </p>
                    <p>
                      {t('label.manufacturer')}: {item?.manufacturer?.label}
                    </p>
                  </>
                )}
                <p>
                  {t('label.plan.year')}: {item?.budget_year}
                </p>
                <p>
                  {t('label.plan.source')}: {item?.budget_source?.label}
                </p>
                <p>
                  <strong>Qty: {item?.ordered_qty}</strong>
                </p>
              </div>
            ))}
            <div className="ui-space-y-1">
              {stocks?.length ? (
                <Button
                  variant="outline"
                  onClick={() => onClickBatch(original, row.index)}
                >
                  {original?.is_managed_in_batch
                    ? t('action.quantity.batch.update')
                    : t('action.quantity.non_batch.update')}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  leftIcon={<Plus className="ui-size-5" />}
                  onClick={() => onClickBatch(original, row.index)}
                >
                  {original?.is_managed_in_batch
                    ? t('action.quantity.batch.add')
                    : t('action.quantity.non_batch.add')}
                </Button>
              )}
              {errorMsg && <FormErrorMessage>{errorMsg}</FormErrorMessage>}
            </div>
          </div>
        )
      },
    },
    {
      header: t('column.action'),
      accessorKey: 'action',
      size: 80,
      cell: ({ row }) => (
        <Button
          onClick={() => onRemove(row?.index)}
          className="ui-p-0 ui-h-auto"
          color="danger"
          variant="subtle"
        >
          {t('action.remove')}
        </Button>
      ),
    },
  ]

  return schema
}

export const defaultStock = [
  {
    activity_id: null,
    expired_date: null,
    manufacturer: null,
    production_date: null,
    ordered_qty: null,
    batch_code: null,
    budget_year: null,
    budget_source: null,
    total_price: null,
  },
]

const start = 1999
const end = new Date().getFullYear()
export const years = Array.from(
  new Array(end - start + 1),
  (_, index) => index + start
).map((item) => ({
  value: item?.toString(),
  label: item.toString(),
}))

export function tableBatchHeader(
  t: TFunction<'orderCentralDistribution'>,
  unit?: string,
  isManagedInBatch = true
) {
  if (isManagedInBatch) {
    return [
      'SI. No',
      t('column.batch_info'),
      t('column.quantity_unit', { unit }),
      t('column.price.total'),
      t('column.price.unit', { unit }),
      '',
    ]
  }

  return [
    'SI. No',
    t('column.batch_info'),
    t('column.quantity_unit', { unit }),
    t('column.plan.year'),
    t('column.plan.source'),
    t('column.price.total'),
    t('column.price.unit', { unit }),
  ]
}

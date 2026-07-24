import { ColumnDef } from '@tanstack/react-table'
import { Button } from '#components/button'
import { Checkbox } from '#components/checkbox'
import { FormErrorMessage } from '#components/form-control'
import Plus from '#components/icons/Plus'
import { OptionType } from '#components/react-select'
import { Stock } from '#types/stock'
import { getBackgroundStock } from '#utils/formatter'
import { TFunction } from 'i18next'
import { FieldErrors } from 'react-hook-form'

import {
  handleMaterialTableClass,
  isOutOfStock,
  isSelectedStock,
  parseDate,
} from './order-create-distribution.helper'
import {
  TOrderFormItemsValues,
  TOrderFormValues,
} from './order-create-distribution.type'

type TableMaterialColumnsParams = {
  t: TFunction<'orderDistribution'>
  activity: OptionType | null
  formatNumber: (numb?: number) => string
  selectedMaterial: number[]
}

type TableFormColumnsParams = {
  t: TFunction<'orderDistribution'>
  activity: OptionType | null
  formatNumber: (numb?: number) => string
  onClickBatch: (data: TOrderFormItemsValues, index: number) => void
  onRemove: (material_id: number) => void
  errors: FieldErrors<TOrderFormValues>
}

export function tableMaterialColumns({
  t,
  activity,
  formatNumber,
  selectedMaterial,
}: TableMaterialColumnsParams) {
  const getClass = handleMaterialTableClass
  const schema: Array<ColumnDef<Stock>> = [
    {
      header: t('column.material.name'),
      accessorKey: 'material.name',
      meta: {
        cellClassName: ({ original }) => getClass(original, selectedMaterial),
      },
    },
    {
      header: t('column.stock.activity', { activity: activity?.label }),
      accessorKey: 'total_available_qty',
      cell: ({ getValue }) => {
        const value = getValue<number>()
        return formatNumber(value)
      },
      meta: {
        cellClassName: ({ original }) => getClass(original, selectedMaterial),
      },
    },
    {
      header: t('column.stock.available'),
      accessorKey: 'aggregate.total_available_qty',
      cell: ({ getValue }) => {
        const value = getValue<number>()
        return formatNumber(value)
      },
      meta: {
        cellClassName: ({ original }) => getClass(original, selectedMaterial),
      },
    },
    {
      header: t('column.selection'),
      accessorKey: 'selection',
      size: 100,
      cell: ({ row: { original } }) => {
        return (
          <Checkbox
            disabled={isOutOfStock(
              original?.total_available_qty +
                Number(original?.aggregate?.total_available_qty)
            )}
            checked={isSelectedStock(original?.material?.id, selectedMaterial)}
            readOnly
            value={original?.material?.id}
          />
        )
      },
      meta: {
        cellClassName: ({ original }) => getClass(original, selectedMaterial),
      },
    },
  ]

  return schema
}

export function tableFormColumns({
  t,
  activity,
  formatNumber,
  onClickBatch,
  onRemove,
  errors,
}: TableFormColumnsParams) {
  const schema: Array<ColumnDef<TOrderFormItemsValues>> = [
    {
      header: 'SI. No',
      accessorKey: 'rowNumber',
      cell: ({ row: { index } }) => index + 1,
      size: 80,
      meta: {
        cellClassName: 'ui-align-top',
      },
    },
    {
      header: t('column.material.info'),
      accessorKey: 'material.name',
      size: 250,
      meta: {
        cellClassName: 'ui-align-top',
      },
      cell: ({ getValue }) => (
        <>
          <p>
            <strong>{getValue<string>()}</strong>
          </p>
          <p>
            {t('label.activity')}: {activity?.label}
          </p>
        </>
      ),
    },
    {
      header: t('column.stock.info'),
      accessorKey: 'total_qty',
      meta: {
        cellClassName: ({ original }) => {
          const total_qty = Number(original?.total_qty)
          const min = Number(original?.min)
          const max = Number(original?.max)

          return `ui-align-top ${getBackgroundStock(total_qty, min, max)}`
        },
      },
      cell: ({ row: { original }, getValue }) => {
        const total_qty = (getValue() as number) ?? 0
        const min = original?.min === null ? '-' : formatNumber(original?.min)
        const max = original?.max === null ? '-' : formatNumber(original?.max)

        return (
          <>
            <p>
              {t('label.stock.on_hand')}: {formatNumber(total_qty)}
            </p>
            <p className="ui-mb-1">
              {t('label.stock.available')}:{' '}
              {formatNumber(original?.total_available_qty)}
            </p>
            <p className="ui-text-neutral-500">
              (min: {min}, max: {max})
            </p>
          </>
        )
      },
    },
    {
      header: t('column.quantity'),
      accessorKey: 'qty',
      meta: {
        cellClassName: 'ui-align-top',
      },
      cell: ({ row: { original, ...row } }) => {
        const batch = original?.batch?.filter((item) => !!item?.ordered_qty)
        const errorMsg =
          errors?.order_items?.[row?.index]?.message ??
          errors?.order_items?.[row?.index]?.batch?.message
        return (
          <div className="ui-space-y-4">
            {batch?.map((item) => (
              <div key={item?.code}>
                {original?.material?.is_managed_in_batch && (
                  <>
                    <p>
                      {t('label.batch_code')}: {item?.code}
                    </p>
                    <p>
                      {t('label.date.expired')}: {parseDate(item?.expired_date)}
                    </p>
                  </>
                )}

                <p>
                  {t('label.stock.from_activity')}: {item?.activity?.name}
                </p>
                <p>
                  <strong>Qty: {item?.ordered_qty}</strong>
                </p>
              </div>
            ))}
            <div className="ui-space-y-1">
              {batch?.length ? (
                <Button
                  variant="outline"
                  onClick={() => onClickBatch(original, row.index)}
                >
                  {original?.material?.is_managed_in_batch
                    ? t('action.quantity.batch.update')
                    : t('action.quantity.non_batch.update')}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  leftIcon={<Plus className="ui-size-5" />}
                  onClick={() => onClickBatch(original, row.index)}
                >
                  {original?.material?.is_managed_in_batch
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
      meta: {
        cellClassName: 'ui-align-top',
      },
      cell: ({ row: { original } }) => (
        <Button
          onClick={() => onRemove(original?.material?.id as number)}
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

export function tableBatchHeader(t: TFunction<'orderDistribution'>) {
  return [
    'SI. No',
    t('column.batch_info'),
    t('column.stock.info'),
    t('column.activity'),
    t('column.quantity'),
    t('column.material.status'),
  ]
}

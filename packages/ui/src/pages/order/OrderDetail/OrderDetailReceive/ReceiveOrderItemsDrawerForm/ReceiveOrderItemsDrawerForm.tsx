import { useCallback, useEffect, useMemo } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { ColumnDef, Row } from '@tanstack/react-table'
import { DataTable } from '#components/data-table'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { InputNumberV2 } from '#components/input-number-v2'
import { OptionType, ReactSelectAsync } from '#components/react-select'
import { Stock, StockDetailStock } from '#types/stock'
import { parseDateTime } from '#utils/date'
import { numberFormatter } from '#utils/formatter'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { loadMaterialStatus } from '../../../OrderCreateReturn/order-create-return.service'
import { OrderDetailDrawer } from '../../components'
import { OrderDetailItem, OrderDetailStock } from '../../order-detail.type'
import { receiveItemSchema } from '../receive.schema'
import { ReceiveOrderItemReceive } from '../receive.service'

export type ReceiveOrderItemsDrawerFormValues = {
  id: number | undefined
  receives: Array<
    Omit<ReceiveOrderItemReceive, 'fulfill_stock_status_id'> & {
      fulfill_stock_status_id: OptionType | null
      _order_item_stock: OrderDetailStock
    }
  >
  _order_item?: OrderDetailItem
  _vendor_stock?: Stock
}

type ReceiveOrderItemsDrawerFormProps = {
  isOpen: boolean
  selectedRow?: Row<ReceiveOrderItemsDrawerFormValues>
  isLoading?: boolean
  onClose: () => void
  onSubmit: (
    values: ReceiveOrderItemsDrawerFormValues,
    rowIndex?: number
  ) => void
  isNonRegularOrder: boolean
}

export const ReceiveOrderItemsDrawerForm = ({
  isOpen,
  selectedRow,
  isLoading,
  onClose,
  onSubmit,
  isNonRegularOrder,
}: ReceiveOrderItemsDrawerFormProps) => {
  const { t, i18n } = useTranslation(['common', 'orderDetail'])

  const rowIndex = selectedRow?.index
  const orderItem = selectedRow?.original

  const tableData =
    orderItem?.receives?.map((receive) => receive._order_item_stock) ?? []

  const {
    control,
    watch,
    reset,
    trigger,
    handleSubmit,
    formState: { errors },
  } = useForm<ReceiveOrderItemsDrawerFormValues>({
    resolver: yupResolver(receiveItemSchema(t, i18n?.language)),
    mode: 'onChange',
    defaultValues: selectedRow?.original,
  })
  const handleDefaultValues = useCallback(() => {
    if (orderItem) {
      reset(orderItem)
    }
  }, [orderItem, reset])

  const onReset = () => {
    reset({
      ...orderItem,
      receives:
        orderItem?.receives?.map((receive) => ({
          ...receive,
          received_qty: undefined,
          fulfill_stock_status_id: undefined,
        })) ?? [],
    })
  }

  const handleClose = () => {
    onReset()
    onClose()
  }

  const handleSubmitForm = (values: ReceiveOrderItemsDrawerFormValues) => {
    onSubmit(values, rowIndex)
    onClose()
  }

  const columns: ColumnDef<StockDetailStock>[] = useMemo(
    () => [
      {
        header: t('orderDetail:table.column.si_number'),
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: 'batch_info',
        header: t('orderDetail:table.column.batch_info'),
        cell: ({ row }) => {
          return (
            <div className="ui-flex ui-flex-col ui-justify-center">
              <p className="ui-font-bold">
                {row?.original?.batch?.code ?? '-'}
              </p>
              <p>
                {t('orderDetail:table.trademark.batch.production_date', {
                  date:
                    parseDateTime(
                      row?.original?.batch?.production_date,
                      'YYYY-MM-DD'
                    ) ?? '-',
                })}
              </p>
              <p>
                {t('orderDetail:table.trademark.batch.manufacturer', {
                  name: row?.original?.batch?.manufacture_name ?? '-',
                })}
              </p>
              <p>
                {t('orderDetail:table.trademark.batch.expired_date', {
                  date:
                    parseDateTime(
                      row?.original?.batch?.expired_date,
                      'YYYY-MM-DD'
                    ) ?? '-',
                })}
              </p>
            </div>
          )
        },
      },
      ...(!isNonRegularOrder
        ? ([
            {
              header: t('orderDetail:table.column.ordered'),
              cell: ({ row }) =>
                numberFormatter(row.original?.ordered_qty, i18n.language),
              meta: {
                cellClassName: 'ui-w-[400px]',
              },
            },
          ] as ColumnDef<StockDetailStock>[])
        : []),
      {
        accessorKey: 'shipped',
        header: t('orderDetail:table.column.shipped'),

        cell: ({ row }) =>
          numberFormatter(row.original?.shipped_qty, i18n.language) ?? '-',
      },
      {
        accessorKey: 'received_qty',
        header: t('orderDetail:table.column.received'),
        cell: ({ row }) => (
          <Controller
            key={`receives.${row.index}.received_qty`}
            name={`receives.${row.index}.received_qty`}
            control={control}
            render={({ field, fieldState }) => (
              <div className="space-y-1">
                <InputNumberV2
                  id={field.name}
                  aria-label={field.name}
                  placeholder={t('orderDetail:form.confirmed_qty.placeholder')}
                  value={field?.value ?? ''}
                  onValueChange={(e) => {
                    field.onChange(e.floatValue)
                    trigger('receives')
                  }}
                  error={Boolean(fieldState.error)}
                />
                {fieldState.error && (
                  <FormErrorMessage>
                    {fieldState.error?.message}
                  </FormErrorMessage>
                )}
              </div>
            )}
          />
        ),
      },
      {
        accessorKey: 'fulfill_stock_status_id',
        header: t('orderDetail:table.column.material_status'),
        cell: ({ row }) => (
          <Controller
            control={control}
            key={`receives.${row.index}.fulfill_stock_status_id`}
            name={`receives.${row.index}.fulfill_stock_status_id`}
            render={({ field, fieldState }) => {
              return (
                <div className="space-y-1">
                  <ReactSelectAsync
                    id={`fulfill_stock_status_id_${row.index}`}
                    className="ui-text-sm"
                    placeholder={t(
                      'orderDetail:form.material_status.placeholder'
                    )}
                    isClearable
                    value={watch(
                      `receives.${row.index}.fulfill_stock_status_id`
                    )}
                    menuPosition="fixed"
                    onChange={(option: OptionType) => {
                      field.onChange(option)
                      trigger(`receives.${row.index}`)
                    }}
                    loadOptions={loadMaterialStatus}
                    additional={{
                      page: 1,
                    }}
                    error={!!fieldState.error?.message}
                  />
                  {fieldState.error?.message && (
                    <FormErrorMessage>
                      {fieldState.error?.message}
                    </FormErrorMessage>
                  )}
                </div>
              )
            }}
          />
        ),
        meta: {
          hidden: !orderItem?._order_item?.material?.is_temperature_sensitive,
        },
      },
    ],
    [i18n.language, orderItem, rowIndex]
  )

  useEffect(() => {
    handleDefaultValues()
  }, [orderItem, rowIndex, isOpen])

  return (
    <OrderDetailDrawer
      key={orderItem?.id ?? rowIndex ?? 'drawer'}
      id="batch-list-drawer-form"
      open={isOpen}
      onClose={handleClose}
      title={t('orderDetail:drawer.batch_list.title')}
      onReset={onReset}
      onSubmit={handleSubmit(handleSubmitForm)}
      isLoading={isLoading}
      submitButton={{
        label: t('common:save'),
      }}
      disabled={Boolean(errors.receives)}
    >
      <div className="ui-grid ui-grid-cols-3 ui-gap-10">
        <FormControl className="ui-space-y-1">
          <FormLabel className="text-sm">Material</FormLabel>
          <div className="ui-text-dark-blue ui-font-bold">
            {orderItem?._order_item?.material.name}
          </div>
        </FormControl>
        <FormControl className="ui-space-y-1">
          <FormLabel className="text-sm">
            {t('orderDetail:table.column.shipped')}
          </FormLabel>
          <div className="ui-text-dark-blue ui-font-bold">
            {numberFormatter(
              orderItem?._order_item?.confirmed_qty,
              i18n.language
            )}
          </div>
        </FormControl>
      </div>

      <div>
        <DataTable
          data={tableData}
          columns={columns}
          isSticky
          className="ui-overflow-y-auto ui-max-h-[50vh]"
        />
      </div>
    </OrderDetailDrawer>
  )
}

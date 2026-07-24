import { useEffect } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '#components/data-table'
import { FormErrorMessage } from '#components/form-control'
import { InputNumber } from '#components/input-number'
import { numberFormatter } from '#utils/formatter'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { orderDetailConfirmOrderStocksFormSchema } from '../../order-detail.schema'
import useOrderDetailStore from '../../order-detail.store'
import {
  OrderDetailConfirmDrawerFormValues,
  OrderDetailItem,
  UpdateOrderStatusToConfirmResponseError,
} from '../../order-detail.type'
import { OrderDetailDrawer } from '../OrderDetailDrawer'

type OrderDetailConfirmDrawerFormProps = {
  errors?: UpdateOrderStatusToConfirmResponseError
  isLoading?: boolean
  onSubmit: (values: OrderDetailConfirmDrawerFormValues) => void
}

export const OrderDetailConfirmDrawerForm = ({
  errors,
  isLoading,
  onSubmit,
}: OrderDetailConfirmDrawerFormProps) => {
  const { t, i18n } = useTranslation(['common', 'orderDetail'])

  const {
    data,
    isVendor,
    isOpenConfirmDrawerForm,
    setOpenConfirmDrawerForm,
    setOpenConfirmModalForm,
  } = useOrderDetailStore()

  const defaultValues: OrderDetailConfirmDrawerFormValues = {
    order_items: data?.order_items.map((item) => ({
      id: item.id,
      confirmed_qty: undefined,
      _data: item,
    })),
  }

  const { control, handleSubmit, reset, setValue, setError } =
    useForm<OrderDetailConfirmDrawerFormValues>({
      defaultValues,
      resolver: yupResolver(
        orderDetailConfirmOrderStocksFormSchema(t, i18n.language)
      ),
      mode: 'onChange',
    })

  const columns: ColumnDef<OrderDetailItem>[] = [
    {
      accessorKey: 'material.name',
      header: t('orderDetail:table.column.material_name'),
      cell: ({ row }) => row.original.material.name,
    },
    {
      accessorKey: 'qty',
      header: t('orderDetail:table.column.ordered'),
      cell: ({ row }) => numberFormatter(row.original.qty, i18n.language),
    },
    {
      accessorKey: 'confirmed_qty',
      header: t('orderDetail:table.column.confirmed'),
      cell: ({ row }) => (
        <Controller
          key={`order_items.${row.index}.confirmed_qty`}
          name={`order_items.${row.index}.confirmed_qty`}
          control={control}
          render={({ field, fieldState }) => (
            <div className="space-y-1">
              <InputNumber
                hideStepper
                name={field.name}
                id={field.name}
                placeholder={t('orderDetail:form.confirmed_qty.placeholder')}
                value={field?.value as number}
                minValue={0}
                className="ui-text-sm"
                onChange={(e) => {
                  field.onChange(Number.isNaN(e) ? undefined : e)
                  setValue(`order_items.${row.index}`, {
                    id: row.original.id,
                    confirmed_qty: e,
                  })
                }}
                error={Boolean(fieldState.error)}
              />
              {fieldState.error && (
                <FormErrorMessage>{fieldState.error?.message}</FormErrorMessage>
              )}
            </div>
          )}
        />
      ),
      meta: {
        cellClassName: 'ui-w-1/4',
      },
    },
    {
      accessorKey: 'stock_customer.available_stock',
      header: t('orderDetail:table.column.available_stock'),
      cell: ({ row }) => {
        const stockVendor = row.original.stock_vendor
        return (
          <div className="ui-space-y-1">
            <div>
              {numberFormatter(stockVendor?.total_available_qty, i18n.language)}
            </div>
            <div className="ui-text-gray-500">
              (min: {numberFormatter(stockVendor?.min, i18n.language)} | max:{' '}
              {numberFormatter(stockVendor?.max, i18n.language)})
            </div>
          </div>
        )
      },
      meta: {
        headerSubComponent: (
          <div className="ui-font-normal ui-text-gray-500">
            {t('common:at')} {data?.vendor?.name}
          </div>
        ),
      },
    },
  ]

  const handleSubmitForm = (values: OrderDetailConfirmDrawerFormValues) => {
    onSubmit(values)
    setOpenConfirmModalForm(true)
  }

  const handleClose = () => {
    reset(defaultValues)
    setOpenConfirmDrawerForm(false)
  }

  useEffect(() => {
    data?.order_items?.forEach((item, index) => {
      setError(`order_items.${index}.confirmed_qty`, {
        message: errors?.order_items?.[index].confirmed_qty?.[0],
      })
    })
  }, [errors])

  return (
    <OrderDetailDrawer
      id="confirm-order-drawer-form"
      open={isOpenConfirmDrawerForm}
      onClose={handleClose}
      title={t('orderDetail:drawer.confirm_order.title')}
      onReset={() => reset(defaultValues)}
      onSubmit={handleSubmit(handleSubmitForm)}
      isLoading={isLoading}
      submitButton={{
        label: t('orderDetail:button.submit_confirmation'),
      }}
    >
      <DataTable columns={columns} data={data?.order_items} />
    </OrderDetailDrawer>
  )
}

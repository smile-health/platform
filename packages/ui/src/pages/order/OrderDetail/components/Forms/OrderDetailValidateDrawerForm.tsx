import { useEffect } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '#components/data-table'
import { FormErrorMessage } from '#components/form-control'
import { InputNumber } from '#components/input-number'
import { USER_ROLE } from '#constants/roles'
import { numberFormatter } from '#utils/formatter'
import { getUserStorage } from '#utils/storage/user'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { orderDetailValidateFormSchema } from '../../order-detail.schema'
import useOrderDetailStore from '../../order-detail.store'
import {
  OrderDetailItem,
  OrderDetailValidateDrawerFormValues,
  UpdateOrderStatusToPendingFromDraftResponseError,
} from '../../order-detail.type'
import { OrderDetailDrawer } from '../OrderDetailDrawer'

type OrderDetailValidateDrawerFormProps = {
  errors?: UpdateOrderStatusToPendingFromDraftResponseError
  isLoading?: boolean
  onSubmit: (values: OrderDetailValidateDrawerFormValues) => void
}

export const OrderDetailValidateDrawerForm = ({
  errors,
  isLoading,
  onSubmit,
}: OrderDetailValidateDrawerFormProps) => {
  const { t, i18n } = useTranslation(['common', 'orderDetail'])
  const user = getUserStorage()
  const isSuperAdmin = user?.role === USER_ROLE.SUPERADMIN

  const {
    data,
    isOpenValidateDrawerForm,
    setOpenValidateDrawerForm,
    setOpenValidateModalForm,
  } = useOrderDetailStore()

  const defaultValues: OrderDetailValidateDrawerFormValues = {
    order_items: data?.order_items.map((item) => ({
      id: item.id,
      validated_qty: undefined,
      _data: item,
    })),
  }

  const { control, handleSubmit, reset, setValue, setError } =
    useForm<OrderDetailValidateDrawerFormValues>({
      defaultValues,
      resolver: yupResolver(orderDetailValidateFormSchema(t, i18n.language)),
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
      accessorKey: 'validated_qty',
      header: t('orderDetail:table.column.validated'),
      cell: ({ row }) => (
        <Controller
          key={`order_items.${row.index}.validated_qty`}
          name={`order_items.${row.index}.validated_qty`}
          control={control}
          render={({ field, fieldState }) => (
            <div className="space-y-1">
              <InputNumber
                hideStepper
                name={field.name}
                id={field.name}
                placeholder={t('orderDetail:form.validated_qty.placeholder')}
                value={field?.value as number}
                minValue={0}
                className="ui-text-sm"
                onChange={(e) => {
                  field.onChange(Number.isNaN(e) ? undefined : e)
                  setValue(`order_items.${row.index}`, {
                    id: row.original.id,
                    validated_qty: e,
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
    ...(isSuperAdmin
      ? ([
          {
            accessorKey: 'stock_customer.available_stock',
            header: t('orderDetail:table.column.available_stock'),
            cell: ({ row }) => {
              const stockCustomer = row.original.stock_customer
              return (
                <div className="ui-space-y-1">
                  <div>
                    {numberFormatter(
                      stockCustomer?.total_available_qty,
                      i18n.language
                    )}
                  </div>
                  <div className="ui-text-gray-500">
                    (min: {numberFormatter(stockCustomer?.min, i18n.language)} |
                    max: {numberFormatter(stockCustomer?.max, i18n.language)})
                  </div>
                </div>
              )
            },
            meta: {
              headerSubComponent: (
                <div className="ui-font-normal ui-text-gray-500">
                  {t('common:at')} {data?.customer.name}
                </div>
              ),
            },
          },
        ] as ColumnDef<OrderDetailItem>[])
      : []),
  ]

  const handleSubmitForm = (values: OrderDetailValidateDrawerFormValues) => {
    onSubmit(values)
    setOpenValidateModalForm(true)
  }

  const handleClose = () => {
    reset(defaultValues)
    setOpenValidateDrawerForm(false)
  }

  useEffect(() => {
    data?.order_items?.forEach((_, index) => {
      setError(`order_items.${index}.validated_qty`, {
        message: errors?.order_items?.[index]?.validated_qty?.[0],
      })
    })
  }, [errors])

  return (
    <OrderDetailDrawer
      id="validate-order-drawer-form"
      open={isOpenValidateDrawerForm}
      onClose={handleClose}
      title={t('orderDetail:drawer.validate_order.title')}
      onReset={() => reset(defaultValues)}
      onSubmit={handleSubmit(handleSubmitForm)}
      isLoading={isLoading}
      submitButton={{
        label: t('orderDetail:button.submit_validation'),
      }}
    >
      <DataTable columns={columns} data={data?.order_items} />
    </OrderDetailDrawer>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '#components/data-table'
import { FormErrorMessage } from '#components/form-control'
import { InputNumberV2 } from '#components/input-number-v2'
import { numberFormatter } from '#utils/formatter'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { orderDetailHierarchyChildrenConfirmOrderSchema } from '../../order-detail.schema'
import useOrderDetailStore from '../../order-detail.store'
import {
  OrderDetailConfirmDrawerFormValues,
  OrderDetailConfirmDrawerHierarchyFormValues,
  OrderDetailItem,
  UpdateOrderHierarchyStatusToConfirmResponseError,
} from '../../order-detail.type'
import { OrderDetailDrawer } from '../OrderDetailDrawer'
import { OrderDetailConfirmHierarchyChildrenModalForm } from './OrderDetailConfirmHierarchyChildrenModalForm'

type OrderDetailConfirmHierarchyDrawerFormProps = {
  isLoading?: boolean
  errors?: UpdateOrderHierarchyStatusToConfirmResponseError
  onSubmit: (values: OrderDetailConfirmDrawerFormValues) => void
}

export const OrderDetailConfirmHierarchyDrawerForm = ({
  isLoading,
  errors,
  onSubmit,
}: OrderDetailConfirmHierarchyDrawerFormProps) => {
  const { t, i18n } = useTranslation(['common', 'orderDetail'])
  const [rowIndex, setRowIndex] = useState<number | undefined>(undefined)

  const {
    data,
    isOpenConfirmDrawerForm,
    setOpenConfirmDrawerForm,
    setOpenConfirmModalForm,
    setOpenModalConfirmHierarchyChildren,
    setIndexHierarchyRow,
  } = useOrderDetailStore()

  const defaultValues: any = {
    order_items: data?.order_items.map((item) => ({
      material_id: item.material.id,
      id: item.id,
      confirmed_qty: undefined,
      children: item?.children?.map((child) => ({
        ...child,
        confirmed_qty: undefined,
      })),
    })),
  }

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    clearErrors,
    setError,
  } = useForm<OrderDetailConfirmDrawerHierarchyFormValues>({
    defaultValues,
    resolver: yupResolver(
      orderDetailHierarchyChildrenConfirmOrderSchema(t, i18n.language, data)
    ),
    mode: 'onChange',
  })

  const { order_items } = watch()
  useEffect(() => {
    if (errors?.order_items) {
      Object.keys(errors.order_items).forEach((itemIndex) => {
        const item = errors.order_items?.[itemIndex as unknown as number]
        setError(`order_items.${Number(itemIndex)}.confirmed_qty`, {
          message: item?.confirmed_qty as unknown as string,
        })
      })
    }
  }, [errors, setError])

  const columns: ColumnDef<OrderDetailItem>[] = useMemo(
    () => [
      {
        accessorKey: 'material.name',
        header: t('orderDetail:table.column.material_name'),
        cell: ({ row }) => row.original.material.name,
      },
      {
        accessorKey: 'qty',
        header: t('orderDetail:table.column.ordered'),
        cell: ({ row }) => {
          return (
            <div>
              <div>
                {numberFormatter(row.original.ordered_qty, i18n.language)}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'confirmed_qty',
        header: t('orderDetail:table.column.confirmed'),
        cell: ({ row }) => (
          <Controller
            key={`order_items.${row.index}.confirmed_qty`}
            name={`order_items.${row.index}.confirmed_qty`}
            control={control}
            render={({ field: { value, onChange, name }, fieldState }) => {
              const totalQtyChildren = order_items?.[
                row?.index
              ]?.children?.reduce(
                (acc, child) => acc + (child.confirmed_qty ?? 0),
                0
              )

              return (
                <div className="space-y-1">
                  <InputNumberV2
                    name={name}
                    id={name}
                    disabled={Boolean(row?.original?.children?.length)}
                    placeholder={t(
                      'orderDetail:form.confirmed_qty.placeholder'
                    )}
                    value={
                      row?.original?.children?.length
                        ? totalQtyChildren
                        : (value as number)
                    }
                    className="ui-text-sm"
                    onValueChange={(e) => {
                      const numValue =
                        e.value === '' ? null : Number(e.floatValue)
                      onChange(numValue)
                      setValue(
                        `order_items.${row?.index}.id`,
                        row?.original?.id
                      )
                      setValue(
                        `order_items.${row?.index}.material_id`,
                        row?.original?.material?.id
                      )
                    }}
                    error={Boolean(fieldState?.error)}
                  />
                  {fieldState?.error && (
                    <FormErrorMessage>
                      {fieldState?.error?.message}
                    </FormErrorMessage>
                  )}
                  {(row?.original?.children?.length ?? 0) > 0 && (
                    <div>
                      <button
                        type="button"
                        className="ui-text-primary-500"
                        onClick={() => {
                          setOpenModalConfirmHierarchyChildren(true)
                          setRowIndex(row?.index)
                          setIndexHierarchyRow(row?.index)
                        }}
                      >
                        {t('orderDetail:table.enter_product_variant_qty')}
                      </button>
                    </div>
                  )}
                </div>
              )
            }}
          />
        ),
        meta: {
          cellClassName: 'ui-w-1/4',
        },
      },
      {
        accessorKey: 'stock_vendor.available_stock',
        header: t('orderDetail:table.column.total_available_stock'),
        cell: ({ row }) => {
          const stockVendor = row.original.stock_vendor
          return (
            <div className="ui-space-y-1">
              <div>
                {numberFormatter(
                  stockVendor?.total_available_qty,
                  i18n.language
                )}
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
    ],
    [data, order_items, errors]
  )

  const handleSubmitForm = (
    values: OrderDetailConfirmDrawerHierarchyFormValues
  ) => {
    clearErrors()
    onSubmit(values)
    setOpenConfirmModalForm(true)
  }

  const handleClose = () => {
    reset(defaultValues)
    setOpenConfirmDrawerForm(false)
  }

  return (
    <>
      <OrderDetailDrawer
        key={data?.order_items?.length}
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
      <OrderDetailConfirmHierarchyChildrenModalForm
        errors={errors}
        key={`${rowIndex}_${data?.order_items?.length}`}
        indexRow={rowIndex}
        children={{ children: order_items?.[rowIndex ?? 0]?.children }}
        onSubmit={(modalData) => {
          setValue(`order_items.${rowIndex ?? 0}.children`, modalData?.children)
          setValue(
            `order_items.${rowIndex ?? 0}.confirmed_qty`,
            modalData?.children?.reduce(
              (acc, child) => acc + (child.confirmed_qty ?? 0),
              0
            )
          )

          setOpenModalConfirmHierarchyChildren(false)
        }}
      />
    </>
  )
}

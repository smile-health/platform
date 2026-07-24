import { useEffect, useMemo } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '#components/data-table'
import { FormErrorMessage } from '#components/form-control'
import { InputNumberV2 } from '#components/input-number-v2'
import { numberFormatter } from '#utils/formatter'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { OrderDetailConfirmHierarchyChildrenModalFormSchema } from '../../order-detail.schema'
import useOrderDetailStore from '../../order-detail.store'
import {
  OrderDetailChildren,
  UpdateOrderHierarchyStatusToConfirmResponseError,
} from '../../order-detail.type'
import { OrderDetailModal } from '../OrderDetailModal'

type OrderDetailConfirmHierarchyChildrenModalFormProps = {
  isLoading?: boolean
  onSubmit: (values?: { children: OrderDetailChildren[] }) => void
  errors?: UpdateOrderHierarchyStatusToConfirmResponseError
  children?: { children?: OrderDetailChildren[] }
  indexRow?: number
}

export const OrderDetailConfirmHierarchyChildrenModalForm = ({
  onSubmit,
  children,
  indexRow,
  errors,
  isLoading,
}: OrderDetailConfirmHierarchyChildrenModalFormProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'orderDetail'])

  const {
    data,
    setOpenModalConfirmHierarchyChildren,
    isOpenModalConfirmHierarchyChildren,
  } = useOrderDetailStore()

  const defaultValues = {
    children: children?.children,
  }

  const {
    control,
    handleSubmit,
    trigger,
    reset,
    setValue,
    setError,
    clearErrors,
  } = useForm<{
    children: OrderDetailChildren[]
  }>({
    defaultValues,
    resolver: yupResolver(
      OrderDetailConfirmHierarchyChildrenModalFormSchema(
        t,
        language,
        data?.order_items?.[Number(indexRow ?? null)]
      )
    ),
  })

  const columns: ColumnDef<OrderDetailChildren>[] = useMemo(
    () => [
      {
        accessorKey: 'material.name',
        header: t('orderDetail:table.column.product_variant'),
        size: 150,
        cell: ({ row }) => row.original?.material?.name,
      },
      {
        accessorKey: 'material.available_stock',
        header: t('orderDetail:table.column.available_stock_at', {
          name: data?.activity?.name,
        }),
        size: 50,
        cell: ({ row }) =>
          numberFormatter(
            row.original?.stock_vendor?.total_available_qty_activity ?? 0,
            language
          ),
      },
      {
        accessorKey: 'confirmed_qty',
        header: t('orderDetail:table.column.confirmed'),
        minSize: 250,
        cell: ({ row }) => (
          <Controller
            name={`children.${row.index}.confirmed_qty`}
            control={control}
            render={({ field: { name, onChange }, fieldState }) => {
              return (
                <div className="space-y-1">
                  <InputNumberV2
                    name={name}
                    key={indexRow}
                    id={name}
                    placeholder={t(
                      'orderDetail:form.confirmed_qty.placeholder'
                    )}
                    value={row.original?.confirmed_qty ?? undefined}
                    className="ui-text-sm ui-w-full"
                    onValueChange={(e) => {
                      onChange(e.floatValue)
                      setValue(`children.${row.index}`, {
                        ...row.original,
                        confirmed_qty: e.floatValue,
                      })
                      trigger(`children.${row.index}.confirmed_qty`)
                    }}
                    error={Boolean(fieldState.error)}
                  />
                  {fieldState.error && (
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
          cellClassName: 'ui-w-1/4',
        },
      },
    ],
    [
      indexRow,
      children?.children?.[Number(indexRow ?? null)]?.material?.id,
      data?.order_items?.length,
    ]
  )

  const handleSubmitForm = (values: { children: OrderDetailChildren[] }) => {
    onSubmit(values)
    setOpenModalConfirmHierarchyChildren(false)
    clearErrors('children')
  }

  const handleClose = () => {
    reset(defaultValues)
    setOpenModalConfirmHierarchyChildren(false)
    clearErrors('children')
  }

  useEffect(() => {
    if (errors?.order_items && indexRow !== null && indexRow !== undefined) {
      const parentItemErrors = errors.order_items[indexRow]
      if (parentItemErrors?.children) {
        Object.entries(parentItemErrors.children).forEach(
          ([childIndex, childErrors]) => {
            if (childErrors.material_id) {
              setError(`children.${Number(childIndex)}.confirmed_qty`, {
                message: childErrors.material_id[0],
              })
            }
          }
        )
      }
    }
  }, [errors, indexRow, setError])

  return (
    <OrderDetailModal
      key={`${indexRow}_${data?.order_items?.length}`}
      title={t('orderDetail:modal.confirm_order.trademark_popup.title')}
      open={isOpenModalConfirmHierarchyChildren}
      onClose={handleClose}
      onSubmit={handleSubmit(handleSubmitForm)}
      isLoading={isLoading}
      submitButton={{
        label: t('orderDetail:modal.confirm_order.trademark_popup.button.save'),
        disabled: false,
      }}
      withCancelButton={false}
      size="xl"
    >
      <div className="ui-flex ui-flex-col">
        <div className="ui-text-sm ui-text-neutral-500">
          {t('orderDetail:modal.confirm_order.product_template')}:
        </div>
        <div className="ui-font-bold ui-text-dark-blue">
          {data?.order_items?.[Number(indexRow ?? null)].material.name}
        </div>
      </div>
      <DataTable columns={columns} data={defaultValues.children} />
    </OrderDetailModal>
  )
}

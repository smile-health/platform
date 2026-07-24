// ReceiveOrderItemsDrawerFormHierarchy.tsx
import { useCallback, useEffect, useMemo, useState } from 'react'
import { PlusIcon } from '@heroicons/react/24/solid'
import { yupResolver } from '@hookform/resolvers/yup'
import { ColumnDef, Row } from '@tanstack/react-table'
import { Button } from '#components/button'
import { DataTable } from '#components/data-table'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { OptionType, ReactSelectAsync } from '#components/react-select'
import { Stock } from '#types/stock'
import { numberFormatter } from '#utils/formatter'
import dayjs from 'dayjs'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { loadMaterialStatus } from '../../../OrderCreateReturn/order-create-return.service'
import { OrderDetailDrawer } from '../../components'
import { orderItemSchema } from '../../order-detail-hierarchy.schema'
import useOrderDetailStore from '../../order-detail.store'
import {
  OrderDetailChildren,
  OrderDetailItem,
  OrderDetailResponse,
  OrderDetailStock,
} from '../../order-detail.type'
import { ReceiveOrderItemsModalFormHierarchyValues } from './ReceiveOrderItemsModalFormHierarchy'

export type ReceiveOrderItemStocks = {
  stock_id: number
  received_qty?: number
  fulfill_stock_status_id: OptionType | null
  _order_item_children?: OrderDetailChildren
  _order_stock?: OrderDetailStock
  _vendor_stock?: Stock
  _customer_stock?: Stock
  _customer: OrderDetailResponse['customer']
  _vendor: OrderDetailResponse['vendor']
  _activity: OrderDetailResponse['activity']
}

export type ReceiveOrderItemChildren = {
  id: number | undefined
  receives?: Array<ReceiveOrderItemStocks>
  _order_item_children?: OrderDetailChildren
  _vendor_stock?: Stock
  _customer_stock?: Stock
  _customer: OrderDetailResponse['customer']
  _vendor: OrderDetailResponse['vendor']
  _activity: OrderDetailResponse['activity']
}

export type ReceiveOrderItemsDrawerFormHierarchyValues = {
  id: number | undefined
  children?: Array<ReceiveOrderItemChildren>
  _order_item?: OrderDetailItem
  _vendor_stock?: Stock
  _customer_stock?: Stock
  _customer: OrderDetailResponse['customer']
  _vendor: OrderDetailResponse['vendor']
  _activity: OrderDetailResponse['activity']
}

type ReceiveOrderItemsDrawerFormHierarchyProps = {
  isOpen: boolean
  selectedRow?: Row<ReceiveOrderItemsDrawerFormHierarchyValues>
  isLoading?: boolean
  onClose: () => void
  onSubmit: (
    values: ReceiveOrderItemsDrawerFormHierarchyValues,
    rowIndex?: number
  ) => void
}

export const ReceiveOrderItemsDrawerFormHierarchy = ({
  isOpen,
  selectedRow,
  isLoading,
  onClose,
  onSubmit,
}: ReceiveOrderItemsDrawerFormHierarchyProps) => {
  const { t, i18n } = useTranslation(['common', 'orderDetail'])
  const [rowRenderToggles, setRowRenderToggles] = useState<number>(0)

  const rowIndex = selectedRow?.index
  const orderItem = selectedRow?.original

  const {
    watch,
    reset,
    control,
    trigger,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<ReceiveOrderItemsDrawerFormHierarchyValues>({
    resolver: yupResolver(
      orderItemSchema(t, i18n?.language, orderItem?._order_item?.material)
    ),
    mode: 'onChange',
    defaultValues: selectedRow?.original,
  })

  const tableData = selectedRow?.original?.children ?? []

  const handleDefaultValues = useCallback(() => {
    if (orderItem) {
      reset(orderItem)
    }
  }, [orderItem, reset])

  const onReset = () => {
    const currentChildren = watch('children')
    currentChildren?.forEach((child, childIndex) => {
      child.receives?.forEach((_, receiveIndex) => {
        setValue(
          `children.${childIndex}.receives.${receiveIndex}.received_qty`,
          undefined
        )
        setValue(
          `children.${childIndex}.receives.${receiveIndex}.fulfill_stock_status_id`,
          undefined
        )
      })
    })
    reset({
      id: orderItem?.id,
      children: currentChildren,
      _order_item: orderItem?._order_item,
      _vendor_stock: orderItem?._vendor_stock,
      _customer_stock: orderItem?._customer_stock,
      _customer: orderItem?._customer,
      _vendor: orderItem?._vendor,
      _activity: orderItem?._activity,
    })
  }

  const handleClose = () => {
    toggleRowRender()
    onClose()
  }

  const handleSubmitForm = async (
    values: ReceiveOrderItemsDrawerFormHierarchyValues
  ) => {
    const isValid = await trigger('children')
    if (!isValid) return

    onSubmit(values, rowIndex)
    onClose()
  }

  const toggleRowRender = () => {
    setRowRenderToggles((prev) => prev + 1)
  }

  const handleOrderItemStockSubmit = (
    values: ReceiveOrderItemsModalFormHierarchyValues,
    rowIndex: number
  ) => {
    setValue(`children.${rowIndex}.receives`, values?.receives)
    trigger(`children.${rowIndex}.receives`)
  }

  const { setIsReceiveOrderItemsModalForm } = useOrderDetailStore()

  const renderActionColumn = useCallback(
    (row: Row<any>) => {
      const currentChildren = watch('children')
      const childIndex = row.index
      const isManagedInBatch =
        currentChildren?.[childIndex]?._order_item_children?.material
          ?.is_managed_in_batch

      const receives = currentChildren?.[childIndex]?.receives

      const filledReceiveItems = receives?.filter(
        (item) => Number(item.received_qty) > 0
      )
      const isFilled = (filledReceiveItems?.length ?? 0) > 0

      const hasError = errors?.children?.[childIndex]?.receives?.some?.(
        (item) => item?.received_qty?.message
      )

      return (
        <div key={`${rowRenderToggles}-${childIndex}`} className="space-y-2">
          {currentChildren?.[childIndex]?.receives && (
            <div className="space-y-2">
              {filledReceiveItems?.map((item) => {
                const receiveIndex =
                  receives?.findIndex((r) => r.stock_id === item.stock_id) ?? -1
                const hasItemError = Boolean(
                  errors?.children?.[childIndex]?.receives?.[receiveIndex]
                    ?.fulfill_stock_status_id
                )
                const heightClass = isManagedInBatch
                  ? hasItemError
                    ? 'ui-h-[120px]'
                    : 'ui-h-24'
                  : hasItemError
                    ? 'ui-h-[72px]'
                    : 'ui-h-12'

                return (
                  <div
                    key={item.stock_id}
                    className={`ui-text-sm ui-flex ui-flex-col ui-justify-center ${heightClass}`}
                  >
                    {Boolean(
                      item?._order_item_children?.material?.is_managed_in_batch
                    ) && (
                      <>
                        <div>
                          {t('orderDetail:data.batch_code')}:{' '}
                          {item._order_stock?.batch?.code ?? '-'}
                        </div>
                        <div>
                          {t('orderDetail:data.expired_date')}:{' '}
                          {dayjs(item._order_stock?.batch?.expired_date)
                            .format('DD MMM YYYY')
                            .toUpperCase()}
                        </div>
                      </>
                    )}
                    <div>
                      {t('orderDetail:data.stock_from_activity')}:{' '}
                      {item._order_stock?.activity_name}
                    </div>
                    <div className="ui-font-semibold">
                      Qty: {numberFormatter(item.received_qty, i18n.language)}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="ui-space-y-1">
            <Button
              size="sm"
              type="button"
              leftIcon={<PlusIcon className="ui-w-5 ui-text-dark-blue" />}
              variant="outline"
              onClick={() => {
                setIsReceiveOrderItemsModalForm(true, {
                  onSubmit: handleOrderItemStockSubmit,
                  data: currentChildren?.[childIndex]?.receives ?? [],
                  stockIndex: childIndex,
                  isOpenModal: true,
                  material:
                    currentChildren?.[childIndex]._order_item_children?.material
                      ?.name,
                  activity: currentChildren?.[childIndex]._activity?.name,
                  stock_on_hand:
                    orderItem?._order_item?.stock_customer?.total_qty,
                  available_stock:
                    orderItem?._vendor_stock?.total_available_qty,
                })
              }}
            >
              {isFilled
                ? isManagedInBatch
                  ? t('orderDetail:button.update_batch_quantity')
                  : t('orderDetail:button.update_quantity')
                : isManagedInBatch
                  ? t('orderDetail:button.batch_quantity')
                  : t('orderDetail:button.quantity')}
            </Button>
            {hasError && (
              <FormErrorMessage>
                {
                  errors?.children?.[childIndex]?.receives?.find?.(
                    (item) => item?.received_qty?.message
                  )?.received_qty?.message
                }
              </FormErrorMessage>
            )}
          </div>
        </div>
      )
    },
    [tableData, errors, rowIndex]
  )

  const columns: ColumnDef<any>[] = useMemo(
    () => [
      {
        accessorKey: 'trademark_material',
        header: t('orderDetail:table.column.trademark_material'),
        cell: ({ row }) => {
          return row?.original?._order_item_children?.material?.name ?? '-'
        },
        size: 400,
        minSize: 400,
      },
      {
        accessorKey: 'shipped',
        header: t('orderDetail:table.column.shipped'),
        size: 100,
        cell: ({ row }) =>
          numberFormatter(
            row?.original?._order_item_children?.shipped_qty,
            i18n.language
          ) ?? '-',
      },
      {
        accessorKey: 'received_qty',
        header: t('orderDetail:table.column.received'),
        size: 200,
        cell: ({ row }) => renderActionColumn(row),
      },
      {
        accessorKey: 'fulfill_stock_status_id',
        header: t('orderDetail:table.column.material_status'),
        size: 150,
        meta: {
          hidden: !orderItem?._order_item?.material?.is_temperature_sensitive,
        },
        cell: ({ row }) => {
          const currentChildren = watch('children')
          const childIndex = row.index
          const receives = currentChildren?.[childIndex]?.receives

          const filledReceiveItems = receives?.filter(
            (item) => Number(item.received_qty) > 0
          )

          return (
            <div className="space-y-2">
              {filledReceiveItems?.map((item) => {
                const receiveIndex =
                  receives?.findIndex((r) => r.stock_id === item.stock_id) ?? -1
                if (receiveIndex === -1) return null

                const error =
                  errors?.children?.[childIndex]?.receives?.[receiveIndex]
                    ?.fulfill_stock_status_id

                const isManagedInBatch = Boolean(
                  item?._order_item_children?.material?.is_managed_in_batch
                )
                const heightClass = isManagedInBatch
                  ? error
                    ? 'ui-h-[120px]'
                    : 'ui-h-24'
                  : error
                    ? 'ui-h-[72px]'
                    : 'ui-h-12'

                return (
                  <div
                    key={`container-${item.stock_id}`}
                    className={`ui-flex ui-flex-col ui-justify-center ${heightClass}`}
                  >
                    <Controller
                      control={control}
                      key={`children.${childIndex}.receives.${receiveIndex}.fulfill_stock_status_id`}
                      name={`children.${childIndex}.receives.${receiveIndex}.fulfill_stock_status_id`}
                      render={({ field }) => {
                        return (
                          <div className="space-y-1">
                            <ReactSelectAsync
                              id={`fulfill_stock_status_id_${childIndex}_${receiveIndex}`}
                              className="ui-text-sm"
                              placeholder={t(
                                'orderDetail:form.material_status.placeholder'
                              )}
                              isClearable
                              value={watch(
                                `children.${childIndex}.receives.${receiveIndex}.fulfill_stock_status_id`
                              )}
                              menuPosition="fixed"
                              onChange={(option: OptionType) => {
                                field.onChange(option)
                                setValue(
                                  `children.${childIndex}.receives.${receiveIndex}.fulfill_stock_status_id`,
                                  option
                                )
                                trigger(
                                  `children.${childIndex}.receives.${receiveIndex}.fulfill_stock_status_id`
                                )
                              }}
                              loadOptions={loadMaterialStatus}
                              additional={{
                                page: 1,
                              }}
                              error={!!error}
                            />
                            {error?.message && (
                              <FormErrorMessage>
                                {error.message}
                              </FormErrorMessage>
                            )}
                          </div>
                        )
                      }}
                    />
                  </div>
                )
              })}
            </div>
          )
        },
      },
    ],
    [watch, i18n.language, orderItem, onReset, errors]
  )
  useEffect(() => {
    handleDefaultValues()
  }, [orderItem])

  return (
    <OrderDetailDrawer
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
      disabled={Boolean(errors.children)}
    >
      <div className="ui-grid ui-grid-cols-3 ui-gap-10">
        <FormControl className="ui-space-y-1">
          <FormLabel className="text-sm">
            {t('orderDetail:table.trademark.column.material_active_substance')}
          </FormLabel>
          <div className="ui-text-dark-blue ui-font-bold">
            {orderItem?._order_item?.material.name}
          </div>
        </FormControl>
        <FormControl className="ui-space-y-1">
          <FormLabel className="text-sm">
            {t('orderDetail:table.trademark.column.stock_on_hand_at', {
              name: orderItem?._customer?.name,
            })}
          </FormLabel>
          <div className="ui-text-dark-blue ui-font-bold">
            {numberFormatter(
              orderItem?._order_item?.stock_customer?.total_qty,
              i18n.language
            )}
            <span className="ui-text-gray-500 ui-font-normal ui-text-sm">
              {' '}
              (min:{' '}
              {numberFormatter(
                orderItem?._order_item?.stock_customer?.min,
                i18n.language
              )}
              , max:{' '}
              {numberFormatter(
                orderItem?._order_item?.stock_customer?.max || 0,
                i18n.language
              )}
              )
            </span>
          </div>
        </FormControl>
        <FormControl className="ui-space-y-1">
          <FormLabel className="text-sm">
            {t('orderDetail:table.trademark.column.available_stock_at', {
              name: orderItem?._vendor?.name,
            })}
          </FormLabel>
          <div className="ui-text-dark-blue ui-font-bold">
            {numberFormatter(
              orderItem?._vendor_stock?.total_available_qty,
              i18n.language
            )}
            <span className="ui-text-gray-500 ui-font-normal ui-text-sm">
              {' '}
              (min:{' '}
              {numberFormatter(orderItem?._vendor_stock?.min, i18n.language)},
              max:{' '}
              {numberFormatter(
                orderItem?._vendor_stock?.max || 0,
                i18n.language
              )}
              )
            </span>
          </div>
        </FormControl>
      </div>

      <div>
        <DataTable
          data={tableData}
          columns={columns}
          isSticky
          className="ui-overflow-y-auto ui-max-h-[50vh] ui-bg-white"
        />
      </div>
    </OrderDetailDrawer>
  )
}

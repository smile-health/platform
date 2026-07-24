import { useCallback, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { PlusIcon } from '@heroicons/react/24/solid'
import { yupResolver } from '@hookform/resolvers/yup'
import { useQuery } from '@tanstack/react-query'
import { ColumnDef, Row } from '@tanstack/react-table'
import { DataTable } from '#components/data-table'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { InputNumber } from '#components/input-number'
import {
  OptionType,
  OptionTypeWithData,
  ReactSelect,
  ReactSelectAsync,
} from '#components/react-select'
import { listStockDetailStock } from '#services/stock'
import { DetailStock } from '#types/stock'
import { numberFormatter } from '#utils/formatter'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { loadMaterialStatus } from '../../../OrderCreateReturn/order-create-return.service'
import { orderDetailAllocateModalFormSchema } from '../../order-detail.schema'
import useOrderDetailStore from '../../order-detail.store'
import {
  OrderDetailAllocateFormValues,
  OrderDetailAllocateFormValuesOrderItem,
  OrderDetailAllocateFormValuesOrderItemAllocation,
} from '../../order-detail.type'
import { OrderDetailModal } from '../OrderDetailModal'

export type OrderDetailAllocateModalFormValues =
  OrderDetailAllocateFormValuesOrderItem
export type OrderDetailAllocateModalFormValuesAllocation =
  OrderDetailAllocateFormValuesOrderItemAllocation

export type OrderDetailAllocateModalFormProps = {
  values: OrderDetailAllocateFormValues['order_items']
  onSubmit: (
    values: OrderDetailAllocateModalFormValues,
    rowIndex?: number
  ) => void
  isLoading?: boolean
}

export const OrderDetailAllocateModalForm = ({
  values: parentFormValues,
  onSubmit = () => {},
  isLoading = false,
}: OrderDetailAllocateModalFormProps) => {
  const params = useParams()
  const { t, i18n } = useTranslation(['common', 'orderDetail'])

  const {
    data: orderDetailData,
    isOpenAllocateModalForm,
    setOpenAllocateModalForm,
    allocateFormSelectedRow: selectedRow,
    mappedOrderItem,
  } = useOrderDetailStore()

  const orderId = params?.id as string

  const selectedRowIndex = selectedRow?.index as number
  const selectedRowData = selectedRow?.original
  const selectedRowVendorStock = selectedRowData?.vendor_stock
  const selectedRowCustomerStock = selectedRowData?.order_item?.stock_customer
  const isSelectedRowManagedInBatch = Boolean(
    selectedRowVendorStock?.material?.is_managed_in_batch
  )

  const {
    control,
    watch,
    handleSubmit,
    reset,
    trigger,
    setValue,
    clearErrors,
    formState: { isDirty, isValid, errors },
  } = useForm<OrderDetailAllocateModalFormValues>({
    resolver: yupResolver(
      orderDetailAllocateModalFormSchema(
        t,
        i18n.language,
        mappedOrderItem?.[selectedRowIndex]
      )
    ),
    mode: 'onChange',
  })

  const { append } = useFieldArray({ control, name: 'allocations' })

  const formValues = parentFormValues?.find(
    (value) => value.id === selectedRowData?.order_item?.id
  )
  const tableData = watch('allocations') ?? []

  const { data: otherActivityStockOptions, isLoading: isLoadingOtherActivity } =
    useQuery({
      queryKey: ['order', 'detail', orderId, 'allocate', 'other-activity'],
      queryFn: () => {
        return listStockDetailStock({
          entity_id: orderDetailData?.vendor_id,
          material_id: selectedRowData?.order_item?.material.id,
          only_have_qty: 1,
          activity_id: orderDetailData?.activity.id,
          group_by: 'activity',
        })
      },
      enabled: Boolean(
        orderDetailData &&
        selectedRowData &&
        (!isSelectedRowManagedInBatch ||
          (isSelectedRowManagedInBatch &&
            selectedRowVendorStock?.details?.length))
      ),
      retry: false,
      select: (response) => {
        return response?.data
          .filter((stock) => {
            const isStockOnVendorDetails =
              isSelectedRowManagedInBatch &&
              Boolean(
                selectedRowVendorStock?.details?.filter(
                  (detail) => detail?.activity?.id === stock?.activity?.id
                ).length
              )

            return !isStockOnVendorDetails
          })
          .map((stock) => ({
            label: stock.activity?.name,
            value: stock.activity?.id,
            data: stock,
          }))
      },
      refetchOnWindowFocus: false,
    })

  const renderAllocatedQtyColumn = (
    row: Row<OrderDetailAllocateModalFormValuesAllocation>
  ) => (
    <Controller
      key={`allocations.${row.index}.allocated_qty`}
      name={`allocations.${row.index}.allocated_qty`}
      control={control}
      render={({ field, fieldState }) => (
        <div className="space-y-1">
          <InputNumber
            hideStepper
            name={field.name}
            id={field.name}
            aria-label={field.name}
            placeholder={t('orderDetail:form.confirmed_qty.placeholder')}
            value={field?.value ?? undefined}
            minValue={0}
            className="ui-text-sm"
            onChange={(value) => {
              field.onChange(Number.isNaN(value) ? null : value)
              trigger('allocations')
            }}
            error={Boolean(fieldState.error)}
          />
          {fieldState.error && (
            <FormErrorMessage>{fieldState.error?.message}</FormErrorMessage>
          )}
        </div>
      )}
    />
  )

  const renderStockStatusColumn = (
    row: Row<OrderDetailAllocateModalFormValuesAllocation>
  ) => (
    <Controller
      control={control}
      key={`allocations.${row.index}.order_stock_status_id`}
      name={`allocations.${row.index}.order_stock_status_id`}
      render={({ field, fieldState }) => {
        return (
          <div className="space-y-1">
            <ReactSelectAsync
              id={`order_stock_status_${row.index}`}
              className="ui-text-sm"
              placeholder={t('orderDetail:form.material_status.placeholder')}
              isClearable
              value={field.value as OptionType}
              menuPosition="fixed"
              onChange={(option: OptionType) => {
                field.onChange(option)
                trigger(`allocations.${row.index}`)
              }}
              loadOptions={loadMaterialStatus}
              additional={{
                page: 1,
              }}
              error={!!fieldState.error?.message}
            />
            {fieldState.error?.message && (
              <FormErrorMessage>{fieldState.error?.message}</FormErrorMessage>
            )}
          </div>
        )
      }}
    />
  )

  const columns: ColumnDef<OrderDetailAllocateModalFormValuesAllocation>[] =
    useMemo(
      () => [
        {
          header: t('orderDetail:table.column.si_number'),
          cell: ({ row }) => row.index + 1,
        },
        {
          accessorKey: 'batch_info',
          header: t('orderDetail:table.column.batch_info'),
          cell: ({ row }) =>
            row.original?._stock_of_detail_stock?.batch?.code ?? '-',
        },
        {
          accessorKey: 'activity_name',
          header: t('orderDetail:table.column.activity'),
          cell: ({ row }) =>
            row.original?._stock_of_detail_stock?.activity?.name ?? '-',
        },
        {
          accessorKey: 'stock_on_hand',
          header: t('orderDetail:table.column.stock_on_hand'),
          cell: ({ row }) => {
            const value = row.original?._stock_of_detail_stock?.qty
            return numberFormatter(value, i18n.language)
          },
        },
        {
          accessorKey: 'available_stock',
          header: t('orderDetail:table.column.available_stock'),
          cell: ({ row }) => {
            const value = row.original?._stock_of_detail_stock?.available_qty
            return numberFormatter(value, i18n.language)
          },
        },
        {
          accessorKey: 'allocated_qty',
          header: t('orderDetail:table.column.quantity'),
          cell: ({ row }) => renderAllocatedQtyColumn(row),
        },
        {
          accessorKey: 'order_stock_status_id',
          header: t('orderDetail:table.column.material_status'),
          cell: ({ row }) => renderStockStatusColumn(row),
          meta: {
            hidden: !selectedRowVendorStock?.material?.is_temperature_sensitive,
          },
        },
      ],
      [isOpenAllocateModalForm, watch, i18n.language]
    )

  const handleSubmitForm = (values: OrderDetailAllocateModalFormValues) => {
    onSubmit(values, selectedRow?.index)
    setOpenAllocateModalForm(false)
  }

  const handleClose = () => {
    setValue('allocations', [])
    reset({
      allocations: [],
    })
    setOpenAllocateModalForm(false)
  }

  const handleSelectStockFromOtherActivities = useCallback(
    (option: OptionTypeWithData<DetailStock> | null) => {
      const allocations = option?.data?.stocks?.map((activityStock) => ({
        _stock_of_detail_stock: activityStock,
        stock_id: activityStock.id,
        allocated_qty: null,
        order_stock_status_id: null,
      }))

      if (allocations) {
        append(allocations)
        clearErrors('allocations')
      }
    },
    [append, clearErrors]
  )

  useEffect(() => {
    if (isOpenAllocateModalForm) {
      const getAllocationsDefaultValue = () => {
        if (!isSelectedRowManagedInBatch) return formValues?.allocations ?? []

        if (
          isSelectedRowManagedInBatch === true &&
          selectedRowVendorStock?.details
        ) {
          return selectedRowVendorStock.details
            .map((stockDetail) => stockDetail.stocks)
            .flat()
            .map((stockOfDetailStock) => ({
              _stock_of_detail_stock: stockOfDetailStock,
              stock_id: stockOfDetailStock.id,
            }))
        }

        return []
      }

      setValue('id', selectedRowData?.order_item?.id)
      setValue('allocations', getAllocationsDefaultValue())
    }
  }, [
    selectedRowData,
    isOpenAllocateModalForm,
    isSelectedRowManagedInBatch,
    selectedRowVendorStock,
    formValues,
    setValue,
  ])

  useEffect(() => {
    if (otherActivityStockOptions?.length) {
      otherActivityStockOptions.forEach((option) => {
        const activity = orderDetailData?.activity

        if (option.value === activity?.id) {
          handleSelectStockFromOtherActivities(
            option as OptionTypeWithData<DetailStock>
          )
        }
      })
    }
  }, [
    isOpenAllocateModalForm,
    otherActivityStockOptions,
    isLoadingOtherActivity,
    orderDetailData,
    handleSelectStockFromOtherActivities,
  ])

  return (
    <OrderDetailModal
      size="2xl"
      title={
        isSelectedRowManagedInBatch
          ? t('orderDetail:modal.allocate.title_batch')
          : t('orderDetail:modal.allocate.title_non_batch')
      }
      open={isOpenAllocateModalForm}
      onClose={handleClose}
      onSubmit={handleSubmit(handleSubmitForm)}
      isLoading={isLoading}
      error={errors?.allocations?.root?.message ?? errors?.allocations?.message}
      submitButton={{
        label: t('common:save'),
        disabled:
          (isLoading && isDirty && !isValid) || Boolean(errors.allocations),
      }}
    >
      <div className="ui-grid ui-grid-cols-[100px_100px_1fr_1fr] ui-gap-10">
        <FormControl className="ui-space-y-1">
          <FormLabel className="text-sm">Material</FormLabel>
          <div className="ui-text-dark-blue ui-font-bold">
            {selectedRowData?.order_item?.material.name}
          </div>
        </FormControl>
        <FormControl className="ui-space-y-1">
          <FormLabel className="text-sm">
            {t('orderDetail:table.column.confirmed')}
          </FormLabel>
          <div className="ui-text-dark-blue ui-font-bold">
            {selectedRowData?.order_item?.confirmed_qty}
          </div>
        </FormControl>
        <FormControl className="ui-space-y-1">
          <FormLabel className="text-sm">
            {t('orderDetail:table.column.stock_on_hand')}{' '}
            {t('common:at').toLowerCase()} {orderDetailData?.customer?.name}
          </FormLabel>
          <div className="ui-text-dark-blue ui-font-bold ui-flex ui-items-baseline ui-gap-1">
            {numberFormatter(
              selectedRowCustomerStock?.total_qty,
              i18n.language
            )}
            <div className="ui-text-gray-500 ui-font-normal ui-text-xs ui-relative ui-bottom-0.5">
              (min:{' '}
              {numberFormatter(selectedRowCustomerStock?.min, i18n.language)} ,
              max:{' '}
              {numberFormatter(selectedRowCustomerStock?.max, i18n.language)})
            </div>
          </div>
        </FormControl>
        <FormControl className="ui-space-y-1">
          <FormLabel className="text-sm">
            {t('orderDetail:table.column.available_stock')}{' '}
            {t('common:at').toLowerCase()} {orderDetailData?.vendor?.name}
          </FormLabel>
          {selectedRowVendorStock ? (
            <div className="ui-text-dark-blue ui-font-bold ui-flex ui-items-baseline ui-gap-1">
              {numberFormatter(
                selectedRowVendorStock?.total_qty,
                i18n.language
              )}
              <div className="ui-text-gray-500 ui-font-normal ui-text-xs ui-relative ui-bottom-0.5">
                (min:{' '}
                {numberFormatter(selectedRowVendorStock?.min, i18n.language)} ,
                max:{' '}
                {numberFormatter(selectedRowVendorStock?.max, i18n.language)}),{' '}
                {t('orderDetail:table.column.stock_on_hand')}:{' '}
                {numberFormatter(
                  selectedRowVendorStock?.total_available_qty,
                  i18n.language
                )}
              </div>
            </div>
          ) : (
            '-'
          )}
        </FormControl>
      </div>

      <div>
        <DataTable
          columns={columns}
          data={tableData}
          isSticky
          isLoading={!isSelectedRowManagedInBatch && isLoadingOtherActivity}
          className="ui-overflow-y-auto ui-max-h-[50vh]"
        />
      </div>

      <div className="ui-flex ui-items-center ui-gap-4">
        <div className="ui-text-dark-blue ui-flex ui-items-center ui-gap-2">
          <PlusIcon className="ui-w-5" />
          {t('orderDetail:modal.allocate.add_stock_from_other_activity')}:
        </div>
        <ReactSelect
          id="select-other-activity"
          placeholder={t('common:select_activity')}
          options={otherActivityStockOptions?.filter((option) => {
            return tableData?.every(
              (allocation) =>
                allocation._stock_of_detail_stock?.activity.id !== option.value
            )
          })}
          isLoading={isLoadingOtherActivity}
          disabled={isLoadingOtherActivity}
          value={null}
          onChange={handleSelectStockFromOtherActivities}
          menuPosition="fixed"
          className="ui-w-[250px] ui-max-w-full"
        />
      </div>
    </OrderDetailModal>
  )
}

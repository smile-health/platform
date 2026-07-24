import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { PlusIcon } from '@heroicons/react/24/solid'
import { yupResolver } from '@hookform/resolvers/yup'
import { useQuery } from '@tanstack/react-query'
import { ColumnDef, Row } from '@tanstack/react-table'
import { Button } from '#components/button'
import { DataTable } from '#components/data-table'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import {
  OptionType,
  OptionTypeWithData,
  ReactSelect,
  ReactSelectAsync,
} from '#components/react-select'
import { ProgramEnum } from '#constants/program'
import { listStockDetailStock } from '#services/stock'
import { DetailStock } from '#types/stock'
import { parseDateTime } from '#utils/date'
import { numberFormatter } from '#utils/formatter'
import { getProgramStorage } from '#utils/storage/program'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { loadMaterialStatus } from '../../../OrderCreateReturn/order-create-return.service'
import { orderDetailAllocateModalHierarchyFormSchema } from '../../order-detail-hierarchy.schema'
import useOrderDetailStore from '../../order-detail.store'
import { OrderDetailAllocateHierarchyFormValues } from '../../order-detail.type'
import { OrderDetailModal } from '../OrderDetailModal'
import {
  ChildrenProps,
  OrderDetailAllocateModalFormHierarchyCustomRow,
} from './OrderDetailAllocateModalFormHierarchyCustomRow'

export type OrderDetailAllocateModalFormValues =
  OrderDetailAllocateHierarchyFormValues['order_items'][number]
export type OrderDetailAllocateModalFormValuesHierarchyAllocation =
  OrderDetailAllocateHierarchyFormValues['order_items'][number]['children']

export type OrderDetailAllocateModalFormHierarchyProps = {
  values: OrderDetailAllocateHierarchyFormValues['order_items'][number]
  childIndex: number
  onSubmit: (
    values: OrderDetailAllocateModalFormValues,
    rowIndex?: number
  ) => void
  isLoading?: boolean
}

export const OrderDetailAllocateModalFormHierarchy = ({
  values: parentFormValues,
  childIndex,
  onSubmit = () => {},
  isLoading = false,
}: OrderDetailAllocateModalFormHierarchyProps) => {
  const params = useParams()
  const { t, i18n } = useTranslation(['common', 'orderDetail'])
  const {
    data: orderDetailData,
    isOpenAllocateModalForm,
    setOpenAllocateModalForm,
    allocateFormSelectedRow: selectedRow,
  } = useOrderDetailStore()

  const program = getProgramStorage()
  const isImmunization = program?.key === ProgramEnum.Immunization

  const orderId = params?.id as string

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
    trigger,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<OrderDetailAllocateModalFormValues>({
    resolver: yupResolver(
      orderDetailAllocateModalHierarchyFormSchema(t, i18n.language, isImmunization)
    ),
    mode: 'onChange',
    defaultValues: parentFormValues,
  })

  const { children } = watch()
  const formValues = parentFormValues?.children?.find(
    (value) =>
      value.child_id === selectedRowData?.order_item?.children?.[childIndex]?.id
  )

  const tableData = children ?? []

  const { data: otherActivityStockOptions, isLoading: isLoadingOtherActivity } =
    useQuery({
      queryKey: ['order', 'detail', orderId, 'allocate', 'other-activity'],
      queryFn: () => {
        return listStockDetailStock({
          entity_id: orderDetailData?.vendor_id,
          ...(!selectedRowData?.order_item?.children?.length
            ? {
                parent_material_id: selectedRowData?.order_item?.material.id,
              }
            : {
                material_id: selectedRowData?.order_item?.children
                  ?.map((child) => child?.material?.id)
                  ?.join(','),
              }),
          group_by: 'activity_material',
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
          .filter(
            (stock) =>
              stock?.activity?.id !== selectedRowVendorStock?.activity?.id
          )
          .map((stock) => {
            const mappedDetailStocks =
              stock?.details?.map((item) => item?.stocks).flat() ?? []

            const isZeroStock = mappedDetailStocks?.length === 0

            return {
              label: isZeroStock
                ? `${stock.activity?.name} (${t('orderDetail:text.zero_stock')})`
                : stock.activity?.name,
              value: stock.activity?.id,
              isDisabled: isZeroStock,
              data: stock,
            }
          })
      },
      refetchOnWindowFocus: false,
    })

  const renderActionColumn = useCallback(
    (row: Row<any>) => {
      const currentChildren = getValues('children')
      const filteredAllocations =
        currentChildren?.[row?.index]?.allocations?.filter((value) =>
          Boolean(value?.allocated_qty)
        ) ?? []
      const isFilteredAllocationExist = filteredAllocations.length > 0
      const isBatch =
        Boolean(
          children?.[row?.index]?._child_of_detail_stock?.material
            ?.is_managed_in_batch
        ) ||
        Boolean(
          children?.[row?.index]?._child_detail?.material?.is_managed_in_batch
        )
      const errorMessage = errors?.children?.[row.index]?.allocations
        ?.message as any

      const handleClick = () => {
        row.toggleExpanded()
      }

      return (
        <div className="space-y-2">
          {isFilteredAllocationExist && (
            <div className="space-y-2">
              {filteredAllocations?.map((value) => (
                <div key={value.stock_id} className="ui-text-sm">
                  {Boolean(value?._stock_material?.is_managed_in_batch) && (
                    <>
                      <div>
                        {t('orderDetail:data.batch_code')}:{' '}
                        {value?._stock_detail?.batch?.code ?? '-'}
                      </div>
                      <div>
                        {t('orderDetail:data.expired_date')}:{' '}
                        {parseDateTime(
                          value?._stock_detail?.batch?.expired_date,
                          'DD MMM YYYY'
                        ).toUpperCase() ?? '-'}
                      </div>
                    </>
                  )}
                  <div>
                    {t('orderDetail:data.stock_from_activity')}:{' '}
                    {value?._stock_detail?.activity?.name ?? '-'}
                  </div>
                  <div className="ui-font-semibold">
                    Qty: {numberFormatter(value.allocated_qty, i18n.language)}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="ui-space-y-1">
            <Button
              size="sm"
              type="button"
              leftIcon={
                !isFilteredAllocationExist && (
                  <PlusIcon className="ui-w-5 ui-text-dark-blue" />
                )
              }
              variant="outline"
              onClick={handleClick}
            >
              {!isFilteredAllocationExist &&
                (isBatch
                  ? t('orderDetail:button.batch_quantity')
                  : t('orderDetail:button.quantity'))}
              {isFilteredAllocationExist &&
                (isBatch
                  ? t('orderDetail:button.update_batch_quantity')
                  : t('orderDetail:button.update_quantity'))}
            </Button>

            {errorMessage && (
              <FormErrorMessage>
                {typeof errorMessage === 'string'
                  ? errorMessage
                  : errorMessage?.button}
              </FormErrorMessage>
            )}
          </div>
        </div>
      )
    },
    [children, t, i18n.language, errors?.children, getValues]
  )

  const renderStockStatusColumn = (row: Row<any>) => (
    <Controller
      control={control}
      key={`children.${row.index}.order_stock_status_id`}
      name={`children.${row.index}.order_stock_status_id`}
      render={({ field, fieldState }) => {
        return (
          <div className="space-y-1">
            <ReactSelectAsync
              id={`order_stock_status_${row.index}`}
              className="ui-text-sm"
              placeholder={t('orderDetail:form.material_status.placeholder')}
              isClearable
              value={(field.value as OptionType) ?? undefined}
              menuPosition="fixed"
              onChange={(option: OptionType) => {
                field.onChange(option)
                trigger(`children.${row.index}`)
              }}
              loadOptions={loadMaterialStatus}
              additional={{
                page: 1,
              }}
              disabled={
                !row.original._child_detail?.material?.is_temperature_sensitive
              }
              error={Boolean(fieldState.error)}
            />

            {Boolean(fieldState.error) && (
              <FormErrorMessage>{fieldState.error?.message}</FormErrorMessage>
            )}
          </div>
        )
      }}
    />
  )

  const columns: ColumnDef<ChildrenProps>[] = useMemo(
    () => [
      {
        header: 'No',
        cell: ({ row }) => row?.index + 1,
      },
      {
        accessorKey: 'name',
        header: t('orderDetail:table.column.material_name'),
        size: 180,
        minSize: 180,
        cell: ({ row }) => row.original?._child_detail?.material?.name ?? '-',
      },
      {
        accessorKey: 'ordered_qty',
        header: t('orderDetail:table.column.ordered'),
        cell: ({ row }) => {
          const value = row.original?._child_detail?.ordered_qty ?? 0
          return numberFormatter(value, i18n.language)
        },
      },
      {
        accessorKey: 'confirmed_qty',
        header: t('orderDetail:table.column.confirmed'),
        cell: ({ row }) => {
          const value = row.original?._child_detail?.confirmed_qty ?? 0
          return numberFormatter(value, i18n.language)
        },
      },
      {
        accessorKey: 'on_hand_stock',
        header: t('orderDetail:table.column.stock_on_hand'),
        cell: ({ row }) => {
          const value =
            row.original?._child_of_detail_stock?.total_qty ??
            row?.original?._child_of_detail_stock?.details?.find(
              (detail) =>
                detail?.material?.id ===
                row?.original?._child_detail?.material?.id
            )?.total_qty ??
            0
          return numberFormatter(value, i18n.language)
        },
      },
      {
        accessorKey: 'available_stock',
        header: t('orderDetail:table.column.available_stock'),
        cell: ({ row }) => {
          const value =
            row.original?._child_of_detail_stock?.total_available_qty ??
            row?.original?._child_of_detail_stock?.details?.find(
              (detail) =>
                detail?.material?.id ===
                row?.original?._child_detail?.material?.id
            )?.total_available_qty ??
            0
          return numberFormatter(value, i18n.language)
        },
      },
      {
        accessorKey: 'order_stock_status_id',
        header: t('orderDetail:table.column.material_status'),
        cell: ({ row }) => renderStockStatusColumn(row as any),
        minSize: 200,
      },
      {
        accessorKey: 'allocated_qty',
        header: t('orderDetail:table.column.allocation'),
        size: 250,
        minSize: 250,
        cell: ({ row }) => renderActionColumn(row),
      },
    ],
    [
      t,
      errors,
      children,
      i18n.language,
      selectedRowVendorStock?.material?.is_temperature_sensitive,
    ]
  )

  const handleSubmitForm = (values: any) => {
    const payload = {
      ...values,
      children: values?.children?.map((child: any) => ({
        ...child,
        allocations: child?.allocations,
        order_stock_status_id: child?.order_stock_status_id?.value
          ? child?.order_stock_status_id
          : undefined,
      })),
    }

    onSubmit(payload, selectedRow?.index)
    setOpenAllocateModalForm(false)
  }

  const handleClose = () => {
    setOpenAllocateModalForm(false)
  }

  const handleSelectStockFromOtherActivities = (
    option: OptionTypeWithData<DetailStock>
  ) => {
    const newChildEntries = option?.data?.details
      ?.filter((data) => data?.stocks.length)
      ?.map((detail) => ({
        child_id: undefined,
        allocated_qty: undefined,
        order_stock_status_id: undefined,
        allocations: detail?.stocks?.map((stock) => ({
          stock_id: stock.id,
          allocated_qty: undefined,
          _child_detail: option.data,
          _stock_material: detail?.material,
          _stock_detail: stock,
          _stock_vendor: selectedRowData?.order_item?.stock_vendor,
          _stock_customer: selectedRowData?.order_item?.stock_customer,
        })),
        _activity: option?.data?.activity,
        _stock_vendor: selectedRowData?.order_item?.stock_vendor,
        _stock_customer: selectedRowData?.order_item?.stock_customer,
        _child_detail: {
          allocated_qty: selectedRowData?.order_item?.allocated_qty,
          confirmed_qty: selectedRowData?.order_item?.confirmed_qty,
          created_at: undefined,
          fulfilled_qty: selectedRowData?.order_item?.fulfilled_qty,
          child_id: undefined,
          material: detail?.material,
          order_id: orderDetailData?.id,
          order_stocks: [],
          ordered_qty: selectedRowData?.order_item?.ordered_qty,
          other_reason: null,
          qty: selectedRowData?.order_item?.qty,
          reason: null,
          recommended_stock: selectedRowData?.order_item?.recommended_stock,
          shipped_qty: selectedRowData?.order_item?.shipped_qty,
          stock_vendor: selectedRowData?.order_item?.stock_vendor,
          stock_customer: selectedRowData?.order_item?.stock_customer,
        },
        _child_of_detail_stock: option.data,
      }))

    if (newChildEntries && newChildEntries.length > 0) {
      setValue(
        'children',
        [...(getValues('children') || []), ...newChildEntries],
        { shouldDirty: true }
      )
    }
  }

  useEffect(() => {
    if (!isOpenAllocateModalForm) {
      return
    }

    const mapChildren = () => {
      if (children?.some((child) => child?.allocated_qty)) {
        return children
      }
      if (selectedRowData?.order_item?.children?.length) {
        const updatedChildren = selectedRowData?.order_item?.children?.map(
          (child) => ({
            child_id: child?.id,
            allocated_qty: undefined,
            order_stock_status_id: undefined,
            allocations: selectedRowVendorStock?.details
              ?.find((detail) => detail?.material?.id === child?.material?.id)
              ?.stocks?.map((stock) => {
                return {
                  stock_id: stock.id,
                  allocated_qty: undefined,
                  _stock_material: child.material,
                  _stock_detail: stock,
                  _stock_vendor: child.stock_vendor,
                  _stock_customer: child.stock_customer,
                }
              }),
            _activity: orderDetailData?.activity,
            _stock_vendor: child.stock_vendor,
            _stock_customer: child.stock_customer,
            _child_detail: child,
            _child_of_detail_stock: selectedRowVendorStock?.details?.find(
              (detail) => detail?.material?.id === child?.material?.id
            ),
          })
        )
        return updatedChildren
      }

      if (selectedRowVendorStock?.details?.length) {
        const selectedRowChildData = selectedRowData?.order_item
        const updatedChildren =
          selectedRowVendorStock.details
            ?.filter((data) => {
              return data?.stocks?.find(
                (stock) => stock?.activity?.id === orderDetailData?.activity?.id
              )
            })
            .map((detail) => ({
              child_id: selectedRowChildData?.id,
              allocated_qty: undefined,
              order_stock_status_id: undefined,
              allocations: detail?.stocks?.map((stock) => ({
                stock_id: stock.id,
                allocated_qty: undefined,
                _child_detail: detail,
                _stock_material: {
                  code: selectedRowChildData?.material?.code,
                  consumption_unit_per_distribution_unit:
                    detail?.material?.consumption_unit_per_distribution_unit,
                  id: detail?.material?.id,
                  is_managed_in_batch: detail?.material?.is_managed_in_batch,
                  is_temperature_sensitive:
                    detail?.material?.is_temperature_sensitive,
                  kfa_level_id: selectedRowChildData?.material?.kfa_level_id,
                  kfa_level_name:
                    selectedRowChildData?.material?.kfa_level_name,
                  material_level_id: detail?.material?.material_level_id,
                  name: detail?.material?.name,
                  parent_id: null,
                  type: null,
                  unit_of_consumption:
                    selectedRowChildData?.material?.unit_of_consumption,
                  unit_of_distribution:
                    selectedRowChildData?.material?.unit_of_distribution,
                },
                _stock_detail: stock,
                _stock_vendor: selectedRowChildData?.stock_vendor,
                _stock_customer: selectedRowChildData?.stock_customer,
              })),
              _activity: orderDetailData?.activity,
              _stock_vendor: selectedRowChildData?.stock_vendor,
              _stock_customer: selectedRowChildData?.stock_customer,
              _child_detail: {
                allocated_qty: 0,
                confirmed_qty: selectedRowChildData?.confirmed_qty,
                created_at: selectedRowChildData?.created_at,
                fulfilled_qty: 0,
                id: null,
                material: {
                  id: detail?.material?.id,
                  name: detail?.material?.name,
                  code: null,
                  type: null,
                  kfa_level_id: null,
                  kfa_level_name: null,
                  material_level_id: detail?.material?.material_level_id,
                  parent_id: null,
                  unit_of_consumption: null,
                  unit_of_distribution: null,
                },
                order_id: orderDetailData?.id,
                order_stocks: [],
                ordered_qty: selectedRowChildData?.ordered_qty,
                other_reason: selectedRowChildData?.other_reason,
                qty: selectedRowChildData?.qty,
                reason: selectedRowChildData?.reason,
                recommended_stock: selectedRowChildData?.recommended_stock,
                shipped_qty: selectedRowChildData?.shipped_qty,
              },
              _child_of_detail_stock: detail,
            })) || []
        return updatedChildren
      }
    }
    setValue('id', selectedRowData?.order_item?.id)
    setValue('children', mapChildren())
  }, [
    isOpenAllocateModalForm,
    isSelectedRowManagedInBatch,
    selectedRowVendorStock,
    selectedRowData?.order_item?.children?.length,
    formValues,
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
      submitButton={{
        label: t('common:save'),
      }}
    >
      <div className="ui-grid ui-grid-cols-[350px_350px_3fr] ui-gap-4">
        <FormControl className="ui-space-y-1">
          <FormLabel className="text-sm">Material</FormLabel>
          <div className="ui-text-dark-blue ui-font-bold">
            {selectedRowData?.order_item?.material.name}
            {selectedRowData?.order_item?.material?.id}
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
          renderSubComponent={(data) => {
            const orderStocks = children ?? []
            return (
              <OrderDetailAllocateModalFormHierarchyCustomRow
                data={orderStocks?.[data.row.index]?.allocations}
                supportData={data?.row?.original}
                control={control}
                childIndex={data.row.index}
                onClose={() => data?.row?.toggleExpanded()}
                getValues={getValues}
                setValue={setValue}
                trigger={trigger}
              />
            )
          }}
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
              (data) => data._activity?.id !== option.value
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

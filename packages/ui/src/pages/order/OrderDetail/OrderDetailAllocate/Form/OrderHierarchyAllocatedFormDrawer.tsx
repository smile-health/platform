import React, { useCallback, useEffect, useMemo } from 'react'
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
  OptionTypeWithData,
  ReactSelect,
  ReactSelectAsync,
} from '#components/react-select'
import { BOOLEAN } from '#constants/common'
import { KfaLevelEnum } from '#constants/material'
import { ProgramEnum } from '#constants/program'
import { listStockDetailStock } from '#services/stock'
import { DetailStock } from '#types/stock'
import { parseDateTime } from '#utils/date'
import { numberFormatter } from '#utils/formatter'
import { getProgramStorage } from '#utils/storage/program'
import { OptionType } from 'dayjs'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { loadMaterialStatus } from '../../../OrderCreateReturn/order-create-return.service'
import { OrderDetailDrawer } from '../../components'
import { ChildrenProps } from '../../components/Forms/OrderDetailAllocateModalFormHierarchyCustomRow'
import { orderDetailAllocateModalHierarchyFormSchema } from '../../order-detail-hierarchy.schema'
import useOrderDetailStore from '../../order-detail.store'
import { OrderDetailAllocateHierarchyFormValues } from '../../order-detail.type'
import { AllocatedFormBatchModalValues } from './OrderHierarchyAllocatedFormBatchModal'

export type OrderDetailAllocateModalFormValues =
  OrderDetailAllocateHierarchyFormValues['order_items'][number]

export type OrderHierarchyAllocatedFormDrawerProps = {
  values: OrderDetailAllocateHierarchyFormValues['order_items'][number]
  childIndex: number
  onSubmit: (
    values: OrderDetailAllocateModalFormValues,
    rowIndex?: number
  ) => void
  isLoading?: boolean
}

const OrderHierarchyAllocatedFormDrawer = ({
  values: parentFormValues,
  childIndex,
  onSubmit = () => {},
  isLoading = false,
}: OrderHierarchyAllocatedFormDrawerProps) => {
  const { t, i18n } = useTranslation(['common', 'orderDetail'])
  const program = getProgramStorage()
  const isImmunization = program?.key === ProgramEnum.Immunization
  const {
    data: orderDetailData,
    isOpenAllocateModalForm,
    setOpenAllocateModalForm,
    allocateFormSelectedRow: selectedRow,
  } = useOrderDetailStore()
  const params = useParams()
  const orderId = params?.id as string
  const selectedRowData = selectedRow?.original
  const selectedRowVendorStock = selectedRowData?.vendor_stock
  const selectedRowCustomerStock = selectedRowData?.order_item?.stock_customer
  const isSelectedRowManagedInBatch = Boolean(
    selectedRowVendorStock?.material?.is_managed_in_batch
  )

  const isTrademarkMaterial =
    !!selectedRowData?.order_item &&
    (selectedRowData?.order_item?.children?.length ?? 0) > 0

  const {
    control,
    watch,
    handleSubmit,
    trigger,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm<OrderDetailAllocateModalFormValues>({
    resolver: yupResolver(
      orderDetailAllocateModalHierarchyFormSchema(
        t,
        i18n.language,
        isImmunization
      )
    ),
    mode: 'onChange',
    defaultValues: parentFormValues,
  })

  const { children } = watch()

  const { setOpenAllocateBatchForm } = useOrderDetailStore()

  const handleClose = () => {
    setOpenAllocateModalForm(false)
  }

  const handleSubmitBatchForm = (
    values: AllocatedFormBatchModalValues,
    rowIndex: number
  ) => {
    const totalSavedQty = values?.reduce(
      (acc, cur) => acc + (cur.allocated_qty ?? 0),
      0
    )
    setValue(`children.${rowIndex}.allocated_qty`, totalSavedQty)
    setValue(`children.${rowIndex}.allocations`, values)
    setOpenAllocateBatchForm(
      false,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined
    )
    trigger(`children`)
  }

  const renderActionColumn = useCallback(
    (row: Row<any>) => {
      const currentChildren = getValues('children')
      const allocations = currentChildren?.[row?.index]?.allocations || []
      const filteredAllocations = allocations.filter((value) =>
        Boolean(value?.allocated_qty)
      )
      const isFilteredAllocationExist = filteredAllocations.length > 0
      const isBatch =
        Boolean(
          children?.[row?.index]?._child_of_detail_stock?.material
            ?.is_managed_in_batch
        ) ||
        Boolean(
          children?.[row?.index]?._child_detail?.material?.is_managed_in_batch
        )
      const errorMessage = errors?.children?.root?.message

      const handleClick = () =>
        setOpenAllocateBatchForm(
          true,
          currentChildren?.[row?.index]?.allocations,
          row?.index,
          row?.original?._child_detail?.material?.name,
          row?.original?._activity?.name,
          handleSubmitBatchForm
        )

      return (
        <div className="space-y-2">
          {isFilteredAllocationExist && (
            <div className="space-y-2">
              {filteredAllocations?.map((value) => {
                const originalIndex = allocations.findIndex(
                  (val) => val.stock_id === value.stock_id
                )
                const childErrors = errors?.children?.[row?.index] as any
                const error = childErrors?.allocations?.[originalIndex]?.order_stock_status_id
                const itemHeightClass = isBatch
                  ? error
                    ? 'ui-h-[120px]'
                    : 'ui-h-24'
                  : error
                    ? 'ui-h-[72px]'
                    : 'ui-h-12'

                return (
                  <div
                    key={value.stock_id}
                    className={`ui-text-sm ui-flex ui-flex-col ui-justify-center ${itemHeightClass}`}
                  >
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
                )
              })}
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
    [children, t, i18n.language, errors, getValues]
  )

  const renderStockStatusColumn = (row: Row<any>) => {
    const currentChildren = getValues('children')
    const childIndex = row.index
    const child = currentChildren?.[childIndex]
    const allocations = child?.allocations || []
    const filteredAllocations = allocations.filter((val) =>
      Boolean(val?.allocated_qty)
    )
    const isBatch =
      Boolean(
        child?._child_of_detail_stock?.material?.is_managed_in_batch
      ) || Boolean(child?._child_detail?.material?.is_managed_in_batch)
    const isTemperatureSensitive = Boolean(
      child?._child_detail?.material?.is_temperature_sensitive
    )

    if (filteredAllocations.length === 0) {
      return <div className="ui-h-12 ui-flex ui-items-center">-</div>
    }

    return (
      <div className="space-y-2">
        {filteredAllocations.map((allocation) => {
          const originalIndex = allocations.findIndex(
            (val) => val.stock_id === allocation.stock_id
          )
          const childErrors = errors?.children?.[childIndex] as any
          const error = childErrors?.allocations?.[originalIndex]?.order_stock_status_id
          const itemHeightClass = isBatch
            ? error
              ? 'ui-h-[120px]'
              : 'ui-h-24'
            : error
              ? 'ui-h-[72px]'
              : 'ui-h-12'

          return (
            <div
              key={allocation.stock_id}
              className={`ui-flex ui-flex-col ui-justify-center ${itemHeightClass}`}
            >
              <Controller
                control={control}
                key={`children.${childIndex}.allocations.${originalIndex}.order_stock_status_id`}
                name={`children.${childIndex}.allocations.${originalIndex}.order_stock_status_id`}
                render={({ field }) => {
                  return (
                    <div className="space-y-1 ui-w-full">
                      <ReactSelectAsync
                        id={`order_stock_status_${childIndex}_${originalIndex}`}
                        className="ui-text-sm"
                        placeholder={t(
                          'orderDetail:form.material_status.placeholder'
                        )}
                        isClearable
                        value={(field.value as OptionType) ?? undefined}
                        menuPosition="fixed"
                        onChange={(option: OptionType) => {
                          field.onChange(option)
                          trigger(
                            `children.${childIndex}.allocations.${originalIndex}.order_stock_status_id`
                          )
                        }}
                        loadOptions={loadMaterialStatus}
                        additional={{
                          page: 1,
                        }}
                        disabled={!isTemperatureSensitive}
                        error={Boolean(error)}
                      />

                      {Boolean(error) && (
                        <FormErrorMessage>{error?.message}</FormErrorMessage>
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
  }

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
          only_have_qty: BOOLEAN.TRUE,
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

  const columns: ColumnDef<ChildrenProps>[] = useMemo(() => {
    const isTrademarkMaterialColumns: ColumnDef<ChildrenProps>[] = [
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
    ]
    const shownColumns: ColumnDef<ChildrenProps>[] = [
      {
        header: 'No',
        cell: ({ row }) => row?.index + 1,
      },
      {
        accessorKey: 'name',
        header: t('orderDetail:table.product_variant'),
        size: 180,
        minSize: 180,
        cell: ({ row }) => row.original?._child_detail?.material?.name ?? '-',
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
    ]

    if (isTrademarkMaterial)
      shownColumns.splice(1, 0, ...isTrademarkMaterialColumns)

    return shownColumns
  }, [
    t,
    errors,
    children,
    i18n.language,
    selectedRowVendorStock?.material?.is_temperature_sensitive,
    isTrademarkMaterial,
  ])

  useEffect(() => {
    const mapChildren = () => {
      if (children?.some((child) => child?.allocated_qty)) {
        return children
      }
      if (selectedRowData?.order_item?.children?.length) {
        const updatedChildren = selectedRowData?.order_item?.children?.map(
          (child) => ({
            child_id: child?.id,
            allocated_qty: undefined,
            confirmed_qty: child?.confirmed_qty ?? 0,
            kfa_level_id: child ? KfaLevelEnum.KFA_93 : KfaLevelEnum.KFA_92,
            order_stock_status_id: undefined,
            allocations: selectedRowVendorStock?.details
              ?.find((detail) => detail?.material?.id === child?.material?.id)
              ?.stocks?.filter((stock) => Number(stock?.qty) > 0)
              ?.map((stock) => {
                return {
                  stock_id: stock.id,
                  allocated_qty: undefined,
                  confirmed_qty: child?.confirmed_qty ?? 0,
                  kfa_level_id: child
                    ? KfaLevelEnum.KFA_93
                    : KfaLevelEnum.KFA_92,
                  order_stock_status_id: null,
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
            ?.filter((data) =>
              data?.stocks?.some(
                (stock) =>
                  stock?.activity?.id === orderDetailData?.activity?.id &&
                  Number(stock?.qty) > 0
              )
            )
            .map((detail) => ({
              child_id: selectedRowChildData?.id,
              allocated_qty: undefined,
              confirmed_qty: selectedRowChildData?.confirmed_qty ?? 0,
              kfa_level_id:
                selectedRowChildData?.children.length > 0
                  ? KfaLevelEnum.KFA_93
                  : KfaLevelEnum.KFA_92,
              order_stock_status_id: undefined,
              allocations: detail?.stocks
                ?.filter((stock) => Number(stock.qty) > 0)
                ?.map((stock) => ({
                  stock_id: stock.id,
                  allocated_qty: undefined,
                  confirmed_qty: selectedRowChildData?.confirmed_qty ?? 0,
                  kfa_level_id:
                    selectedRowChildData?.children.length > 0
                      ? KfaLevelEnum.KFA_93
                      : KfaLevelEnum.KFA_92,
                  order_stock_status_id: null,
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
                  is_temperature_sensitive:
                    detail?.material?.is_temperature_sensitive,
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

    reset({
      id: selectedRowData?.order_item?.id,
      children: mapChildren(),
    })
  }, [
    isSelectedRowManagedInBatch,
    selectedRowVendorStock,
    selectedRowData?.order_item?.children?.length,
    formValues,
  ])

  useMemo(() => {
    if (isOpenAllocateModalForm) reset(parentFormValues)
  }, [isOpenAllocateModalForm, parentFormValues])

  const handleSelectStockFromOtherActivities = (
    option: OptionTypeWithData<DetailStock>
  ) => {
    const newChildEntries = option?.data?.details
      ?.filter((data) => data?.stocks.length)
      ?.map((detail) => ({
        child_id: undefined,
        allocated_qty: undefined,
        confirmed_qty: undefined,
        order_stock_status_id: undefined,
        allocations: detail?.stocks?.map((stock) => ({
          stock_id: stock.id,
          allocated_qty: undefined,
          order_stock_status_id: null,
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

  const submitData = (values: OrderDetailAllocateModalFormValues) => {
    const payload = {
      ...values,
      children: values?.children?.map((child: any) => ({
        ...child,
        allocations: child?.allocations?.map((allocation: any) => ({
          ...allocation,
          order_stock_status_id: allocation?.order_stock_status_id?.value
            ? allocation?.order_stock_status_id
            : undefined,
        })),
        order_stock_status_id: undefined,
      })),
    }

    onSubmit(payload, childIndex)
  }

  return (
    <OrderDetailDrawer
      id="allocate-product-variant-drawer-form"
      open={isOpenAllocateModalForm}
      onClose={handleClose}
      title={t('orderDetail:table.product_variant')}
      onReset={() => reset()}
      onSubmit={handleSubmit(submitData)}
      isLoading={isLoading}
      disabled={isLoading}
      submitButton={{
        label: t('common:save'),
      }}
    >
      <div className="ui-grid ui-grid-cols-[repeat(auto-fit,minmax(5%,1fr))] ui-gap-4">
        <FormControl className="ui-space-y-1">
          <FormLabel className="text-sm">
            {t('orderDetail:table.trademark.column.material_active_substance')}
          </FormLabel>
          <div className="ui-text-dark-blue ui-font-bold">
            {selectedRowData?.order_item?.material.name}
            {selectedRowData?.order_item?.material?.id}
          </div>
        </FormControl>
        {!isTrademarkMaterial && (
          <>
            <FormControl className="ui-space-y-1">
              <FormLabel className="text-sm">
                {t('orderDetail:table.column.ordered')}
              </FormLabel>
              <div className="ui-text-dark-blue ui-font-bold">
                {numberFormatter(
                  selectedRowData?.order_item?.ordered_qty,
                  i18n.language
                )}
              </div>
            </FormControl>
            <FormControl className="ui-space-y-1">
              <FormLabel className="text-sm">
                {t('orderDetail:table.column.confirmed')}
              </FormLabel>
              <div className="ui-text-dark-blue ui-font-bold">
                {numberFormatter(
                  selectedRowData?.order_item?.confirmed_qty,
                  i18n.language
                )}
              </div>
            </FormControl>
          </>
        )}
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
      <DataTable
        className="ui-overflow-y-auto ui-max-h-[50vh]"
        columns={columns}
        data={tableData}
        isSticky
      />
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
    </OrderDetailDrawer>
  )
}

export default OrderHierarchyAllocatedFormDrawer

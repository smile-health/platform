import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { PlusIcon } from '@heroicons/react/24/outline'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '#components/button'
import { EmptyState } from '#components/empty-state'
import {
  FormControl,
  FormDescription,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { Input } from '#components/input'
import { InputNumberV2 } from '#components/input-number-v2'
import {
  OptionType,
  OptionTypeWithData,
  ReactSelectAsync,
} from '#components/react-select'
import { toast } from '#components/toast'
import { useLoadingPopupStore } from '#store/loading.store'
import { ErrorResponse } from '#types/common'
import { Stock } from '#types/stock'
import { numberFormatter } from '#utils/formatter'
import { AxiosError } from 'axios'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { OrderReasonEnum, OrderTypeEnum } from '../../../order.constant'
import { loadReasons } from '../../../OrderCreate/order-create.service'
import { useOrderDetailHierarchyAddEditMaterial } from '../../hooks/useOrderDetailHierarchyAddEditMaterial'
import { countRecommenedStockFormula } from '../../order-detail.helpers'
import {
  orderDetailItemAddFormSchema,
  orderDetailItemEditFormSchema,
} from '../../order-detail.schema'
import {
  createOrderDetailItem,
  loadOrderDetailStocks,
  updateOrderDetailItem,
} from '../../order-detail.service'
import useOrderDetailStore from '../../order-detail.store'
import {
  CreateOrderDetailItemFormValues,
  OrderDetailItem,
  UpdateOrderDetailItemFormValues,
  UpdateOrderDetailItemResponseError,
} from '../../order-detail.type'
import { OrderDetailModal } from '../OrderDetailModal'
import { OrderDetailHierarchyForm } from './OrderDetailHierarchyForm'

type OrderDetailItemFormValues =
  | CreateOrderDetailItemFormValues
  | UpdateOrderDetailItemFormValues

export const OrderDetailItemForm = () => {
  const params = useParams()
  const queryClient = useQueryClient()
  const { t, i18n } = useTranslation(['common', 'orderDetail'])

  const [selectedMaterialStockData, setSelectedMaterialStockData] =
    useState<Stock>()

  const {
    data: orderDetailData,
    selectedOrderItemData: orderItemData,
    isOpenItemForm,
    setOpenItemForm,
    setOpenHierarchyDrawerForm,
    itemFormType: formType,
    isOrderDetailHierarchy,
  } = useOrderDetailStore()
  const { setLoadingPopup } = useLoadingPopupStore()
  const isRelocation = orderDetailData?.type === OrderTypeEnum.Relocation
  const isAddForm = formType === 'add'
  const isEditForm = formType === 'edit'
  const stockData =
    formType === 'add' ? selectedMaterialStockData : orderItemData
  const {
    isHierarchyEnabled,
    orderDetailFormHierarchySchema,
    defaultValuesHierarchy,
  } = useOrderDetailHierarchyAddEditMaterial({
    pageType: formType,
    stockData: stockData,
  })

  const defaultValues: OrderDetailItemFormValues = {
    id: undefined,
    material_id: undefined,
    order_item_kfa_id: null,
    ordered_qty: undefined,
    recommended_stock: undefined,
    order_reason_id: null,
    other_reason: '',
  }

  const orderDetailFormSchema = useMemo(() => {
    if (formType === 'add') {
      return orderDetailItemAddFormSchema(t, i18n.language, stockData as Stock)
    }
    return orderDetailItemEditFormSchema(
      t,
      i18n.language,
      stockData as OrderDetailItem
    )
  }, [formType, selectedMaterialStockData, orderItemData])

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    setError,
    trigger,
    formState: { errors },
  } = useForm<OrderDetailItemFormValues>({
    resolver: yupResolver(
      isHierarchyEnabled && isOrderDetailHierarchy
        ? orderDetailFormHierarchySchema
        : orderDetailFormSchema
    ),
    defaultValues:
      isHierarchyEnabled && isOrderDetailHierarchy
        ? defaultValuesHierarchy
        : defaultValues,
  })

  const stockCustomer = orderItemData?.stock_customer
  const orderId = params.id as string
  const recommendedStockQty = useMemo(() => {
    return isAddForm
      ? countRecommenedStockFormula(
          selectedMaterialStockData?.max,
          selectedMaterialStockData?.total_qty,
          selectedMaterialStockData?.material
            ?.consumption_unit_per_distribution_unit
        )
      : orderItemData?.recommended_stock
  }, [selectedMaterialStockData, orderItemData])
  const isRecommendationEnabled = Boolean(
    recommendedStockQty && recommendedStockQty !== 0
  )

  const handleSuccessMutation = async () => {
    setLoadingPopup(true)
    setOpenItemForm(false)
    toast.success({
      description: isAddForm
        ? t('orderDetail:message.add_item_success')
        : t('orderDetail:message.edit_item_success'),
    })
    await queryClient.refetchQueries({
      queryKey: [i18n.language, 'order', 'detail', orderId],
    })
    await queryClient.refetchQueries({ queryKey: ['order', 'detail', orderId] })
    setSelectedMaterialStockData(undefined)
    setLoadingPopup(false)
    setTimeout(() => reset(defaultValues), 500)
  }

  const handleErrorMutation = (error: AxiosError<ErrorResponse>) => {
    const responseData = error.response?.data
    const responseErrors =
      responseData?.errors as unknown as UpdateOrderDetailItemResponseError
    const message =
      responseData?.message ?? t('orderDetail:message.edit_item_failed')

    handleFieldResponseError(responseErrors)
    toast.danger({ description: message })
  }

  const editItemMutation = useMutation<
    unknown,
    AxiosError<ErrorResponse>,
    UpdateOrderDetailItemFormValues
  >({
    mutationFn: (values) =>
      updateOrderDetailItem(
        orderId,
        values,
        isHierarchyEnabled && isOrderDetailHierarchy
      ),
    onSuccess: handleSuccessMutation,
    onError: handleErrorMutation,
  })

  const addItemMutation = useMutation<
    unknown,
    AxiosError<ErrorResponse>,
    CreateOrderDetailItemFormValues
  >({
    mutationFn: (values) =>
      createOrderDetailItem(
        orderId,
        values,
        isHierarchyEnabled && isOrderDetailHierarchy
      ),
    onSuccess: handleSuccessMutation,
    onError: handleErrorMutation,
  })

  const handleFieldResponseError = (
    responseErrors: UpdateOrderDetailItemResponseError
  ) => {
    if (!responseErrors?.order_items?.[0]) return

    Object.entries(responseErrors.order_items[0]).forEach(
      ([key, errorMessages]) => {
        const fieldKey = key as keyof OrderDetailItemFormValues
        setError(fieldKey as any, { message: errorMessages[0] })
      }
    )
  }

  const handleClose = () => {
    setSelectedMaterialStockData(undefined)
    setOpenItemForm(false)
    setTimeout(() => reset(defaultValues), 500)
  }

  const handleSubmitItem = (values: OrderDetailItemFormValues) => {
    const hierarchyValues = {
      ...values,
      children: values?.children?.map((child) => ({
        ordered_qty: child.ordered_qty,
        ...(isAddForm
          ? {
              material_id: child?.material_id,
            }
          : {
              id: child?.id,
            }),
      })),
    }

    isAddForm
      ? addItemMutation.mutate(
          isHierarchyEnabled && isOrderDetailHierarchy
            ? (hierarchyValues as CreateOrderDetailItemFormValues)
            : (values as CreateOrderDetailItemFormValues)
        )
      : editItemMutation.mutate(
          isHierarchyEnabled && isOrderDetailHierarchy
            ? (hierarchyValues as UpdateOrderDetailItemFormValues)
            : (values as UpdateOrderDetailItemFormValues)
        )
  }

  const handleInitialValues = useCallback(() => {
    setValue('recommended_stock', recommendedStockQty)
    setValue('children', orderItemData?.children)

    if (isAddForm) {
      setValue('ordered_qty', recommendedStockQty)
    }

    if (isEditForm) {
      setValue('id', orderItemData?.id)
      setValue('ordered_qty', orderItemData?.qty)

      if (orderItemData?.reason) {
        setValue('order_reason_id', {
          value: orderItemData.reason.id,
          label: orderItemData.reason.name,
        })
      }

      setValue('other_reason', orderItemData?.other_reason ?? '')
    }
  }, [recommendedStockQty, formType, isOpenItemForm, orderItemData])

  const { children, ordered_qty } = watch()

  const checkChildInputField = useMemo(() => {
    return children?.every((child) => child?.ordered_qty !== null)
  }, [children])

  useEffect(() => {
    handleInitialValues()
  }, [formType, isOpenItemForm, orderItemData, recommendedStockQty])

  useEffect(() => {
    if (isHierarchyEnabled && isOrderDetailHierarchy && children?.length) {
      setValue(
        'ordered_qty',
        children?.reduce((acc, child) => acc + (child.ordered_qty ?? 0), 0)
      )
      setValue('recommended_stock', 0)
    }
  }, [isHierarchyEnabled, orderDetailData?.type, children?.length])

  const renderSelectedMaterialCondition = () => {
    if (isAddForm) {
      return Boolean(watch('material_id'))
    }
    if (isEditForm) {
      return (
        (orderItemData?.children?.length ?? 0) > 0 &&
        orderItemData?.children?.every((child) => (child?.ordered_qty || 0) > 0)
      )
    }
  }

  const selectedMaterialChildren = children?.filter((x) =>
    Boolean(x.ordered_qty)
  )

  return (
    <>
      <OrderDetailModal
        title={t(
          isAddForm
            ? 'orderDetail:modal.add_item.title'
            : 'orderDetail:modal.edit_item.title'
        )}
        open={isOpenItemForm}
        onClose={handleClose}
        onSubmit={handleSubmit(handleSubmitItem)}
        isLoading={addItemMutation.isPending || editItemMutation.isPending}
        submitButton={{
          label: t('common:save'),
          disabled:
            addItemMutation.isPending ||
            editItemMutation.isPending ||
            (isAddForm && !watch('material_id')),
        }}
      >
        {formType === 'add' && (
          <Controller
            name="material_id"
            control={control}
            render={({ field: { onChange, value, ...field } }) => {
              const fieldId = `select-material-${value}`
              return (
                <FormControl>
                  <FormLabel htmlFor={fieldId}>
                    {t('orderDetail:form.material.label')}
                  </FormLabel>
                  <ReactSelectAsync
                    {...field}
                    id={fieldId}
                    loadOptions={loadOrderDetailStocks}
                    debounceTimeout={300}
                    placeholder={t('orderDetail:form.material.placeholder')}
                    additional={{
                      page: 1,
                      paginate: 10,
                      entity_id: orderDetailData?.customer_id,
                      activity_id: orderDetailData?.activity.id,
                      order_items: orderDetailData?.order_items,
                      is_hierarchy: Number(
                        isHierarchyEnabled && isOrderDetailHierarchy
                      ),
                      material_level_id: isHierarchyEnabled ? 2 : 3,
                    }}
                    onChange={(option: OptionTypeWithData<Stock>) => {
                      onChange(option?.value)
                      setValue('ordered_qty', undefined)
                      setValue('order_item_kfa_id', null)
                      setValue('order_reason_id', null)
                      setValue('other_reason', '')
                      setSelectedMaterialStockData(option.data)
                    }}
                    menuPosition="fixed"
                  />
                </FormControl>
              )
            }}
          />
        )}

        {formType === 'add' && !watch('material_id') && (
          <EmptyState
            withIcon
            title={t('orderDetail:modal.add_item.empty_data_title')}
            description={t('orderDetail:modal.add_item.empty_data_desc')}
          />
        )}

        {(isEditForm || (isAddForm && Boolean(watch('material_id')))) && (
          <>
            <div className="ui-flex ui-gap-10">
              <FormControl className="ui-space-y-1">
                <FormLabel className="text-sm">Material</FormLabel>
                <div className="ui-text-dark-blue ui-font-bold">
                  {selectedMaterialStockData?.material?.name ??
                    orderItemData?.material.name}
                </div>
              </FormControl>
              <FormControl className="ui-space-y-1">
                <FormLabel className="text-sm">
                  {t('orderDetail:table.column.available_stock')}{' '}
                  {t('common:at').toLowerCase()}{' '}
                  {orderDetailData?.customer?.name}
                </FormLabel>
                <div className="ui-text-dark-blue ui-font-bold ui-flex ui-items-baseline ui-gap-1">
                  {numberFormatter(
                    selectedMaterialStockData?.total_available_qty ??
                      stockCustomer?.total_available_qty,
                    i18n.language
                  )}
                  <div className="ui-text-gray-500 ui-font-normal ui-text-xs ui-relative ui-bottom-0.5">
                    (min:
                    {numberFormatter(
                      selectedMaterialStockData?.min ?? stockCustomer?.min,
                      i18n.language
                    )}
                    , max:
                    {numberFormatter(
                      selectedMaterialStockData?.max ?? stockCustomer?.max,
                      i18n.language
                    )}
                    )
                  </div>
                </div>
              </FormControl>
            </div>

            <Controller
              name="ordered_qty"
              control={control}
              render={({
                field: { onChange, value, ...field },
                fieldState,
              }) => (
                <FormControl className="ui-space-y-1.5">
                  <FormLabel
                    className="text-sm"
                    required
                    htmlFor="input-ordered-qty"
                  >
                    {t('orderDetail:form.ordered_qty.label')}
                  </FormLabel>
                  <InputNumberV2
                    id="input-ordered-qty"
                    name={field.name}
                    onValueChange={(value: any) => {
                      const numValue =
                        value.value === '' ? null : Number(value.floatValue)
                      onChange(numValue)
                      trigger('ordered_qty')
                      if (
                        isRecommendationEnabled &&
                        numValue === watch('recommended_stock')
                      ) {
                        setValue('order_reason_id', null)
                        setValue('other_reason', '')
                      }
                    }}
                    value={
                      isHierarchyEnabled &&
                      isOrderDetailHierarchy &&
                      checkChildInputField &&
                      !children?.length
                        ? orderItemData?.ordered_qty?.toString()
                        : children
                            ?.reduce(
                              (acc, child) => acc + (child.ordered_qty ?? 0),
                              0
                            )
                            .toString()
                    }
                    placeholder={
                      isRecommendationEnabled
                        ? numberFormatter(recommendedStockQty, i18n.language)
                        : t('orderDetail:form.ordered_qty.placeholder')
                    }
                    className="ui-text-sm"
                    min={0}
                    error={Boolean(fieldState.error?.message)}
                    disabled={
                      (isHierarchyEnabled &&
                        isOrderDetailHierarchy &&
                        checkChildInputField &&
                        Boolean(children?.length)) ||
                      editItemMutation.isPending
                    }
                  />
                  {fieldState.error?.message && (
                    <FormErrorMessage className="ui-leading-none">
                      {fieldState.error.message}
                    </FormErrorMessage>
                  )}
                  {isRecommendationEnabled && (
                    <FormDescription>
                      {t('orderDetail:form.ordered_qty.helper')}:{' '}
                      {numberFormatter(
                        watch('recommended_stock'),
                        i18n.language
                      )}
                    </FormDescription>
                  )}
                </FormControl>
              )}
            />

            {isHierarchyEnabled &&
              isOrderDetailHierarchy &&
              renderSelectedMaterialCondition() && (
                <div className="!ui-mt-3">
                  {selectedMaterialChildren?.map((child) => (
                    <div
                      key={child?.material_id}
                      className="!ui-bg-[#F1F5F9] ui-px-4 ui-py-2 ui-rounded ui-w-full ui-mb-2"
                    >
                      <div>{child?.material?.name}</div>
                      <div className="ui-font-semibold">
                        Qty:{' '}
                        {numberFormatter(
                          child?.ordered_qty || 0,
                          i18n.language
                        )}
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isAddForm && !Boolean(watch('material_id'))}
                    onClick={() => setOpenHierarchyDrawerForm(true)}
                    className="ui-mt-3"
                    leftIcon={
                      !selectedMaterialChildren && (
                        <PlusIcon className="ui-w-5 ui-text-dark-blue" />
                      )
                    }
                  >
                    {!selectedMaterialChildren
                      ? t(
                          'orderDetail:form.ordered_qty.button.add_trademark_material'
                        )
                      : t(
                          'orderDetail:form.ordered_qty.button.update_trademark_material'
                        )}
                  </Button>
                </div>
              )}

            <Controller
              name="order_reason_id"
              control={control}
              render={({ field, fieldState }) => (
                <FormControl className="ui-space-y-1.5">
                  <FormLabel className="text-sm" required>
                    {t('orderDetail:form.reason.label')}
                  </FormLabel>
                  <ReactSelectAsync
                    {...field}
                    inputId="select-order-reason"
                    loadOptions={loadReasons}
                    onChange={(option: OptionType) => {
                      field.onChange(option)
                      if (option?.value !== OrderReasonEnum.Others) {
                        setValue('other_reason', '')
                      }
                    }}
                    additional={{
                      page: 1,
                      type: isRelocation ? 'relocation' : 'request',
                    }}
                    placeholder={t('orderDetail:form.reason.placeholder')}
                    menuPosition="fixed"
                    classNames={{
                      control: () => 'ui-text-sm',
                    }}
                    disabled={
                      editItemMutation.isPending ||
                      (isRecommendationEnabled &&
                        watch('ordered_qty') === watch('recommended_stock'))
                    }
                    error={Boolean(fieldState.error?.message)}
                  />
                  {fieldState.error?.message && (
                    <FormErrorMessage className="ui-leading-none">
                      {fieldState.error.message}
                    </FormErrorMessage>
                  )}
                </FormControl>
              )}
            />

            {watch('order_reason_id')?.value === OrderReasonEnum.Others && (
              <Controller
                name="other_reason"
                control={control}
                render={({ field, fieldState }) => (
                  <FormControl className="ui-space-y-1.5">
                    <FormLabel className="text-sm" required>
                      {t('orderDetail:form.other_reason.label')}
                    </FormLabel>
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      placeholder={t(
                        'orderDetail:form.other_reason.placeholder'
                      )}
                      className="ui-text-sm"
                      disabled={editItemMutation.isPending}
                      error={Boolean(fieldState.error?.message)}
                    />
                    {fieldState.error?.message && (
                      <FormErrorMessage className="ui-leading-none">
                        {fieldState.error.message}
                      </FormErrorMessage>
                    )}
                  </FormControl>
                )}
              />
            )}
          </>
        )}
      </OrderDetailModal>
      {isHierarchyEnabled && isOrderDetailHierarchy && (
        <OrderDetailHierarchyForm
          selectedMaterialStockData={stockData as Stock}
          onSubmit={(formData) => setValue('children', formData)}
        />
      )}
    </>
  )
}

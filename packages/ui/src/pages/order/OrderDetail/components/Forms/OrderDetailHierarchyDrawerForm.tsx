import { useEffect, useMemo } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { ColumnDef } from '@tanstack/react-table'
import { Alert } from '#components/alert'
import { Button } from '#components/button'
import { DataTable } from '#components/data-table'
import { Drawer, DrawerFooter, DrawerHeader } from '#components/drawer'
import { FormErrorMessage } from '#components/form-control'
import Reload from '#components/icons/Reload'
import XMark from '#components/icons/XMark'
import { InputNumberV2 } from '#components/input-number-v2'
import cx from '#lib/cx'
import { Stock } from '#types/stock'
import { getBackgroundStock, numberFormatter } from '#utils/formatter'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { orderDetailHierarchyChildrenFormSchema } from '../../order-detail-hierarchy.schema'
import { minMax } from '../../order-detail.helpers'
import useOrderDetailStore from '../../order-detail.store'
import { OrderDetailChildren, OrderDetailItem } from '../../order-detail.type'

type OrderDetailHierarchyDrawerFormProps = {
  values?: { children?: OrderDetailChildren[] }
  selectedMaterialStockData?: Stock | OrderDetailItem
  isLoading?: boolean
  onSubmit: (children?: OrderDetailChildren[]) => void
  onReset?: () => void
}

export const OrderDetailHierachyDrawerForm = ({
  values,
  isLoading,
  onSubmit,
  selectedMaterialStockData,
  onReset,
}: OrderDetailHierarchyDrawerFormProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'orderDetail', 'orderCreate'])

  const handleDefaultValue = () => {
    return {
      children: values?.children,
    }
  }

  const {
    data,
    isOpenHierarchyDrawerForm,
    setOpenHierarchyDrawerForm,
    itemFormType: formType,
  } = useOrderDetailStore()

  const isEditForm = formType === 'edit'

  const methods = useForm<{ children?: OrderDetailChildren[] }>({
    mode: 'onSubmit',
    resolver: yupResolver(
      orderDetailHierarchyChildrenFormSchema(
        t,
        language,
        selectedMaterialStockData
      )
    ),
    defaultValues: handleDefaultValue(),
  })

  const {
    control,
    trigger,
    watch,
    handleSubmit,
    clearErrors,
    setValue,
    formState: { errors },
  } = methods

  const columns: ColumnDef<OrderDetailChildren>[] = useMemo(
    () => [
      {
        header: 'SI.No',
        size: 50,
        cell: ({ row }) => row?.index + 1,
      },
      {
        accessorKey: 'material.name',
        size: 240,
        header: t('orderCreate:list.selected.column.material_info.label'),
        meta: {
          cellClassName: 'ui-font-bold',
        },
      },
      {
        header: t('orderCreate:list.selected.column.stock_on_hand'),
        size: 200,
        meta: {
          cellClassName: (row) =>
            `ui-flex-row ui-align-top ${getBackgroundStock(
              row?.original?.stock_customer?.total_allocated_qty ?? 0,
              row?.original?.stock_customer?.min ?? 0,
              row?.original?.stock_customer?.max ?? 0
            )}`,
        },
        cell: ({ row }) => {
          const customerStock = row.original.stock_customer
          return (
            <div>
              <div>{numberFormatter(customerStock?.total_qty, language)}</div>
              <div className="ui-text-[#737373] ui-text-sm">
                {`(min: ${numberFormatter(customerStock?.min || 0, language)}, max: ${numberFormatter(customerStock?.max || 0, language)})`}
              </div>
            </div>
          )
        },
      },
      {
        header: t('orderCreate:list.selected.column.quantity.label'),
        size: 400,
        cell: ({ row }) => (
          <Controller
            key={`${row.index}.ordered_qty`}
            name={`children.${row.index}.ordered_qty`}
            control={control}
            render={({ field: { value }, fieldState }) => {
              return (
                <div className="space-y-1">
                  <InputNumberV2
                    id={`children.${row.index}.ordered_qty`}
                    aria-label={`children.${row.index}.ordered_qty`}
                    placeholder={t(
                      'orderDetail:form.confirmed_qty.placeholder'
                    )}
                    value={value ?? ''}
                    className="ui-text-sm"
                    onValueChange={(value) => {
                      const numValue =
                        value.value === '' ? null : Number(value.floatValue)
                      setValue(`children.${row.index}.ordered_qty`, numValue)
                      trigger('children')
                      trigger(`children.${row.index}.ordered_qty`)
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
      },
    ],
    [values, errors, data, language]
  )

  const handleClose = () => {
    onReset?.()
    clearErrors()
    setOpenHierarchyDrawerForm(false)
  }

  const handleSubmitForm = (formData: { children?: OrderDetailChildren[] }) => {
    onSubmit(formData?.children)
    setOpenHierarchyDrawerForm(false)
  }

  useEffect(() => {
    if (values) {
      setValue('children', values?.children ?? [])
    }
  }, [values, setValue])

  const handleValueByFormType = (
    selectedMaterialStockData?: Stock | OrderDetailItem
  ) => {
    return {
      min: !isEditForm
        ? ((selectedMaterialStockData as Stock)?.min ?? 0)
        : ((selectedMaterialStockData as OrderDetailItem)?.stock_customer
            ?.min ?? 0),
      max: !isEditForm
        ? ((selectedMaterialStockData as Stock)?.max ?? 0)
        : ((selectedMaterialStockData as OrderDetailItem)?.stock_customer
            ?.max ?? 0),
      total_qty: !isEditForm
        ? ((selectedMaterialStockData as Stock)?.total_qty ?? 0)
        : ((selectedMaterialStockData as OrderDetailItem)?.stock_customer
            ?.total_qty ?? 0),
      total_available_qty: !isEditForm
        ? ((selectedMaterialStockData as Stock)?.total_available_qty ?? 0)
        : ((selectedMaterialStockData as OrderDetailItem)?.stock_customer
            ?.total_available_qty ?? 0),
    }
  }

  return (
    <FormProvider {...methods}>
      <Drawer
        placement="bottom"
        open={isOpenHierarchyDrawerForm}
        size="full"
        sizeHeight="lg"
        closeOnOverlayClick={false}
        drawerClassName="!ui-z-40"
        overlayClassName="!ui-z-30"
      >
        <DrawerHeader className="ui-border">
          <div className="ui-flex ui-justify-between">
            <div />
            <h6 className="ui-text-xl ui-text-primary-800 ui-font-medium">
              {t('orderCreate:drawer.header')}
            </h6>
            <Button
              id={`close-child-drawer`}
              variant="subtle"
              type="button"
              color="neutral"
              onClick={() => handleClose()}
            >
              <XMark />
            </Button>
          </div>
        </DrawerHeader>
        <div className="ui-flex ui-items-center ui-gap-10 ui-px-8 ui-pt-6">
          <div className="ui-max-w-60">
            <h2 className="ui-text-sm ui-font-medium ui-text-neutral-500">
              Material
            </h2>
            <p className="ui-font-bold ui-text-primary-800 ui-mb-1 ui-truncate">
              {selectedMaterialStockData?.material?.name}
            </p>
          </div>
          <div className="ui-max-w-60">
            <h2 className="ui-text-sm ui-font-medium ui-text-neutral-500">
              {t('orderCreate:drawer.stock_on_hand')}
            </h2>
            <p className="ui-font-bold ui-text-primary-800 ui-mb-1">
              {numberFormatter(
                handleValueByFormType(selectedMaterialStockData).total_qty,
                language
              )}
              <span className="ui-text-neutral-500 ui-text-xs ui-font-normal ui-ml-1">
                {minMax(
                  handleValueByFormType(selectedMaterialStockData).min,
                  handleValueByFormType(selectedMaterialStockData).max,
                  language
                )}
              </span>
            </p>
          </div>
          <div className="ui-max-w-60">
            <h2 className="ui-text-sm ui-font-medium ui-text-neutral-500">
              {t('orderCreate:drawer.available_stock')}
            </h2>
            <p className="ui-font-bold ui-text-primary-800 ui-mb-1">
              {numberFormatter(
                handleValueByFormType(selectedMaterialStockData)
                  .total_available_qty,
                language
              )}
            </p>
          </div>
        </div>
        <div className="ui-px-6 ui-py-8  ui-overflow-auto">
          <DataTable
            bodyClassName="ui-p-0"
            columns={columns}
            data={watch('children')}
            isSticky
          />
        </div>
        <DrawerFooter className="ui-border">
          <div
            className={cx('ui-grid ui-w-full', {
              'ui-grid-cols-2': Boolean(errors?.children?.root?.message),
            })}
          >
            {errors?.children?.root?.message && (
              <Alert type="danger" withIcon>
                {errors?.children?.root?.message}
              </Alert>
            )}
            <div className="ui-ml-auto ui-grid ui-grid-cols-2 ui-gap-5">
              <Button
                id={`reset-batch-w}`}
                variant="subtle"
                onClick={() => {
                  const children = watch('children') || []
                  children.forEach((_, index) => {
                    setValue(`children.${index}.ordered_qty`, null)
                  })
                  trigger('children')
                }}
              >
                <div className="ui-flex ui-flex-row ui-text-sm ui-space-x-3 ui-text-primary-600">
                  <Reload className="ui-size-5" />
                  <div>Reset</div>
                </div>
              </Button>

              <Button
                loading={isLoading}
                variant="solid"
                type="submit"
                id={`save-children-w`}
                onClick={handleSubmit(handleSubmitForm)}
              >
                {t('common:save')}
              </Button>
            </div>
          </div>
        </DrawerFooter>
      </Drawer>
    </FormProvider>
  )
}

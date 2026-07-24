import { useRouter } from 'next/router'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Checkbox } from '#components/checkbox'
import { OptionType } from '#components/react-select'
import { Stock } from '#types/stock'
import { numberFormatter } from '#utils/formatter'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { TRANSACTION_TYPE } from '../transaction-create.constant'
import { listStock, listStockConsumptions } from '../transaction-create.service'
import { CreateTransctionForm } from '../transaction-create.type'
import { useTransactionCreateAddStock } from '../TransactionAddStock/hooks/useTransactionCreateAddStock'
import { CreateTransactionAddStock } from '../TransactionAddStock/transaction-add-stock.type'
import { TransactionCreateConsumpution } from '../TransactionConsumption/hooks/useTransactionCreateConsumption'
import { useTransactionCreateDiscard } from '../TransactionDiscard/hooks/useTransactionCreateDiscard'
import { useTransactionCreateRemoveStock } from '../TransactionRemoveStock/hooks/useTransactionCreateRemoveStock'
import useTransactionCreateTransferStock from '../TransactionTransferStock/hooks/useTransactionCreateTransferStock'
import { listStockTransfer } from '../TransactionTransferStock/transaction-transfer-stock.services'

export const useCreateMaterialSelect = ({ search }: { search: string }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation('transactionCreate')
  const { handleAddItemAddStock, handleRemoveMaterialAddStock } =
    useTransactionCreateAddStock()
  const { handleAddItemRemoveStock, handleDeleteItemRemoveStock } =
    useTransactionCreateRemoveStock(t)
  const { handleAddItemDiscard, handleRemoveItemDiscard } =
    useTransactionCreateDiscard()
  const { handleAddItemConsumption, handleRemoveMaterialConsumption } =
    TransactionCreateConsumpution()
  const { handleAddItemTransferStock, handleRemoveMaterialTransferStock } =
    useTransactionCreateTransferStock()
  const { watch } = useFormContext<CreateTransctionForm>()
  const { entity, activity, items, customer, destination_program_id } = watch()
  const { query } = useRouter()
  const { type } = query as { type: string }

  const handleChooseMaterial = (value: Stock) => {
    switch (Number(type)) {
      case TRANSACTION_TYPE.REMOVE_STOCK:
        handleAddItemRemoveStock({ item: value })
        break
      case TRANSACTION_TYPE.ADD_STOCK:
        handleAddItemAddStock({ item: value })
        break
      case TRANSACTION_TYPE.DISCARD:
        handleAddItemDiscard(value)
        break
      case TRANSACTION_TYPE.LAST_MILE:
        handleAddItemConsumption({ item: value })
        break
      case TRANSACTION_TYPE.TRANSFER_STOCK:
        handleAddItemTransferStock({ item: value })
        break
      //...etc
      default:
        break
    }
  }

  const handleRemoveMaterial = (value: Stock) => {
    switch (Number(type)) {
      case TRANSACTION_TYPE.ADD_STOCK:
        handleRemoveMaterialAddStock({ item: value })
        break
      case TRANSACTION_TYPE.LAST_MILE:
        handleRemoveMaterialConsumption({ item: value })
        break
      case TRANSACTION_TYPE.DISCARD:
        handleRemoveItemDiscard(value)
        break
      case TRANSACTION_TYPE.REMOVE_STOCK:
        handleDeleteItemRemoveStock({ item: value })
        break
      case TRANSACTION_TYPE.TRANSFER_STOCK:
        handleRemoveMaterialTransferStock({ item: value })
        break
      //...etc
      default:
        break
    }
  }

  const setDisabledMaterialStockZero = (total: number): boolean => {
    return (
      (Number(type) === TRANSACTION_TYPE.DISCARD ||
        Number(type) === TRANSACTION_TYPE.LAST_MILE ||
        Number(type) === TRANSACTION_TYPE.REMOVE_STOCK ||
        Number(type) === TRANSACTION_TYPE.TRANSFER_STOCK) &&
      total <= 0
    )
  }

  const setDisabledMaterialActivityIsNotAvailable = (item: Stock) => {
    if (
      (Number(type) === TRANSACTION_TYPE.DISCARD ||
        Number(type) === TRANSACTION_TYPE.REMOVE_STOCK) &&
      item
    )
      return item.total_available_qty === 0

    return (
      (Number(type) === TRANSACTION_TYPE.DISCARD ||
        Number(type) === TRANSACTION_TYPE.REMOVE_STOCK) &&
      !item
    )
  }

  const checkStatusMaterial = (item: Stock) => {
    let isChecked = false
    const selectedMaterialId = (
      items as CreateTransactionAddStock['items']
    )?.map((obj) => obj?.material_id)
    const materialId = item?.material?.id
    isChecked = selectedMaterialId?.includes(materialId)
    return isChecked
  }

  const classRow = (item: Stock) => {
    if (
      setDisabledMaterialStockZero(item?.aggregate?.total_available_qty ?? 0) ||
      setDisabledMaterialActivityIsNotAvailable(item)
    ) {
      return 'ui-bg-neutral-300 ui-cursor-not-allowed'
    }
    if (checkStatusMaterial(item)) {
      return 'ui-bg-primary-100'
    }
    return ''
  }

  const generateSchema = [
    {
      accessorKey: 'material.name',
      header: t('table.column.material_name'),
      size: 350,
      meta: {
        cellClassName: ({ original }: any) => classRow(original),
      },
    },
    ...(Number(type) !== TRANSACTION_TYPE.TRANSFER_STOCK
      ? [
          {
            accessorKey: 'details.total_qty',
            header: t('table.column.stock_on_acitvity', {
              activity_name: activity?.label,
            }),
            meta: {
              cellClassName: ({ original }: any) => classRow(original),
            },
            cell: ({ row: { original } }: any) => {
              if (isStockConsumption) {
                const detail = original?.details.find(
                  (i: any) => Number(i.activity.id) === activity?.value
                )
                return detail?.total_qty
                  ? numberFormatter(detail?.total_qty, language)
                  : 0
              }
              return numberFormatter(original?.total_available_qty, language)
            },
          },
        ]
      : []),
    {
      accessorKey: 'total_qty',
      header: t('table.column.total_available_stock'),
      meta: {
        cellClassName: ({ original }: any) => classRow(original),
      },
      cell: ({ row: { original } }: any) => {
        if (isStockConsumption) {
          return original?.total_qty
            ? numberFormatter(original?.total_qty, language)
            : 0
        }
        return numberFormatter(
          original?.aggregate?.total_available_qty,
          language
        )
      },
    },
    {
      accessorKey: 'material',
      header: t('table.column.selection'),
      meta: {
        cellClassName: ({ original }: any) => classRow(original),
      },
      cell: ({ row }: any) => {
        const statusChecked = checkStatusMaterial(row.original)
        return (
          <Checkbox
            checked={statusChecked}
            disabled={
              setDisabledMaterialStockZero(
                row.original.aggregate?.total_available_qty
              ) || setDisabledMaterialActivityIsNotAvailable(row.original)
            }
            value={statusChecked ? 1 : 0}
          />
        )
      },
    },
  ]

  const needCustomerValue = [
    TRANSACTION_TYPE.RETURN_FROM_HEALTH_FACILITIES,
    TRANSACTION_TYPE.LAST_MILE,
  ].includes(Number(type))

  const stockTransferQueryObjects = {
    search,
    entity: entity?.value,
    transaction_type: type,
    destination_program_id: destination_program_id,
  }

  const stockQueryObjects = {
    search,
    entity: entity?.value,
    transaction_type: type,
    activity: (activity as OptionType)?.value,
  }

  const stockNeedCustomerQueryObjects = {
    ...stockQueryObjects,
    customer_id: customer?.value,
  }

  let queryObjects
  if (Number(type) === TRANSACTION_TYPE.TRANSFER_STOCK) {
    queryObjects = stockTransferQueryObjects
  } else if (needCustomerValue) {
    queryObjects = stockNeedCustomerQueryObjects
  } else {
    queryObjects = stockQueryObjects
  }
  const queryKey = ['infinite-scroll-list', 'list-stock', queryObjects]

  let isEnabledFetching = false

  if (Number(type) === TRANSACTION_TYPE.TRANSFER_STOCK) {
    isEnabledFetching = Boolean(entity?.value && type && destination_program_id)
  } else if (needCustomerValue) {
    isEnabledFetching = Boolean(
      entity?.value && activity?.value && type && customer?.value
    )
  } else {
    isEnabledFetching = Boolean(entity?.value && activity?.value && type)
  }

  const isStockConsumption = [
    TRANSACTION_TYPE.RETURN_FROM_HEALTH_FACILITIES,
  ].includes(Number(type))

  const isAddRemoveStock = [
    TRANSACTION_TYPE.ADD_STOCK,
    TRANSACTION_TYPE.REMOVE_STOCK,
  ].includes(Number(type))

  const getQueryFn = ({ pageParam }: { pageParam: number }) => {
    const commonParams = {
      page: pageParam,
      paginate: 10,
      keyword: search,
      ...(needCustomerValue ? { customer_id: customer?.value } : {}),
    }

    if (Number(type) === TRANSACTION_TYPE.TRANSFER_STOCK) {
      return listStockTransfer({
        ...commonParams,
        destination_program_id,
        entity_id: entity?.value,
      })
    }

    if (isStockConsumption) {
      return listStockConsumptions({
        ...commonParams,
        activity_id: (activity as OptionType)?.value,
        vendor_id: entity?.value,
      })
    }

    return listStock({
      ...commonParams,
      material_level_id: 3,
      activity_id: (activity as OptionType)?.value,
      entity_id: entity?.value,
      is_addremove: Number(isAddRemoveStock),
    })
  }

  const { data, fetchNextPage, hasNextPage, isFetching } = useInfiniteQuery({
    queryKey,
    queryFn: getQueryFn,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.page + 1,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    staleTime: 0,
    enabled: isEnabledFetching,
  })

  const handleTitle = () =>
    entity?.label
      ? t('title_material_select', { entity_name: entity.label.toUpperCase() })
      : 'Material'
  const stocks =
    (needCustomerValue && !!customer) || !needCustomerValue
      ? data?.pages.map((page) => page.data).flat()
      : []

  return {
    handleChooseMaterial,
    generateSchema,
    stocks,
    fetchNextPage,
    hasNextPage,
    isFetching,
    handleTitle,
    checkStatusMaterial,
    handleRemoveMaterial,
    setDisabledMaterialStockZero,
    setDisabledMaterialActivityIsNotAvailable,
    type,
    TRANSACTION_TYPE,
  }
}

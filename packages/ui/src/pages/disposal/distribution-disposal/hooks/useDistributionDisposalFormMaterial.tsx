import { useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Checkbox } from '#components/checkbox'
import { KfaLevelEnum } from '#constants/material'
import { numberFormatter } from '#utils/formatter'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { listStockExtermination } from '../services/distribution-disposal'
import {
  DisposalDetailItemStock,
  DisposalDetailStock,
  DisposalItemStockDetail,
  DistributionDisposalForm,
  DistributionDisposalOrderItemForm,
  ListStockExtermination,
} from '../types/DistributionDisposal'

export const useDistributionDisposalFormMaterial = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'distributionDisposal'])

  const { watch, setValue } = useFormContext<DistributionDisposalForm>()
  const { activity, order_items, sender } = watch()
  const isEnabledFetching = Boolean(sender?.value && activity?.value)

  const [search, setSearch] = useState('')

  const queryKey = [
    'infinite-scroll-list',
    'list-stock-exterminations',
    search,
    activity,
    sender,
  ]

  const setDataStock = (item: DisposalDetailItemStock | undefined) =>
    item?.stocks?.map((x) => ({
      activity_id: Number(activity?.value),
      activity_name: activity?.label ?? '',
      batch: x.batch
        ? {
            code: x.batch.code,
            id: x.batch.id,
            manufacture_name: x.batch.manufacture?.name || '',
            expired_date: x.batch.expired_date || '',
            production_date: x.batch.production_date || '',
          }
        : undefined,
      stock_id: x.id,
      stock_qty: x.disposal_qty,
      extermination_discard_qty: x.disposal_discard_qty,
      extermination_received_qty: x.disposal_received_qty,
      stock_exterminations: x.disposals.map((y) => ({
        pieces_per_unit: item?.material?.consumption_unit_per_distribution_unit,
        discard_qty: undefined,
        received_qty: undefined,
        stock_extermination_id: y.disposal_stock_id,
        transaction_reason_id: y.transaction_reason?.id || '',
        transaction_reason_title: y.transaction_reason?.title || '',
        transaction_reason_title_en: y.transaction_reason?.title_en || '',
        extermination_discard_qty: y.disposal_discard_qty,
        extermination_received_qty: y.disposal_received_qty,
      })),
    }))

  const handleChooseMaterial = (itemStock: DisposalItemStockDetail) => {
    const isExist = order_items.some(
      (x) => x.material_id === itemStock.material.id
    )

    if (isExist) {
      const newOrderItems = order_items.filter(
        (x) => x.material_id !== itemStock.material.id
      )

      setValue('order_items', newOrderItems)
    } else {
      const currentActivityStock = itemStock?.details?.[0]
      const stocks: DisposalDetailStock[] = setDataStock(currentActivityStock)
      const newOrderItems: DistributionDisposalOrderItemForm[] = [
        ...order_items,
        {
          material_id: itemStock.material.id,
          material_name: itemStock.material.name,
          managed_in_batch: itemStock?.material?.is_managed_in_batch,
          activity_name: activity?.label || '-',
          ordered_qty:
            Number(currentActivityStock?.disposal_discard_qty) +
            Number(currentActivityStock?.disposal_received_qty),
          stocks: stocks,
          is_valid: false,
        },
      ]
      setValue('order_items', newOrderItems)
    }
  }

  const checkStatusMaterial = (item: ListStockExtermination) => {
    let isChecked = false
    const selectedMaterialId = order_items?.map((obj) => obj?.material_id)
    const materialId = item?.material?.id
    isChecked = selectedMaterialId?.includes(materialId)
    return isChecked
  }

  const classRow = (item: ListStockExtermination) => {
    if (checkStatusMaterial(item)) {
      return 'ui-bg-primary-100'
    }
    return ''
  }

  const generateSchema: any = [
    {
      accessorKey: 'material.name',
      header: t('distributionDisposal:table_material.column.material'),
      meta: {
        cellClassName: ({ original }: any) => classRow(original),
      },
    },
    {
      accessorKey: 'details.total_qty',
      header: t('distributionDisposal:table_material.column.stock_disposal', {
        activity: activity?.label,
      }),
      meta: {
        cellClassName: ({ original }: any) => classRow(original),
      },
      cell: ({ row: { original } }: any) => {
        const selectedStock = original
        return (
          <>
            {numberFormatter(
              Number(selectedStock?.total_disposal_discard_qty) +
                Number(selectedStock?.total_disposal_received_qty),
              language
            )}
          </>
        )
      },
    },
    {
      accessorKey: 'material',
      header: t('distributionDisposal:table_material.column.selection'),
      meta: {
        cellClassName: ({ original }: any) => classRow(original),
      },
      cell: ({ row }: any) => {
        const statusChecked = checkStatusMaterial(row.original)
        return (
          <Checkbox checked={statusChecked} value={statusChecked ? 1 : 0} />
        )
      },
    },
  ]

  const { data, fetchNextPage, hasNextPage, isFetching } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) =>
      listStockExtermination({
        page: pageParam,
        paginate: 100,
        keyword: search,
        flow_id: 1,
        only_have_qty: 1,
        activity_id: activity?.value,
        entity_id: sender?.value,
        material_level_id: KfaLevelEnum.KFA_93,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => Number(lastPage.page) + 1,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    staleTime: 0,
    enabled: isEnabledFetching,
  })

  return {
    t,
    handleChooseMaterial,
    generateSchema,
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    checkStatusMaterial,
    search,
    setSearch,
    senderName: sender?.label || '',
  }
}

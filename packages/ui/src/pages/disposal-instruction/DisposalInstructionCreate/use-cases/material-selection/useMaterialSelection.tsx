import { useMemo, useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '#components/checkbox'
import { KfaLevelEnum } from '#constants/material'
import cx from '#lib/cx'
import { numberFormatter } from '#utils/formatter'
import { useFieldArray } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { listStockExtermination } from '../../../../disposal/distribution-disposal/services/distribution-disposal'
import { DisposalInstructionCreateFormValues } from '../../disposal-instruction-create.type'
import { useDisposalInstructionCreate } from '../../DisposalInstructionCreateContext'
import useMaterialSelectionStore from './material-selection.store'
import { SelectedMaterial } from './material-selection.type'

export const useMaterialSelection = () => {
  const { i18n, t } = useTranslation(['disposalInstructionCreate'])

  const disposalInstructionCreate = useDisposalInstructionCreate()

  const materialSelectionStore = useMaterialSelectionStore()

  const disposalItemFieldArray = useFieldArray({
    control: disposalInstructionCreate.form.methods.control,
    name: 'disposal_items',
  })

  const disposalItems =
    disposalInstructionCreate.form.methods.watch('disposal_items') ?? []

  const [searchValue, setSearchValue] = useState('')

  const query = useInfiniteQuery({
    queryKey: [
      'infinite-scroll-list',
      'list-stock',
      {
        search: searchValue,
        entity_id:
          disposalInstructionCreate.form.methods.getValues('entity.value'),
      },
    ],
    queryFn: ({ pageParam }) =>
      listStockExtermination({
        page: pageParam,
        paginate: 100,
        keyword: searchValue,
        flow_id: 1,
        only_have_qty: 1,
        activity_id:
          disposalInstructionCreate.form.methods.watch('activity.value'),
        entity_id: disposalInstructionCreate.form.methods.watch('entity.value'),
        material_level_id: KfaLevelEnum.KFA_93,
      }),
    initialPageParam: 1,
    getNextPageParam: ({ page, total_page }) => {
      return total_page !== 0 && page !== total_page ? page + 1 : undefined
    },
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    enabled: Boolean(
      disposalInstructionCreate.form.methods.getValues('entity') &&
        disposalInstructionCreate.form.methods.getValues('activity')
    ),
  })

  const handleSelectMaterial = (value: SelectedMaterial) => {
    const isSelected = materialSelectionStore.selectedMaterials.some(
      (selectedMaterial) => selectedMaterial.material?.id === value.material.id
    )

    if (isSelected) {
      handleRemoveMaterial(value.material_id)
    } else {
      const stocks = value.details.flatMap((stockDetail) => stockDetail.stocks)

      materialSelectionStore.addMaterial(value)
      disposalItemFieldArray.append({
        material: value.material,
        qty:
          value.total_disposal_discard_qty + value.total_disposal_received_qty,
        stocks: stocks.map((stock) => ({
          activity: stock.activity,
          batch: stock.batch,
          stock_id: stock.id,
          stock_qty: stock.disposal_discard_qty + stock.disposal_received_qty,
          disposal_stocks: stock.disposals.map(
            (disposal): DisposalInstructionCreateFormValues.DisposalStock => ({
              discard_qty: null,
              received_qty: null,
              disposal_discard_qty: disposal.disposal_discard_qty,
              disposal_received_qty: disposal.disposal_received_qty,
              disposal_stock_id: disposal.disposal_stock_id,
              consumption_unit_per_distribution_unit:
                value.material.consumption_unit_per_distribution_unit,
              transaction_reasons: disposal.transaction_reason,
            })
          ),
        })),
      })
    }
  }

  const handleRemoveMaterial = (materialId: number) => {
    const index = disposalItems.findIndex(
      (disposalItem) => disposalItem.material?.id === materialId
    )

    materialSelectionStore.removeMaterial(materialId)
    disposalItemFieldArray.remove(index)
  }

  const handleRemoveAllMaterial = () => {
    disposalItemFieldArray.replace([])
    materialSelectionStore.removeAllMaterial()
  }

  const flattenedData = query.data?.pages.flatMap((page) => page?.data) || []
  const totalData = query.data?.pages.map((page) => page?.total_item)?.[0] || 0

  let columns: ColumnDef<SelectedMaterial>[] = useMemo(
    () => [
      {
        accessorKey: 'material.name',
        header: t('disposalInstructionCreate:table.column.material_name'),
        size: 200,
      },
      {
        accessorKey: 'stock_qty',
        header: t('disposalInstructionCreate:table.column.stock_qty_on', {
          activity:
            disposalInstructionCreate.form.methods.getValues('activity.label'),
        }),
        size: 100,
        cell: ({ row }) => {
          return numberFormatter(
            Number(row.original?.total_disposal_discard_qty) +
              Number(row.original?.total_disposal_received_qty),
            i18n.language
          )
        },
      },
      {
        accessorKey: 'selection',
        header: t('disposalInstructionCreate:table.column.selection'),
        size: 50,
        meta: {
          headerClassName: 'ui-text-center',
          cellClassName: 'ui-text-center',
        },
        cell: ({ row }) => {
          const isSelected = materialSelectionStore.selectedMaterials.some(
            (selectedMaterial) =>
              selectedMaterial.material?.id === row.original?.material?.id
          )

          return (
            <Checkbox
              checked={isSelected}
              className="!ui-cursor-pointer"
              size="sm"
              value={false ? 1 : 0}
              onChange={() => {}}
            />
          )
        },
      },
    ],
    [
      disposalInstructionCreate.form.methods,
      materialSelectionStore.selectedMaterials,
    ]
  )

  columns = columns.map((column) => ({
    ...column,
    meta: {
      ...column.meta,
      cellClassName: (row) => {
        const isSelected = materialSelectionStore.selectedMaterials.some(
          (selectedMaterial) =>
            selectedMaterial.material?.id === row.original.material?.id
        )
        return cx(column.meta?.cellClassName, {
          'ui-bg-primary-100/40': isSelected,
        })
      },
    },
  }))

  return {
    enabled: disposalInstructionCreate.form.isDisposalDetailFilled,
    query,
    table: {
      data: flattenedData,
      total: totalData,
      columns: columns,
    },
    selectedMaterials: materialSelectionStore.selectedMaterials,
    searchMaterial: setSearchValue,
    selectMaterial: handleSelectMaterial,
    removeMaterial: handleRemoveMaterial,
    removeAllMaterial: handleRemoveAllMaterial,
  }
}

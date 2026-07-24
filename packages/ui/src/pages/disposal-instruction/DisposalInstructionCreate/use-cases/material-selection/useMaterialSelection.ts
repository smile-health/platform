import { useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { KfaLevelEnum } from '#constants/material'
import cx from '#lib/cx'
import { useFieldArray, UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { listStockExtermination } from '../../../../disposal/distribution-disposal/services/distribution-disposal'
import {
  DisposalInstructionCreateFormValues,
  DisposalInstructionCreateSelectedMaterial,
} from '../../disposal-instruction-create.type'
import { materialSelectionTableSchema } from './material-selection-table.schema'

export const useMaterialSelection = (
  form: UseFormReturn<DisposalInstructionCreateFormValues>
) => {
  const { i18n, t } = useTranslation(['disposalInstructionCreate'])

  const { append, remove } = useFieldArray({
    control: form.control,
    name: 'selected_materials',
  })

  const selectedMaterials = form.watch('selected_materials') ?? []

  const [searchValue, setSearchValue] = useState('')

  const query = useInfiniteQuery({
    queryKey: [
      'infinite-scroll-list',
      'list-stock',
      { search: searchValue, entity_id: form.getValues('entity.value') },
    ],
    queryFn: ({ pageParam }) =>
      listStockExtermination({
        page: pageParam,
        paginate: 100,
        keyword: searchValue,
        flow_id: 1,
        only_have_qty: 1,
        activity_id: form.watch('activity.value'),
        entity_id: form.watch('entity.value'),
        material_level_id: KfaLevelEnum.KFA_93,
      }),
    initialPageParam: 1,
    getNextPageParam: ({ page, total_page }) => {
      return total_page !== 0 && page !== total_page ? page + 1 : undefined
    },
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    enabled: Boolean(form.getValues('entity') && form.getValues('activity')),
  })

  const handleSelectMaterial = (
    value: DisposalInstructionCreateSelectedMaterial
  ) => {
    const selectedMaterialIndex = selectedMaterials.findIndex(
      (selectedMaterial) => selectedMaterial.material?.id === value.material?.id
    )

    const isSelected = selectedMaterials.some(
      (selectedMaterial) => selectedMaterial.material?.id === value.material?.id
    )

    if (isSelected) {
      remove(selectedMaterialIndex)
    } else {
      append(value)
    }
  }

  const flattenedData = query.data?.pages.map((page) => page?.data).flat() || []
  const totalItems = query.data?.pages.map((page) => page?.total_item)?.[0] || 0

  let columns = materialSelectionTableSchema(t, i18n.language, {
    selectedMaterials,
    selectedActivity: form.watch('activity'),
  })

  columns = columns.map((column) => ({
    ...column,
    meta: {
      ...column.meta,
      cellClassName: (row) => {
        const isSelected = selectedMaterials.some(
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
    query,
    searchMaterial: setSearchValue,
    materialList: {
      data: flattenedData,
      total: totalItems,
    },
    columns,
    selectedMaterials,
    removeSelected: remove,
    removeAllSelected: () => form.setValue('selected_materials', []),
    selectMaterial: handleSelectMaterial,
  }
}

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSetExportPopupStore } from '#hooks/useSetExportPopup'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { TProgram } from '#types/program'

import { exportTransactions } from '../../transaction.services'
import { MATERIAL_LEVEL } from '../helpers/transaction-list.constant'
import { BOOLEAN } from '#constants/common'

type Props = {
  filter: Record<string, any>
  program: TProgram
}

export const useTransactionListExport = ({ filter, program }: Props) => {
  const filterQueryKey = useMemo(() => {
    const { material_level_id, material_id, ...query } = filter.query
    query.is_order = Number(filter.query?.is_order) ? null : BOOLEAN.FALSE
    if (
      Number(material_level_id?.value) === MATERIAL_LEVEL.TEMPLATE &&
      program?.config?.material?.is_hierarchy_enabled
    ) {
      query.parent_material_id = material_id
    } else if (
      Number(material_level_id?.value) !== MATERIAL_LEVEL.TEMPLATE ||
      !program?.config?.material?.is_hierarchy_enabled
    ) {
      query.material_id = material_id
    } else {
      query.material_id = material_id
    }
    return query
  }, [filter.query])

  const queryKeyExport = ['export-transaction', filterQueryKey]
  const exportQuery = useQuery({
    queryKey: queryKeyExport,
    queryFn: () => exportTransactions(filterQueryKey),
    enabled: false,
  })

  useSetLoadingPopupStore(exportQuery.isLoading || exportQuery.isFetching)
  useSetExportPopupStore(exportQuery.isSuccess,queryKeyExport)

  return {
    exportQuery,
  }
}

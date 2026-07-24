import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BOOLEAN } from '#constants/common'
import { TProgram } from '#types/program'
import { ITransactionCursorPaginationParams } from '#types/cursor-pagination'
import { useTranslation } from 'react-i18next'

import { exportTransactionsCursor } from '../../transaction-cursor.services'
import { MATERIAL_LEVEL } from '../helpers/transaction-list.constant'

type Props = {
  filter: { query: Record<string, any> }
  program: TProgram
}

export const useTransactionListCursorExport = ({
  filter,
  program,
}: Props) => {
  const {
    i18n: { language },
  } = useTranslation(['common', 'transactionList'])
  
  const filterQueryKey = useMemo(() => {
    const { material_id, material_level_id, date_range, ...query } =
      filter.query
    query.is_order = Number(filter.query?.is_order) ? null : BOOLEAN.FALSE
    return {
      ...query,
      parent_material_id:
        program?.config?.material?.is_hierarchy_enabled &&
        Number(material_level_id?.value) === MATERIAL_LEVEL.TEMPLATE
          ? material_id?.value
          : null,
      material_id:
        !program?.config?.material?.is_hierarchy_enabled ||
        Number(material_level_id?.value) !== MATERIAL_LEVEL.TEMPLATE
          ? material_id?.value
          : null,
      start_date: date_range?.start?.toString(),
      end_date: date_range?.end?.toString(),
    }
  }, [filter.query, program])

  const queryParams: Omit<ITransactionCursorPaginationParams, 'limit' | 'cursor'> = useMemo(() => ({
    ...filterQueryKey,
  }), [filterQueryKey])

  const exportQuery = useQuery({
    queryKey: ['export-transaction-cursor', queryParams, language],
    queryFn: () => exportTransactionsCursor(queryParams),
    enabled: false, // Only run when manually triggered
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })

  return {
    exportQuery,
  }
}
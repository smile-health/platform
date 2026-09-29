import React from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '#components/button'
import useSmileRouter from '#hooks/useSmileRouter'
import { listAuditLogs, TAuditLog } from '#services/audit-log'
import { usePermission } from '#shared/permission/index'
import { parseAsInteger, useQueryStates, Values } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { formatAuditDateTime, handleFilterParams } from '../audit-trail.helper'

type UseAuditTrailTableParams = {
  filter: Values<Record<string, any>>
  onViewDetail?: (item: TAuditLog) => void
}

export default function useAuditTrailTable({
  filter,
  onViewDetail,
}: UseAuditTrailTableParams) {
  const { t } = useTranslation(['auditTrail', 'common'])
  const { isReady } = useSmileRouter()
  const isPermitted = usePermission('audit-trail-view')
  const [{ page, paginate }, setPagination] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      paginate: parseAsInteger.withDefault(10),
    },
    {
      history: 'push',
    }
  )

  const currentFilter = handleFilterParams({
    ...filter,
    page,
    paginate,
  })

  const tableColumns: Array<ColumnDef<TAuditLog>> = [
    {
      header: 'No.',
      accessorKey: 'no',
      size: 20,
      maxSize: 100,
      cell: ({ row }) => (page - 1) * paginate + (row?.index + 1),
    },
    {
      header: t('auditTrail:column.created_at'),
      accessorKey: 'created_at',
      size: 100,
      minSize: 100,
      cell: ({ row }) =>
        formatAuditDateTime(row?.original?.created_at),
    },
    {
      header: t('auditTrail:column.actor'),
      accessorKey: 'actor_name',
      size: 100,
      minSize: 100,
      cell: ({ row }) => row?.original?.actor_name || '-',
    },
    {
      header: t('auditTrail:column.service'),
      accessorKey: 'service',
      size: 80,
      minSize: 80,
      cell: ({ row }) => row?.original?.service || '-',
    },
    {
      header: t('auditTrail:column.module'),
      accessorKey: 'module',
      size: 100,
      minSize: 100,
    },
    {
      header: t('auditTrail:column.action'),
      accessorKey: 'action',
      size: 80,
      minSize: 80,
    },
    {
      header: t('auditTrail:column.entity_id'),
      accessorKey: 'entity_id',
      size: 80,
      minSize: 80,
      cell: ({ row }) => row?.original?.entity_id ?? '-',
    },
    {
      header: t('auditTrail:column.detail'),
      id: 'detail',
      size: 80,
      minSize: 80,
      cell: ({ row }) => (
        <Button
          type="button"
          variant="subtle"
          size="sm"
          onClick={() => onViewDetail?.(row.original)}
        >
          {t('auditTrail:action.view_detail')}
        </Button>
      ),
    },
  ]

  const { data, isFetching } = useQuery({
    queryKey: ['audit-logs', currentFilter],
    queryFn: () => listAuditLogs(currentFilter),
    placeholderData: keepPreviousData,
    enabled: isPermitted && isReady,
  })

  const handleChangePage = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const handleChangePaginate = (paginate: number) => {
    setPagination((prev) => ({ ...prev, paginate }))
    handleChangePage(1)
  }

  return {
    page,
    paginate,
    tableColumns,
    dataSource: data,
    isLoading: isFetching,
    handleChangePage,
    handleChangePaginate,
  }
}

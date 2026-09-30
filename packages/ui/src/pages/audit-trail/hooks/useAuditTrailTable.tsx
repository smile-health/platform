import React from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '#components/button'
import useSmileRouter from '#hooks/useSmileRouter'
import { listAuditLogs, TAuditLog } from '#services/audit-log'
import { usePermission } from '#shared/permission/index'
import { parseAsInteger, useQueryStates, Values } from 'nuqs'
import { useTranslation } from 'react-i18next'

import {
  describeAuditLog,
  formatAuditDateTime,
  handleFilterParams,
} from '../audit-trail.helper'

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
      header: t('auditTrail:column.description'),
      id: 'description',
      size: 200,
      minSize: 160,
      cell: ({ row }) => {
        const { summary, changes } = describeAuditLog(row.original, t)
        const fields = changes.slice(0, 3).map((change) => change.field)
        const rest = changes.length - fields.length
        return (
          <div>
            <div className="ui-font-semibold">{summary}</div>
            {fields.length > 0 && (
              <div className="ui-line-clamp-2 ui-text-sm ui-text-neutral-500">
                {fields.join(', ')}
                {rest > 0 &&
                  ` ${t('auditTrail:description.more', { count: rest })}`}
              </div>
            )}
          </div>
        )
      },
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

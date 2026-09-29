import React, { useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import {
  listWasteBagAuditTrail,
  WasteBagAuditTrailItem,
} from '#services/waste-bag-audit-trail'
import { usePermission } from '#shared/permission/index'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

export default function useWasteBagAuditTrailTable() {
  const { t } = useTranslation(['auditTrail', 'common'])
  const isPermitted = usePermission('audit-trail-view')
  const [page, setPage] = useState(1)
  const [paginate, setPaginate] = useState(10)
  const [search, setSearch] = useState('')

  const tableColumns: Array<ColumnDef<WasteBagAuditTrailItem>> = [
    {
      header: 'No.',
      accessorKey: 'no',
      size: 20,
      maxSize: 100,
      cell: ({ row }) => (page - 1) * paginate + (row?.index + 1),
    },
    {
      header: t('auditTrail:column.created_at'),
      accessorKey: 'createdAt',
      size: 100,
      minSize: 100,
      cell: ({ row }) =>
        row?.original?.createdAt
          ? dayjs(row?.original?.createdAt).format('DD/MM/YYYY HH:mm')
          : '-',
    },
    {
      header: t('auditTrail:column.actor'),
      accessorKey: 'updatedBy',
      size: 100,
      minSize: 100,
      cell: ({ row }) => row?.original?.updatedBy || '-',
    },
    {
      header: t('auditTrail:column.wms_waste_bag'),
      accessorKey: 'wasteBagId',
      size: 100,
      minSize: 100,
    },
    {
      header: t('auditTrail:column.action'),
      accessorKey: 'event',
      size: 80,
      minSize: 80,
    },
    {
      header: t('auditTrail:column.wms_status'),
      accessorKey: 'wasteBagStatus',
      size: 100,
      minSize: 100,
      cell: ({ row }) =>
        [row?.original?.wasteBagStatus, row?.original?.transportStatus]
          .filter(Boolean)
          .join(' / ') || '-',
    },
    {
      header: t('auditTrail:column.wms_source'),
      accessorKey: 'source',
      size: 80,
      minSize: 80,
    },
  ]

  const { data, isFetching } = useQuery({
    queryKey: ['waste-bag-audit-trail', page, paginate, search],
    queryFn: () =>
      listWasteBagAuditTrail({
        page,
        limit: paginate,
        search: search || undefined,
      }),
    placeholderData: keepPreviousData,
    enabled: isPermitted,
  })

  const handleChangePage = (nextPage: number) => {
    setPage(nextPage)
  }

  const handleChangePaginate = (nextPaginate: number) => {
    setPaginate(nextPaginate)
    setPage(1)
  }

  const handleChangeSearch = (nextSearch: string) => {
    setSearch(nextSearch)
    setPage(1)
  }

  return {
    page,
    paginate,
    search,
    tableColumns,
    dataSource: data,
    isLoading: isFetching,
    handleChangePage,
    handleChangePaginate,
    handleChangeSearch,
  }
}

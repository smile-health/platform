import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '#components/button'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { parseDateTime } from '#utils/date'
import { numberFormatter } from '#utils/formatter'
import { parseAsInteger, useQueryStates, Values } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { getSelfDisposalilter } from '../self-disposal.helper'
import { listSelfDisposal } from '../self-disposal.service'
import { SelfDisposalItem } from '../self-disposal.type'

export const useSelfDisposalList = (query: Values<Record<string, any>>) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['selfDisposal', 'common'])
  const [{ page, paginate }, setPagination] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      paginate: parseAsInteger.withDefault(10),
    },
    {
      history: 'push',
    }
  )

  const filterParams = getSelfDisposalilter(false, { page, paginate, ...query })
  const handleChangePage = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const handleChangePaginate = (paginate: number) => {
    setPagination((prev) => ({ ...prev, paginate }))
  }

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['self-disposal-list', filterParams, language],
    queryFn: () => listSelfDisposal(filterParams),
  })

  useSetLoadingPopupStore(isLoading || isFetching)

  const [showDetail, setShowDetail] = useState(false)
  const [detail, setDetail] = useState<null | SelfDisposalItem>(null)

  const tableColumns: Array<ColumnDef<SelfDisposalItem>> = [
    {
      header: 'No',
      accessorKey: 'no',
      cell: ({ row: { index } }) => (page - 1) * paginate + (index + 1),
    },
    {
      header: t('table.entity'),
      accessorKey: 'entity',
      cell: ({ row }) => row.original?.entity?.name ?? '',
    },
    {
      header: t('table.material_info'),
      accessorKey: 'material',
      size: 280,
      cell: ({ row }) => (
        <div className="ui-space-y-1.5">
          <div className="ui-text-dark-blue ui-font-semibold">{row.original?.material?.name}</div>
          <div className="ui-text-gray-800 ui-space-x-1">
            <span>{t('table.transaction_reason')}:</span>
            <span>
              {row.original?.transaction_reason?.title || '-'}
            </span>
          </div>
          <div className="ui-text-gray-500 ui-space-x-1">
            <span>{t('table.activity')}:</span>
            <span>{row.original?.activity.name}</span>
          </div>
        </div>
      ),
    },
    {
      header: t('table.self_disposal_info'),
      accessorKey: 'transaction_reason',
      cell: ({ row }) => (
        <div className="ui-space-y-1.5">
          <div className='ui-font-semibold ui-text-dark-blue ui-space-x-1'>
            <span>{t('table.disposal_number')}:</span>
            <span>{row.original.id ? `PMM-${row.original.id}` : '-'}</span>
          </div>
          <div className='ui-space-x-1 ui-text-gray-800'>
            <span>{t('table.self_disposal_qty')}:</span>
            <span>{numberFormatter(Math.abs(row.original.change_qty), language)}</span>
          </div>
          <div className='ui-text-gray-500 ui-space-x-1'>
            <span>{t('table.disposal_method')}:</span>
            <span>{row.original.disposal_method.title}</span>
          </div>
        </div>
      ),
    },
    {
      header: t('table.opening_stock'),
      accessorKey: 'opening_stock',
      cell: ({ row }) => numberFormatter(row.original?.opening_qty, language) || '-',
    },

    {
      header: t('table.closing_stock'),
      accessorKey: 'closing_stock',
      cell: ({ row }) => numberFormatter(row.original?.closing_qty, language) || '-',
    },

    {
      header: t('table.created_by'),
      accessorKey: 'created_by',
      size: 180,
      cell: ({ row }) => {
        return (
          <div className="ui-space-y-1.5">
            <div>{row.original.user_created.fullname}</div>
            <div>
              {parseDateTime(
                row.original?.created_at,
                'DD/MM/YYYY HH:mm',
                language
              ) || '-'}
            </div>
          </div>
        )
      },
    },
    {
      header: t('common:action'),
      accessorKey: 'created_at',
      size: 120,
      cell: ({ row }) => (
        <div>
          <Button
            variant="subtle"
            type="button"
            onClick={() => {
              setDetail(row.original)
              setShowDetail(true)
            }}
          >
            {t('table.see_batch')}
          </Button>
        </div>
      ),
    },
  ]

  return {
    page,
    paginate,
    handleChangePage,
    handleChangePaginate,
    tableColumns,
    showDetail,
    setShowDetail,
    detail,
    data,
  }
}

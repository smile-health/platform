import { useEffect, useMemo, useState } from 'react'
import { ColumnDef, SortingState } from '@tanstack/react-table'
import { ButtonActionTable } from '#components/modules/ButtonActionTable'
import { hasPermission } from '#shared/permission/index'
import { getFullName } from '#utils/strings'
import dayjs from 'dayjs'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { TAnnualCommitmentData } from '../../annual-commitment-list.service'

const useAnnualCommitmentListTable = () => {
  const { t } = useTranslation('annualCommitmentList')

  const [pagination, setPagination] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      paginate: parseAsInteger.withDefault(10),
    },
    {
      history: 'push',
    }
  )

  const [querySorting, setQuerySorting] = useQueryStates(
    {
      sort_by: parseAsString.withDefault(''),
      sort_type: parseAsString.withDefault(''),
    },
    {
      history: 'push',
    }
  )

  const [sorting, setSorting] = useState<SortingState>(
    querySorting?.sort_by
      ? [
          {
            desc: querySorting?.sort_type === 'desc',
            id: querySorting?.sort_by,
          },
        ]
      : []
  )

  useEffect(() => {
    setQuerySorting(
      sorting.length
        ? {
            sort_by: sorting[0].id,
            sort_type: sorting[0].desc ? 'desc' : 'asc',
          }
        : { sort_by: null, sort_type: null }
    )
  }, [sorting])

  const columns: ColumnDef<TAnnualCommitmentData>[] = useMemo(
    () => [
      {
        header: t('table.column.no'),
        accessorKey: 'number',
        size: 50,
        minSize: 50,
        cell: ({ row }) => {
          return (pagination.page - 1) * pagination.paginate + (row.index + 1)
        },
      },
      {
        header: t('table.column.contract_number'),
        accessorKey: 'contract_number',
        size: 200,
        minSize: 150,
        cell: ({ row }) => row.original.contract.number ?? '-',
      },
      {
        header: t('table.column.year'),
        accessorKey: 'year',
        size: 100,
        minSize: 80,
      },
      {
        header: t('table.column.material'),
        accessorKey: 'material',
        size: 300,
        minSize: 250,
        cell: ({ row }) => {
          const names = (row.original.items ?? [])
            .map((item) => item?.material?.name ?? '')
            .filter(Boolean)
          const materialName = Array.from(new Set(names))
          return materialName.length ? materialName.join(', ') : '-'
        },
      },
      {
        header: t('table.column.supplier'),
        accessorKey: 'supplier',
        size: 150,
        minSize: 100,
        cell: ({ row }) => row.original.vendor.name ?? '-',
      },
      {
        header: t('table.column.lastUpdatedAt'),
        accessorKey: 'updated_at',
        size: 180,
        minSize: 150,
        enableSorting: true,
        cell: ({ row }) => {
          const item = row.original
          return (
            <div className="ui-space-y-1">
              <div>
                {dayjs(item.updated_at)
                  .format('DD MMM YYYY HH:mm')
                  .toUpperCase()}
              </div>
              <div className="ui-text-gray-500">
                {getFullName(item.user_updated_by?.fullname)}
              </div>
            </div>
          )
        },
      },
      {
        header: t('table.column.action'),
        accessorKey: 'action',
        size: 150,
        minSize: 150,
        cell: ({ row }) => {
          const item = row.original
          return (
            <ButtonActionTable
              id={item.id}
              path="annual-commitment"
              hidden={
                !hasPermission('annual-commitment-mutate')
                  ? ['edit', 'activation']
                  : ['activation']
              }
            />
          )
        },
        meta: {
          cellClassName: 'ui-text-center',
        },
      },
    ],
    [t, pagination.page, pagination.paginate]
  )

  return {
    columns,
    pagination: {
      page: pagination.page,
      paginate: pagination.paginate,
      update: setPagination,
    },
    querySorting: {
      querySorting,
      setQuerySorting,
    },
    sorting: {
      sorting,
      setSorting,
    },
  }
}

export default useAnnualCommitmentListTable

import { useEffect, useMemo, useState } from 'react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid'
import { ColumnDef, SortingState } from '@tanstack/react-table'
import {
  TooltipContent,
  TooltipRoot,
  TooltipTrigger,
} from '#components/tooltip'
import useSmileRouter from '#hooks/useSmileRouter'
import { numberFormatter } from '#utils/formatter'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { getCapacityColor } from '../../../cold-storage-capacity.utils'
import { ColdStorageCapacityListItem } from '../../cold-storage-capacity-list.type'

const useColdStorageCapacityTable = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation('coldStorageCapacity')
  const router = useSmileRouter()

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

  const columns: ColumnDef<ColdStorageCapacityListItem>[] = useMemo(
    () => [
      {
        header: t('table.column.no'),
        accessorKey: 'number',
        size: 60,
        minSize: 60,
        cell: ({ row }) => {
          return (pagination.page - 1) * pagination.paginate + (row.index + 1)
        },
        meta: {
          cellClassName: 'ui-text-center',
        },
      },
      {
        header: t('table.column.entityName'),
        accessorKey: 'name',
        enableSorting: true,
        size: 250,
        minSize: 200,
        cell: ({ row }) => {
          const item = row.original
          return <div>{item.name}</div>
        },
      },
      {
        header: t('table.column.totalUtilizationVolume'),
        accessorKey: 'total_volume',
        enableSorting: true,
        size: 200,
        minSize: 180,
        meta: {
          cellClassName: 'ui-text-left',
        },
      },
      {
        header: t('table.column.coldStorageNetCapacity'),
        accessorKey: 'volume_asset',
        enableSorting: true,
        size: 220,
        minSize: 200,
        meta: {
          cellClassName: 'ui-text-left',
        },
        cell: ({ row }) => {
          const item = row.original
          return <div>{numberFormatter(item.volume_asset, language)}</div>
        },
      },
      {
        header: t('table.column.capacityUtilization'),
        accessorKey: 'percentage_capacity',
        enableSorting: true,
        size: 180,
        minSize: 150,
        cell: ({ row }) => {
          const percentage = row.original.percentage_capacity
          const colorClass = getCapacityColor(percentage)
          const showWarning = percentage > 100

          return (
            <div className="ui-flex ui-items-center ui-gap-2">
              <span className={colorClass}>{percentage.toFixed(1)}%</span>
              {showWarning && (
                <TooltipRoot delayDuration={100}>
                  <TooltipTrigger>
                    <div>
                      <ExclamationTriangleIcon
                        fill="none"
                        stroke="red"
                        strokeWidth={2}
                        className="ui-size-4"
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent color="dark" className="ui-z-50" side="right">
                    {t('tooltip.capacityWarning')}
                  </TooltipContent>
                </TooltipRoot>
              )}
            </div>
          )
        },
        meta: {
          cellClassName: 'ui-text-left',
        },
      },
      {
        header: t('table.column.action'),
        accessorKey: 'action',
        size: 100,
        minSize: 100,
        cell: ({ row }) => {
          const item = row.original
          return (
            <button
              onClick={() =>
                router.pushGlobal(`/v5/cold-storage-capacity/${item.id}`)
              }
              className="ui-text-primary-500 hover:ui-underline"
            >
              {t('button.detail')}
            </button>
          )
        },
        meta: {
          cellClassName: 'ui-text-center',
        },
      },
    ],
    [t, pagination.page, pagination.paginate, router.basePath]
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

export default useColdStorageCapacityTable

import { useEffect, useMemo, useState } from 'react'
import { ColumnDef, SortingState } from '@tanstack/react-table'
import useSmileRouter from '#hooks/useSmileRouter'
import dayjs from 'dayjs'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { TBmhpMaterialData } from '../master.service'

const useMasterBmhpMaterialTable = () => {
  const { t } = useTranslation('coldStorageCapacity')
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sorting])

  const columns: ColumnDef<TBmhpMaterialData>[] = useMemo(
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
        header: 'Name',
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
        header: 'Created At',
        accessorKey: 'created_at',
        enableSorting: true,
        size: 220,
        minSize: 200,
        cell: ({ row }) => {
          return (
            <div>{dayjs(row.original.created_at).format('DD-MM-YYYY')}</div>
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
            <div className="ui-flex ui-flex-row ui-gap-2">
              <button
                onClick={() =>
                  router.pushGlobal(`/v5/bmhp/bmhp-materials/${item.id}`)
                }
                className="ui-text-primary-500 hover:ui-underline"
              >
                {t('button.detail')}
              </button>
              <button
                onClick={() =>
                  router.push(`/v5/bmhp/bmhp-materials/${item.id.toString()}`)
                }
                className="ui-text-primary-500 hover:ui-underline"
              >
                Edit
              </button>
              <button
                onClick={() =>
                  router.pushGlobal(`/v5/bmhp/bmhp-materials/${item.id}`)
                }
                className="ui-text-primary-500 hover:ui-underline"
              >
                Delete
              </button>
            </div>
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

export default useMasterBmhpMaterialTable

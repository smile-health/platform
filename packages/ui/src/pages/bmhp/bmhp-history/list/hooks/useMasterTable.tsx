import { useEffect, useMemo, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ColumnDef, SortingState } from '@tanstack/react-table'
import { Button } from '#components/button'
import { toast } from '#components/toast'
import useSmileRouter from '#hooks/useSmileRouter'
import { queryClient } from '#provider/query-client'
import dayjs from 'dayjs'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'

import BmhpHistoryStatusCapsule, {
  BmhpHistoryStatus,
} from '../../components/BmhpHistoryStatus'
import { deleteBmhpHistoryType, TBmhpHistoryTypeData } from '../master.service'
import BmhpPlanningTitleBlock from '#pages/bmhp/bmhp-planning/list/components/BmhpPlanningTitleBlock'

export interface MethodTableProps {
  basePath: string
}

const useMasterTable = (props: MethodTableProps) => {
  const { t, i18n } = useTranslation(['masterBmhp', 'common'])
  const router = useSmileRouter()

  const [showDelete, setShowDelete] = useState({
    isVisible: false,
    id: null as number | null,
  })

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

  const mutation = useMutation({
    mutationFn: async (id: number) => {
      return await deleteBmhpHistoryType(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['bmhp-history-list'],
      })
    },
  })

  const onDeleteTrigger = async () => {
    try {
      await mutation.mutateAsync(showDelete.id as number)

      toast.success({
        title: t('common:message.success.delete', {
          type: t('masterBmhp:title.bmhp_examination_type'),
        }),
      })
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.danger({
        title: t('common:message.failed.delete', {
          type: t('masterBmhp:title.bmhp_examination_type'),
        }),
      })
    }
  }

  const columns: ColumnDef<TBmhpHistoryTypeData>[] = useMemo(
    () => [
      {
        header: t('table.column.no'),
        accessorKey: 'number',
        size: 60,
        minSize: 60,
        cell: ({ row }) => {
          return (pagination.page - 1) * pagination.paginate + (row.index + 1)
        },
      },
      {
        header: t('label.year'),
        accessorKey: 'year',
        enableSorting: true,
        size: 300,
        minSize: 200,
        cell: ({ row }) => {
          return <div className="ui-truncate">{row.original.year}</div>
        },
      },
      {
        header: t('label.entity'),
        accessorKey: 'entity_name',
        enableSorting: true,
        size: 300,
        minSize: 200,
        cell: ({ row }) => (
          <BmhpPlanningTitleBlock
            arrText={[
              {
                firstLabel: row.original.entity_name || '-',
                firstClassName: 'ui-text-sm ui-font-semibold',
              },
              {
                firstLabel: row.original.entity_address || '-',
                firstClassName: 'ui-text-xs ui-text-black/20',
              },
            ]}
          />
        ),
      },
      {
        header: t('label.examination_name'),
        accessorKey: 'examination_name',
        enableSorting: true,
        size: 300,
        minSize: 200,
        cell: ({ row }) => {
          const item = row.original
          return <div>{item.examination_name}</div>
        },
      },
      // {
      //   header: t('label.status'),
      //   accessorKey: 'status',
      //   enableSorting: true,
      //   size: 300,
      //   minSize: 200,
      //   cell: ({ row }) => {
      //     const item = row.original
      //     // return <div>{item.status}</div>
      //     return (
      //       <BmhpHistoryStatusCapsule
      //         status={item.status as BmhpHistoryStatus}
      //       />
      //     )
      //   },
      // },
      {
        accessorKey: 'updated_at',
        header: t('common:updated_by'),
        enableSorting: true,
        meta: {
          cellClassName: 'ui-w-3/12',
        },
        cell: ({ row }) => (
          <BmhpPlanningTitleBlock
            arrText={[
              {
                firstLabel:
                  `${row.original.user_updated_by?.firstname || ''} ${row.original.user_updated_by?.lastname || ''}`.trim() ||
                  '-',
                firstClassName: 'ui-text-sm ui-font-normal ui-text-dark-teal',
              },
              {
                firstLabel: dayjs(row.original.updated_at)
                  .locale(i18n.language)
                  .format('DD MMM YYYY HH:mm'),
                firstClassName:
                  'ui-text-sm ui-font-normal ui-text-dark-teal ui-my-1',
              },
            ]}
          />
        ),
      },
      {
        header: t('table.column.actions'),
        accessorKey: 'action',
        size: 100,
        minSize: 100,
        cell: ({ row }) => {
          const item = row.original
          return (
            <div className="ui-flex ui-flex-row ui-gap-1">
              <Button
                variant="subtle"
                onClick={() => router.push(`${props.basePath}${item.id}`)}
                className="ui-px-1.5 ui-text-[#0069D2]"
              >
                {t('button.detail')}
              </Button>
              <Button
                variant="subtle"
                onClick={() => setShowDelete({ isVisible: true, id: item.id })}
                className="ui-px-1.5 ui-text-[#0069D2]"
              >
                {t('button.delete')}
              </Button>
            </div>
          )
        },
        meta: {
          cellClassName: 'ui-text-center',
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    showDelete,
    setShowDelete,
    onDeleteTrigger,
  }
}

export default useMasterTable

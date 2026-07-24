import { useContext, useEffect, useMemo, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ColumnDef, SortingState } from '@tanstack/react-table'
import { Button } from '#components/button'
import { toast } from '#components/toast'
import useSmileRouter from '#hooks/useSmileRouter'
import BmhpPlanningTitleBlock from '#pages/bmhp/bmhp-planning/list/components/BmhpPlanningTitleBlock'
import BmhpPlanningDetailContext from '../../../bmhp-planning/list/libs/bmhp-planning-list.context'
import { queryClient } from '#provider/query-client'
import dayjs from 'dayjs'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { deleteBmhpTargetGroup, TBmhpMaterialData } from '../master.service'

export interface MaterialTableProps {
  basePath: string
}

const useMasterTable = (_: MaterialTableProps) => {
  const { t, i18n } = useTranslation(['masterBmhp', 'common'])
  const router = useSmileRouter()
  const { yearData } = useContext(BmhpPlanningDetailContext)
  const isFinal = !!yearData?.is_final
  const [showDelete, setShowDelete] = useState({
    isVisible: false,
    id: null as number | string | null,
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
    mutationFn: async (id: number | string) => {
      return await deleteBmhpTargetGroup(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bmhp-material-list'] })
    },
  })

  const onDeleteTrigger = async () => {
    try {
      await mutation.mutateAsync(showDelete.id as number | string)
      toast.success({
        title: t('common:message.success.delete', {
          type: t('masterBmhp:title.bmhp_material_target_group'),
        }),
      })
    } catch (error) {
      toast.danger({
        title: t('common:message.failed.delete', {
          type: t('masterBmhp:title.bmhp_material_target_group'),
        }),
      })
    }
  }

  const actionColumn: ColumnDef<TBmhpMaterialData> = {
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
  }

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
      },
      {
        header: t('label.name'),
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
        accessorKey: 'created_at',
        header: t('common:created_by'),
        enableSorting: true,
        meta: {
          cellClassName: 'ui-w-3/12',
        },
        cell: ({ row }) => (
          <BmhpPlanningTitleBlock
            arrText={[
              {
                firstLabel:
                  `${row.original.user_created_by?.firstname || ''} ${row.original.user_created_by?.lastname || ''}`.trim() ||
                  '-',
                firstClassName: 'ui-text-sm ui-font-normal ui-text-dark-teal',
              },
              {
                firstLabel: dayjs(row.original.created_at)
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
      ...(isFinal ? [] : [actionColumn]),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, pagination.page, pagination.paginate, router.basePath, isFinal]
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

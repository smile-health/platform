import { useMemo, useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import useSmileRouter from '#hooks/useSmileRouter'
import { ActionDropdownMenu } from '#components/action-dropdown-menu'
import { toast } from '#components/toast'
import {
  listMasterParameter,
  deleteMasterParameter,
} from '../services/master-parameter.service'
import { MasterParameter } from '../types/master-parameter.types'

type FilterQuery = {
  name?: string
}

export const useMasterParameterTable = (filterQuery?: FilterQuery) => {
  const { t } = useTranslation() as any
  const router = useSmileRouter()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [paginate, setPaginate] = useState(10)

  const { data, isLoading } = useQuery({
    queryKey: ['master-parameter', { ...filterQuery, page, paginate }],
    queryFn: () =>
      listMasterParameter({
        ...filterQuery,
        page,
        paginate,
      }),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteMasterParameter,
    onSuccess: () => {
      toast.success({
        description: t('common:success_delete'),
      })
      queryClient.invalidateQueries({
        queryKey: ['master-parameter'],
      })
    },
    onError: (error: any) => {
      toast.danger({
        description: error?.response?.data?.message || t('common:error_delete'),
      })
    },
  })

  const handleDelete = async (id: number) => {
    if (confirm(t('common:confirm_delete'))) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const tableColumns: ColumnDef<MasterParameter>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: t('master-parameter:table.name'),
        enableSorting: true,
        size: 200,
      },
      {
        accessorKey: 'unit',
        header: t('master-parameter:table.unit'),
        enableSorting: false,
        size: 150,
        cell: ({ row }) => row.original.unit || '-',
      },
      {
        accessorKey: 'description',
        header: t('master-parameter:table.description'),
        enableSorting: false,
        size: 350,
        cell: ({ row }) => (
          <div className="ui-truncate ui-max-w-md">
            {row.original.description}
          </div>
        ),
      },
      {
        accessorKey: 'created_at',
        header: t('common:created_at'),
        enableSorting: true,
        size: 150,
        cell: ({ row }) =>
          new Date(row.original.created_at).toLocaleDateString(),
      },
      {
        id: 'actions',
        header: t('master-parameter:table.actions'),
        size: 100,
        cell: ({ row }) => (
          <ActionDropdownMenu
            onView={() =>
              router.push(`/v5/master-parameter/${row.original.id}`)
            }
            onEdit={() =>
              router.push(`/v5/master-parameter/${row.original.id}/edit`)
            }
            onDelete={() => handleDelete(row.original.id)}
          />
        ),
      },
    ],
    [t, router]
  )

  return {
    tableColumns,
    dataSource: data,
    isLoading,
    page,
    paginate,
    handleChangePage: setPage,
    handleChangePaginate: setPaginate,
  }
}

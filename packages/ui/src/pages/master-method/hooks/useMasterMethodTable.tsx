import { useMemo, useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import useSmileRouter from '#hooks/useSmileRouter'
import { ActionDropdownMenu } from '#components/action-dropdown-menu'
import { toast } from '#components/toast'
import {
  listMasterMethod,
  deleteMasterMethod,
} from '../services/master-method.service'
import { MasterMethod } from '../types/master-method.types'

type FilterQuery = {
  name?: string
}

export const useMasterMethodTable = (filterQuery?: FilterQuery) => {
  const { t } = useTranslation() as any
  const router = useSmileRouter()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [paginate, setPaginate] = useState(10)

  // Fetch data using TanStack Query
  const { data, isLoading } = useQuery({
    queryKey: ['master-method', { ...filterQuery, page, paginate }],
    queryFn: () =>
      listMasterMethod({
        ...filterQuery,
        page,
        paginate,
      }),
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteMasterMethod,
    onSuccess: () => {
      toast.success({
        description: t('common:success_delete'),
      })
      queryClient.invalidateQueries({
        queryKey: ['master-method'],
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

  const tableColumns: ColumnDef<MasterMethod>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: t('master-method:table.name'),
        enableSorting: true,
        size: 200,
      },
      {
        accessorKey: 'description',
        header: t('master-method:table.description'),
        enableSorting: false,
        size: 400,
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
        header: t('master-method:table.actions'),
        size: 100,
        cell: ({ row }) => (
          <ActionDropdownMenu
            onView={() =>
              router.push(
                `/v5/master-method/${row.original.id}`
              )
            }
            onEdit={() =>
              router.push(
                `/v5/master-method/${row.original.id}/edit`
              )
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

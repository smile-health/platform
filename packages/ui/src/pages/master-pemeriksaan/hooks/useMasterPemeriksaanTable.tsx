import { useMemo, useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import useSmileRouter from '#hooks/useSmileRouter'
import { ActionDropdownMenu } from '#components/action-dropdown-menu'
import { toast } from '#components/toast'
import { getReactSelectValue } from '#utils/react-select'
import {
  listMasterPemeriksaan,
  deleteMasterPemeriksaan,
} from '../services/master-pemeriksaan.service'
import { MasterPemeriksaan } from '../types/master-pemeriksaan.types'

type FilterQuery = {
  name?: string
  examination_type_id?: { value: number; label: string } | { value: number; label: string }[]
}

export const useMasterPemeriksaanTable = (filterQuery?: FilterQuery) => {
  const { t } = useTranslation() as any
  const router = useSmileRouter()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [paginate, setPaginate] = useState(10)

  const params = {
    ...filterQuery,
    examination_type_id: filterQuery?.examination_type_id
      ? getReactSelectValue(filterQuery.examination_type_id)
      : undefined,
    page,
    paginate,
  }

  const { data, isLoading } = useQuery({
    queryKey: ['master-pemeriksaan', params],
    queryFn: () => listMasterPemeriksaan(params),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteMasterPemeriksaan,
    onSuccess: () => {
      toast.success({
        description: t('common:success_delete'),
      })
      queryClient.invalidateQueries({
        queryKey: ['master-pemeriksaan'],
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

  const tableColumns: ColumnDef<MasterPemeriksaan>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: t('master-pemeriksaan:table.name'),
        enableSorting: true,
        size: 200,
      },
      {
        accessorKey: 'examination_type_name',
        header: t('master-pemeriksaan:table.examination_type'),
        enableSorting: true,
        size: 200,
      },
      {
        accessorKey: 'description',
        header: t('master-pemeriksaan:table.description'),
        enableSorting: false,
        size: 300,
        cell: ({ row }) => (
          <div className="ui-truncate ui-max-w-xs">{row.original.description}</div>
        ),
      },
      {
        accessorKey: 'is_active',
        header: t('common:status.label'),
        size: 100,
        cell: ({ row }) =>
          row.original.is_active ? t('common:status.active') : t('common:status.inactive'),
      },
      {
        id: 'actions',
        header: t('master-pemeriksaan:table.actions'),
        size: 100,
        cell: ({ row }) => (
          <ActionDropdownMenu
            onView={() => router.push(`/v5/master-pemeriksaan/${row.original.id}`)}
            onEdit={() => router.push(`/v5/master-pemeriksaan/${row.original.id}/edit`)}
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

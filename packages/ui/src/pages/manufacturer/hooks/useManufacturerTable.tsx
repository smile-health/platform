import { useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { ColumnDef, ColumnSort } from '@tanstack/react-table'
import ActiveLabel from '#components/modules/ActiveLabel'
import { ButtonActionTable } from '#components/modules/ButtonActionTable'
import {
  listManufacturers,
  ListManufacturersParams,
  listPlatformManufacturers,
} from '#services/manufacturer'
import { hasPermission } from '#shared/permission/index'
import { TManufacturer } from '#types/manufacturer'
import { getFullName } from '#utils/strings'
import { parseAsInteger, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'

type UseManufacturerTableParams = {
  isGlobal?: boolean
  filter: Omit<ListManufacturersParams, 'page' | 'paginate'> & {
    sort_by?: string
    sort_type?: string
  }
}

export default function useManufacturerTable({
  isGlobal,
  filter,
}: UseManufacturerTableParams) {
  const { t } = useTranslation(['common', 'manufacturer'])
  const [sorting, setSorting] = useState<ColumnSort[]>([])
  const [{ page, paginate }, setPagination] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      paginate: parseAsInteger.withDefault(10),
    },
    {
      history: 'push',
    }
  )

  const currentFilter = {
    ...filter,
    page,
    paginate,
    sort_by: sorting?.[0]?.id,
    sort_type: sorting?.[0]?.desc ? 'desc' : 'asc',
  }

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['manufacturers', currentFilter],
    queryFn: () =>
      isGlobal
        ? listManufacturers(currentFilter)
        : listPlatformManufacturers(currentFilter),
    placeholderData: keepPreviousData,
  })

  const tableColumns: Array<ColumnDef<TManufacturer>> = [
    {
      header: 'No.',
      accessorKey: 'no',
      size: 40,
      maxSize: 40,
      cell: ({ row }) => (page - 1) * paginate + (row?.index + 1),
    },
    {
      header: t('manufacturer:column.name'),
      accessorKey: 'name',
      enableSorting: true,
      size: 125,
      minSize: 125,
    },
    ...((isGlobal
      ? [
          {
            header: t('common:programs'),
            accessorKey: 'programs',
            size: 125,
            minSize: 125,
            cell: ({ row }) =>
              row?.original?.programs?.length > 0
                ? row?.original?.programs?.map((item) => item.name).join(', ')
                : '-',
          },
        ]
      : []) as Array<ColumnDef<TManufacturer>>),
    {
      header: t('type'),
      enableSorting: true,
      accessorKey: 'type',
      size: 60,
      minSize: 60,
      cell: ({ row }) => row?.original?.manufacture_type?.name,
    },
    ...((!isGlobal
      ? [
          {
            header: 'Status',
            enableSorting: true,
            accessorKey: 'status',
            size: 75,
            minSize: 75,
            cell: ({ row }) => (
              <ActiveLabel isActive={Boolean(row?.original?.status)} />
            ),
          },
        ]
      : []) as Array<ColumnDef<TManufacturer>>),

    {
      header: t('updated.by'),
      enableSorting: true,
      accessorKey: 'updated_by',
      size: 150,
      minSize: 150,
      cell: ({ row }) =>
        getFullName(
          row?.original?.user_updated_by?.firstname,
          row?.original?.user_updated_by?.lastname
        ),
    },
    {
      header: t('common:action'),
      accessorKey: 'action',
      size: 40,
      maxSize: 40,
      cell: ({ row }) => {
        const item = row?.original

        return (
          <ButtonActionTable
            id={item?.id}
            path={isGlobal ? 'global-settings/manufacturer' : 'manufacturer'}
            hidden={isGlobal ? ['activation'] : ['activation', 'edit']}
          />
        )
      },
    },
  ]

  const handleChangePage = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const handleChangePaginate = (paginate: number) => {
    setPagination((prev) => ({ ...prev, paginate }))
    handleChangePage(1)
  }

  return {
    page,
    paginate,
    tableColumns,
    dataSource: data,
    isLoading: isLoading || isFetching,
    handleChangePage,
    handleChangePaginate,
    sorting,
    setSorting,
  }
}

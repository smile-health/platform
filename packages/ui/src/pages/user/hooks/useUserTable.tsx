import { useEffect, useState } from 'react'
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { CellContext, ColumnDef, SortingState } from '@tanstack/react-table'
import ActiveLabel from '#components/modules/ActiveLabel'
import { ButtonActionTable } from '#components/modules/ButtonActionTable'
import useChangeStatus from '#hooks/useChangeStatus'
import useSmileRouter from '#hooks/useSmileRouter'
import { listPlatformUsers, listUsers } from '#services/user'
import { hasPermission, usePermission } from '#shared/permission/index'
import { TUser } from '#types/user'
import { getFullName } from '#utils/strings'
import dayjs from 'dayjs'
import { parseAsInteger, parseAsString, useQueryStates, Values } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { handleFilterParams } from '../user.helper'
import { updateStatusUserInProgram } from '../user.service'

type UseUserTableTableParams = {
  isGlobal?: boolean
  filter: Values<Record<string, any>>
}

export default function useUserTableTable({
  filter,
  isGlobal,
}: UseUserTableTableParams) {
  const { t } = useTranslation(['user', 'common'])
  const { isReady } = useSmileRouter()
  const isPermitted = usePermission(isGlobal ? 'user-global-view' : 'user-view')
  const queryClient = useQueryClient()
  const [{ page, paginate }, setPagination] = useQueryStates(
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

  const currentFilter = handleFilterParams({
    ...filter,
    page,
    paginate,
  })

  const {
    onChangeStatus,
    isLoading: isLoadingActivation,
    changeStatusState,
    setChangeStatusState,
    handleResetChangeStatusState,
  } = useChangeStatus({
    titlePage: t('user:title.status'),
    validateQueryKey: 'users',
    queryFn: updateStatusUserInProgram,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['profile'],
      })
    },
  })

  const hiddenTableButton = () => {
    if (isGlobal) return ['activation']

    if (!hasPermission('user-mutate')) return ['activation', 'edit']

    return ['edit']
  }

  const tableColumns: Array<ColumnDef<TUser>> = [
    {
      header: 'No.',
      accessorKey: 'no',
      size: 20,
      maxSize: 100,
      cell: ({ row }) => (page - 1) * paginate + (row?.index + 1),
    },
    {
      header: t('user:column.username'),
      accessorKey: 'username',
      size: 100,
      minSize: 100,
      enableSorting: true,
    },
    {
      header: t('user:column.fullname'),
      accessorKey: 'fullname',
      size: 100,
      minSize: 100,
      cell: ({ row }) =>
        getFullName(row?.original?.firstname, row?.original?.lastname),
      enableSorting: true,
    },
    {
      header: t('user:column.role'),
      accessorKey: 'role_label',
      size: 100,
      minSize: 100,
      enableSorting: true,
    },
    {
      header: t('user:column.entity.index'),
      accessorKey: 'entity_label',
      size: 100,
      minSize: 100,
      enableSorting: true,
      cell: ({ row: { original } }) =>
        original.entity ? original.entity.name || '-' : '-',
    },
    ...(isGlobal
      ? [
          {
            header: t('common:programs'),
            accessorKey: 'programs',
            size: 100,
            minSize: 100,
            cell: ({ row }: CellContext<TUser, unknown>) =>
              row?.original?.programs?.length > 0
                ? row?.original?.programs?.map((item) => item.name).join(', ')
                : '',
          },
        ]
      : []),
    {
      header: t('user:column.last.login'),
      accessorKey: 'last_login',
      size: 100,
      minSize: 100,
      cell: ({ row }) =>
        row?.original?.last_login
          ? dayjs(row?.original?.last_login).format('DD/MM/YYYY HH:mm')
          : '-',
      enableSorting: true,
    },
    {
      header: 'Status',
      accessorKey: 'status',
      size: 100,
      minSize: 100,
      cell: ({ row }) => (
        <ActiveLabel isActive={Boolean(row?.original?.status)} />
      ),
      meta: {
        hidden: isGlobal,
      },
    },
    {
      header: t('common:action'),
      accessorKey: 'action',
      size: 40,
      maxSize: 40,
      cell: ({ row }) => {
        const item = row?.original
        const isActive = !!item?.status

        return (
          <ButtonActionTable
            id={item?.id}
            path={isGlobal ? 'global-settings/user' : 'user'}
            hidden={hiddenTableButton()}
            isActive={isActive}
            isLoadingActivation={isLoadingActivation}
            onActivationClick={() => {
              setChangeStatusState?.({
                show: true,
                id: item?.id,
                status: item?.status,
              })
            }}
          />
        )
      },
    },
  ]

  const { data, isFetching } = useQuery({
    queryKey: ['users', currentFilter, querySorting],
    queryFn: () =>
      isGlobal
        ? listUsers({ ...currentFilter, ...querySorting })
        : listPlatformUsers({ ...currentFilter, ...querySorting }),
    placeholderData: keepPreviousData,
    enabled: isPermitted && isReady,
  })

  const handleChangePage = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const handleChangePaginate = (paginate: number) => {
    setPagination((prev) => ({ ...prev, paginate }))
    handleChangePage(1)
  }

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

  return {
    page,
    paginate,
    sorting,
    setSorting,
    tableColumns,
    dataSource: data,
    isLoading: isFetching,
    handleChangePage,
    handleChangePaginate,
    changeStatus: {
      state: changeStatusState,
      submit: onChangeStatus,
      reset: handleResetChangeStatusState,
    },
  }
}

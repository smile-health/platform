import Link from 'next/link'
import { CellContext, ColumnDef } from '@tanstack/react-table'
import { Button } from '#components/button'
import ActiveLabel from '#components/modules/ActiveLabel'
import useSmileRouter from '#hooks/useSmileRouter'
import { parseDateTime } from '#utils/date'
import { getFullName } from '#utils/strings'
import { isViewOnly } from '#utils/user'
import { useTranslation } from 'react-i18next'

import {
  BudgetSourceTableProps,
  DetailBudgetSourceResponse,
} from '../budget-source.type'

const useBudgetSourceTable = ({
  isGlobal = false,
  page,
  size,
}: BudgetSourceTableProps) => {
  const { t } = useTranslation(['budgetSource', 'common'])
  const { getAsLink, getAsLinkGlobal } = useSmileRouter()

  const handleAction = (type: 'edit' | 'detail', id: string | number) => {
    const isEdit = type === 'edit'

    if (isGlobal) {
      return getAsLinkGlobal(
        `/v5/global-settings/budget-source/${id}${isEdit ? '/edit' : ''}`,
        null,
        isEdit
          ? {
              fromPage: 'list',
            }
          : undefined
      )
    }

    return getAsLink(
      `/v5/budget-source/${id}${isEdit ? '/edit' : ''}`,
      null,
      isEdit
        ? {
            fromPage: 'list',
          }
        : undefined
    )
  }

  const schema: Array<ColumnDef<DetailBudgetSourceResponse>> = [
    {
      header: 'No.',
      accessorKey: 'no',
      size: 40,
      minSize: 40,
      cell: ({ row: { index } }) => (page - 1) * size + (index + 1),
    },
    {
      header: t('list.column.name'),
      accessorKey: 'name',
      minSize: 200,
      enableSorting: true,
    },
    ...((!isGlobal
      ? [
          {
            header: 'Status',
            enableSorting: true,
            accessorKey: 'status',
            size: 220,
            minSize: 220,
            cell: ({ row }) => (
              <ActiveLabel isActive={Boolean(row?.original?.status)} />
            ),
          },
        ]
      : []) as Array<ColumnDef<DetailBudgetSourceResponse>>),
    {
      header: t('list.column.update_at'),
      accessorKey: 'updated_at',
      size: 220,
      minSize: 220,
      cell: ({ row }) => parseDateTime(row.original.updated_at),
      enableSorting: true,
    },
    {
      header: t('list.column.update_by'),
      accessorKey: 'user_updated_by',
      size: 220,
      minSize: 220,
      enableSorting: true,
      cell: ({ row }) =>
        getFullName(
          row?.original?.user_updated_by?.firstname,
          row?.original?.user_updated_by?.lastname
        ),
    },
    ...(isGlobal
      ? [
          {
            header: t('list.column.workspace'),
            accessorKey: 'programs',
            size: 196,
            minSize: 196,
            cell: ({
              row: { original },
            }: CellContext<DetailBudgetSourceResponse, unknown>) => {
              const workspaces = original?.programs?.map((item) => item?.name)

              return workspaces?.length > 0 ? workspaces?.join(', ') : '-'
            },
          },
        ]
      : []),
    {
      header: t('list.column.action'),
      accessorKey: 'action',
      size: 123,
      minSize: 123,
      cell: ({ row }) => (
        <div className="ui-flex ui-gap-2 -ml-3">
          <Button
            asChild
            id="btn-link-budget-source-detail"
            size="sm"
            variant="subtle"
          >
            <Link href={handleAction('detail', row.original.id)}>Detail</Link>
          </Button>
          {!isViewOnly() && isGlobal && (
            <Button
              asChild
              id="btn-link-budget-source-edit"
              size="sm"
              variant="subtle"
            >
              <Link href={handleAction('edit', row.original.id)}>
                {t('common:edit')}
              </Link>
            </Button>
          )}
        </div>
      ),
    },
  ]

  return {
    schema,
  }
}

export default useBudgetSourceTable

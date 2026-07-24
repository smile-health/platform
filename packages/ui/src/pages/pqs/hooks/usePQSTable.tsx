import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '#components/button'
import useSmileRouter from '#hooks/useSmileRouter'
import { MaterialVolumeTableProps } from '#types/material-volume'
import { parseDateTime } from '#utils/date'
import { numberFormatter } from '#utils/formatter'
import { getFullName } from '#utils/strings'
import { isViewOnly } from '#utils/user'
import { useTranslation } from 'react-i18next'

import { PQSDetail } from '../pqs.types'

const usePQSTable = ({
  isGlobal = false,
  page,
  size,
}: MaterialVolumeTableProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['pqs', 'common'])
  const { getAsLinkGlobal } = useSmileRouter()

  const handleAction = (type: 'edit' | 'detail', id: string | number) => {
    const isEdit = type === 'edit'

    return getAsLinkGlobal(
      `/v5/global-settings/asset/pqs/${id}${isEdit ? '/edit' : ''}`,
      null,
      isEdit
        ? {
            fromPage: 'list',
          }
        : undefined
    )
  }

  const schema: Array<ColumnDef<PQSDetail>> = [
    {
      header: 'No.',
      accessorKey: 'no',
      size: 40,
      minSize: 40,
      cell: ({ row: { index } }) => (page - 1) * size + (index + 1),
    },
    {
      header: t('pqs:list.column.pqs_code'),
      accessorKey: 'code',
      minSize: 200,
      enableSorting: true,
      cell: ({ row }) => row.original?.pqs_code ?? '-',
    },
    {
      header: `${t('pqs:list.column.net_capacity.label', {
        temperature: '+5 °C',
      })} (${t('common:litre')})`,
      accessorKey: 'capacity_minus_5_c',
      minSize: 220,
      cell: ({ row }) =>
        row.original?.capacities?.[0]?.capacities5
          ? numberFormatter(
              row.original?.capacities?.[0]?.capacities5,
              language,
              'decimal'
            )
          : '-',
    },
    {
      header: `${t('pqs:list.column.net_capacity.label', {
        temperature: '-20 °C',
      })} (${t('common:litre')})`,
      accessorKey: 'capacity_minus_20_c',
      minSize: 220,
      cell: ({ row }) =>
        row.original?.capacities?.[1]?.capacitiesMin20
          ? numberFormatter(
              row.original?.capacities?.[1]?.capacitiesMin20,
              language,
              'decimal'
            )
          : '-',
    },
    {
      header: `${t('pqs:list.column.net_capacity.label', {
        temperature: '-86 °C',
      })} (${t('common:litre')})`,
      accessorKey: 'capacity_minus_86_c',
      minSize: 220,
      cell: ({ row }) =>
        row.original?.capacities?.[2]?.capacitiesMin86
          ? numberFormatter(
              row.original?.capacities?.[2]?.capacitiesMin86,
              language,
              'decimal'
            )
          : '-',
    },
    {
      header: t('pqs:list.column.last_updated_at'),
      accessorKey: 'updated_at',
      size: 220,
      minSize: 220,
      cell: ({ row }) => (
        <div className="ui-flex ui-flex-col">
          <div className="ui-font-bold ui-mb-1">
            {parseDateTime(
              row.original.updated_at ?? '',
              'DD MMM YYYY HH:mm'
            ).toUpperCase()}
          </div>
          <div>
            {getFullName(
              row?.original?.user_updated_by?.firstname ?? '',
              row?.original?.user_updated_by?.lastname ?? ''
            )}
          </div>
        </div>
      ),
      enableSorting: true,
    },
    {
      header: t('pqs:list.column.action'),
      accessorKey: 'action',
      size: 123,
      minSize: 123,
      cell: ({ row }) => (
        <div className="ui-flex ui-gap-2 -ml-3">
          <Button
            asChild
            id={`btn-link-material-volume-detail-${row.original.id}`}
            size="sm"
            variant="subtle"
          >
            <Link href={handleAction('detail', row.original.id)}>Detail</Link>
          </Button>
          {!isViewOnly() && isGlobal && (
            <Button
              asChild
              id={`btn-link-material-volume-edit-${row.original.id}`}
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

export default usePQSTable

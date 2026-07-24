import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '#components/button'
import ActiveLabel from '#components/modules/ActiveLabel'
import { isViewOnly } from '#utils/user'
import { TFunction } from 'i18next'

import { ActivityTableProps, DetailActivityResponse } from './activity.type'
import { getProtocolName } from './utils/helper'

export const columns = (
  t: TFunction<['common', 'activity']>,
  { page, size, setLink }: ActivityTableProps
): ColumnDef<DetailActivityResponse>[] => [
  {
    header: 'No.',
    accessorKey: 'no',
    size: 40,
    minSize: 40,
    cell: ({ row: { index } }) => (page - 1) * size + (index + 1),
  },
  {
    header: t('activity:column.name'),
    accessorKey: 'name',
    enableSorting: true,
  },
  {
    header: t('activity:column.activity_process'),
    accessorKey: 'activity_process',
    cell: ({ row: { original: { is_ordered_sales, is_ordered_purchase } } }) => {
      const result = [
        is_ordered_sales && 'Top Down',
        is_ordered_purchase && 'Bottom Up'
      ].filter(Boolean).join(', ') || '-';
      
      return result
    }
  },
  {
    header: t('activity:column.protocol'),
    accessorKey: 'protocol',
    cell: ({ row: { original: { protocol } } }) => getProtocolName(protocol)
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: ({ row: { original: { status } } }) => <ActiveLabel isActive={!!status} />,
    size: 160,
  },
  {
    header: () => (
      <div className="ui-font-semibold ui-pl-3">{t('common:action')}</div>
    ),
    size: 123,
    minSize: 123,
    accessorKey: 'action',
    cell: ({ row: { original } }) => {
      return (
        <div className="ui-flex ui-gap-2">
          <Button
            asChild
            id="btn-link-budget-source-detail"
            size="sm"
            variant="subtle"
          >
            <Link href={setLink(`/v5/activity/${original?.id}`)}>Detail</Link>
          </Button>
          {!isViewOnly() && (
            <Button
              asChild
              id="btn-link-budget-source-edit"
              size="sm"
              variant="subtle"
            >
              <Link href={setLink(`/v5/activity/${original?.id}/edit`)}>
                {t('common:edit')}
              </Link>
            </Button>
          )}
        </div>
      )
    },
  },
]

export const activityProtocolOptions = [
  { value: 'default', label: 'Default' },
  { value: 'rabies', label: 'Rabies' },
  { value: 'dengue', label: 'Dengue' },
]

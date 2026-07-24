import { ColumnDef } from '@tanstack/react-table'
import dayjs from 'dayjs'

import { TBmhpPlanningYear, TMainColumn } from '../libs/bmhp-planning-list.type'
import BmhpPlanningDetailButton from './BmhpPlanningDetailButton'
import BmhpPlanningStatusCapsule from './BmhpPlanningStatusCapsule'
import BmhpPlanningTitleBlock from './BmhpPlanningTitleBlock'

import 'dayjs/locale/id'
import 'dayjs/locale/en'

export const getBmhpPlanningListTableColumn = ({
  t,
  locale,
}: TMainColumn): ColumnDef<TBmhpPlanningYear>[] => [
  {
    accessorKey: 'si_no',
    header: 'No.',
    size: 20,
    meta: {
      cellClassName: 'ui-w-1/12',
    },
    cell: ({ row }) => Number(row.original.si_no),
    enableSorting: false,
  },
  {
    accessorKey: 'year',
    header: t('bmhpPlanning:year'),
    enableSorting: true,
    meta: {
      cellClassName: 'ui-w-2/12',
    },
    cell: ({ row }) => row.original.year,
  },
  {
    accessorKey: 'is_final',
    header: t('common:status.label'),
    enableSorting: true,
    meta: {
      cellClassName: 'ui-w-3/12',
    },
    cell: ({ row }) => (
      <BmhpPlanningStatusCapsule isFinal={row.original.is_final} />
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
              .locale(locale)
              .format('DD MMM YYYY HH:mm'),
            firstClassName:
              'ui-text-sm ui-font-normal ui-text-dark-teal ui-my-1',
          },
        ]}
      />
    ),
  },
  {
    accessorKey: 'actions',
    header: t('common:action'),
    meta: {
      cellClassName: 'ui-w-3/12',
    },
    cell: ({ row }) => (
      <div className="ui-flex ui-justify-start ui-items-center ui-gap-2">
        <BmhpPlanningDetailButton id={row.original.id} />
      </div>
    ),
    enableSorting: false,
  },
]

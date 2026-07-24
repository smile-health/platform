import { ColumnDef } from '@tanstack/react-table'
import { hasPermission } from '#shared/permission/index'
import dayjs from 'dayjs'

import { thousandFormatter } from '../libs/program-plan-list.common'
import { TMainColumn, TProgramPlanData } from '../libs/program-plan-list.type'
import ProgramPlanDetailButton from './ProgramPlanDetailButton'
import ProgramPlanStatusCapsule from './ProgramPlanStatusCapsule'
import ProgramPlanTitleBlock from './ProgramPlanTitleBlock'

import 'dayjs/locale/id'
import 'dayjs/locale/en'

export const MainColumn = ({ t, locale }: TMainColumn) => {
  const hasNoPermissionAtAll =
    !hasPermission('annual-planning-target-group-view') &&
    !hasPermission('population-view') &&
    !hasPermission('task-view') &&
    !hasPermission('program-plan-material-ratio-view') &&
    !hasPermission('annual-planning-substitution-view')

  let schema: Array<ColumnDef<TProgramPlanData>> = [
    {
      header: 'No.',
      accessorKey: 'no',
      size: 20,
      meta: {
        cellClassName: 'ui-w-1/12',
      },
      cell: ({
        row: {
          original: { si_no },
        },
      }) =>
        thousandFormatter({
          value: Number(si_no),
          locale,
        }),
    },
    {
      header: t('programPlan:table.year'),
      accessorKey: 'year',
      enableSorting: true,
      meta: {
        cellClassName: 'ui-w-2/12',
      },
      cell: ({
        row: {
          original: { year },
        },
      }) => year,
    },
    {
      header: t('programPlan:table.status'),
      accessorKey: 'is_final',
      enableSorting: true,
      meta: {
        cellClassName: 'ui-w-3/12',
      },
      cell: ({
        row: {
          original: { is_final },
        },
      }) => <ProgramPlanStatusCapsule isFinale={is_final} />,
    },
    {
      header: t('common:updated_by'),
      accessorKey: 'updated_at',
      enableSorting: true,
      meta: {
        cellClassName: 'ui-w-3/12',
      },
      cell: ({
        row: {
          original: { user_updated_by, updated_at },
        },
      }) => (
        <ProgramPlanTitleBlock
          arrText={[
            {
              firstLabel: `${user_updated_by?.firstname} ${user_updated_by?.lastname ?? ''}`,
              firstClassName: 'ui-text-sm ui-font-normal ui-text-dark-teal',
            },
            {
              firstLabel: dayjs(updated_at)
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
      header: t('common:action'),
      accessorKey: 'actions',
      meta: {
        cellClassName: 'ui-w-3/12',
      },
      cell: ({ row: { original } }) => (
        <div className="ui-flex ui-justify-start ui-items-center ui-gap-2">
          <ProgramPlanDetailButton id={original.id} />
        </div>
      ),
    },
  ]

  if (hasNoPermissionAtAll) {
    schema = schema.filter(
      (column) => !('accessorKey' in column) || column.accessorKey !== 'actions'
    )
  }

  return schema
}

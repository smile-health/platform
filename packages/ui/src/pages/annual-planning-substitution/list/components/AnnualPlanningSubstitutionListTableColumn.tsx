import { useContext } from 'react'
import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '#components/button'
import useSmileRouter from '#hooks/useSmileRouter'
import { hasPermission } from '#shared/permission/index'
import dayjs from 'dayjs'

import { thousandFormatter } from '../libs/annual-planning-substitution-list.common'
import AnnualPlanningSubstitutionListContext from '../libs/annual-planning-substitution-list.context'
import {
  TAnnualPlanningSubstitutionData,
  TMainColumn,
} from '../libs/annual-planning-substitution-list.type'
import AnnualPlanningSubstitutionTitleBlock from './AnnualPlanningSubstitutionTitleBlock'

import 'dayjs/locale/id'
import 'dayjs/locale/en'

export const MainColumn = ({ t, locale }: TMainColumn) => {
  const router = useSmileRouter()
  const { id: planId } = router.query
  const { setOpenedRow } = useContext(AnnualPlanningSubstitutionListContext)

  const editColumn: ColumnDef<TAnnualPlanningSubstitutionData> = {
    header: t('common:action'),
    accessorKey: 'id',
    meta: {
      cellClassName: 'ui-w-2/12',
    },
    cell: ({ row: { original } }) => (
      <div className="ui-flex ui-justify-start ui-items-center ui-gap-2">
        <Button
          type="button"
          variant="subtle"
          color="primary"
          className="ui-px-1"
        >
          <Link
            href={router.getAsLink(
              `/v5/program-plan/${planId}/substitution/${original.id}/edit`
            )}
          >
            {t('common:edit')}
          </Link>
        </Button>
        <Button
          type="button"
          variant="subtle"
          color="danger"
          className="ui-px-1"
          onClick={() => setOpenedRow(original)}
        >
          {t('common:delete')}
        </Button>
      </div>
    ),
  }

  const schema: Array<ColumnDef<TAnnualPlanningSubstitutionData>> = [
    {
      header: 'No.',
      accessorKey: 'no',
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
      header: t('annualPlanningSubstitution:table.planned_material'),
      accessorKey: 'material',
      meta: {
        cellClassName: 'ui-w-3/12',
      },
      cell: ({
        row: {
          original: { material },
        },
      }) => material?.name ?? '',
    },
    {
      header: t('annualPlanningSubstitution:table.substitute_material'),
      accessorKey: 'substitution_materials',
      meta: {
        cellClassName: 'ui-w-3/12',
      },
      cell: ({
        row: {
          original: { substitution_materials },
        },
      }) => (
        <AnnualPlanningSubstitutionTitleBlock
          arrText={
            substitution_materials?.map((item) => ({
              firstLabel: item.name,
              firstClassName: 'ui-text-sm ui-font-normal ui-text-dark-teal',
            })) || []
          }
        />
      ),
    },
    {
      header: t('common:updated_by'),
      accessorKey: 'updated_by',
      meta: {
        cellClassName: 'ui-w-4/12',
      },
      cell: ({
        row: {
          original: { user_updated_by, updated_at },
        },
      }) => (
        <AnnualPlanningSubstitutionTitleBlock
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
  ]

  if (hasPermission('annual-planning-substitution-mutate')) {
    schema.push(editColumn)
  }

  return schema
}

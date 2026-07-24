import { useContext } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '#components/button'
import { hasPermission } from '#shared/permission/index'
import dayjs from 'dayjs'

import ProgramPlanDetailContext from '../../../program-plan/list/libs/program-plan-detail.context'
import { thousandFormatter } from '../libs/annual-planning-target-group-list.common'
import AnnualPlanningTargetGroupListContext from '../libs/annual-planning-target-group-list.context'
import {
  TAnnualPlanningTargetGroupData,
  TMainColumn,
} from '../libs/annual-planning-target-group-list.type'
import AnnualPlanningTargetGroupStatusCapsule from './AnnualPlanningTargetGroupStatusCapsule'
import AnnualPlanningTargetGroupTitleBlock from './AnnualPlanningTargetGroupTitleBlock'

import 'dayjs/locale/id'
import 'dayjs/locale/en'

export const MainColumn = ({ t, locale }: TMainColumn) => {
  const { isGlobal, setOpenedRow } = useContext(
    AnnualPlanningTargetGroupListContext
  )
  const { detailProgramPlanData } = useContext(ProgramPlanDetailContext) ?? {}

  const isGloballyCanEdit =
    isGlobal && hasPermission('annual-planning-target-group-global-mutate')

  const isProgramCanEdit =
    detailProgramPlanData &&
    !isGlobal &&
    !detailProgramPlanData?.is_final &&
    hasPermission('annual-planning-target-group-mutate')

  const ageObject: ColumnDef<TAnnualPlanningTargetGroupData> = {
    header: t('annualPlanningTargetGroup:table.age'),
    accessorKey: 'from_age_to_age',
    cell: ({
      row: {
        original: { from_age, to_age },
      },
    }) => {
      const {
        year: fromYear = 0,
        month: fromMonth = 0,
        day: fromDay = 0,
      } = from_age ?? {}
      const {
        year: toYear = 0,
        month: toMonth = 0,
        day: toDay = 0,
      } = to_age ?? {}
      if (toYear === 0 && toMonth === 0 && toDay === 0)
        return t('annualPlanningTargetGroup:from_to_forever_age', {
          fromYear,
          fromMonth,
          fromDay,
        })
      return t('annualPlanningTargetGroup:from_to_age', {
        fromYear,
        fromMonth,
        fromDay,
        toYear,
        toMonth,
        toDay,
      })
    },
  }

  const statusObject: ColumnDef<TAnnualPlanningTargetGroupData> = {
    header: t('annualPlanningTargetGroup:table.status'),
    accessorKey: 'is_active',
    cell: ({
      row: {
        original: { is_active },
      },
    }) => <AnnualPlanningTargetGroupStatusCapsule isActive={is_active} />,
  }

  const actionObject: ColumnDef<TAnnualPlanningTargetGroupData> = {
    header: t('common:action'),
    accessorKey: 'id',
    cell: ({ row: { original } }) => {
      const deactivationButtonTitle = original.is_active
        ? t('annualPlanningTargetGroup:table.deactivate')
        : t('annualPlanningTargetGroup:table.activate')

      return (
        <div className="ui-flex ui-justify-start ui-items-center ui-gap-2">
          {isGloballyCanEdit && (
            <Button
              type="button"
              variant="subtle"
              className="ui-px-1"
              onClick={() => setOpenedRow({ ...original, opened_for: 'edit' })}
            >
              {t('common:edit')}
            </Button>
          )}
          <Button
            type="button"
            variant="subtle"
            color={!original.is_active && isGlobal ? 'success' : 'danger'}
            className="ui-px-1"
            onClick={() =>
              setOpenedRow({ ...original, opened_for: 'activation' })
            }
          >
            {isGlobal ? deactivationButtonTitle : t('common:delete')}
          </Button>
        </div>
      )
    },
  }

  const schema: Array<ColumnDef<TAnnualPlanningTargetGroupData>> = [
    {
      header: 'No.',
      accessorKey: 'no',
      size: 20,
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
      header: isGlobal
        ? t('annualPlanningTargetGroup:table.target_group_name')
        : t('annualPlanningTargetGroup:table.group_name'),
      accessorKey: isGlobal ? 'title' : 'name',
      cell: ({
        row: {
          original: { title, name },
        },
      }) => (isGlobal ? title : name),
    },
    {
      header: t('common:updated_by'),
      accessorKey: 'updated_by',
      cell: ({
        row: {
          original: { user_updated_by, updated_at },
        },
      }) => (
        <AnnualPlanningTargetGroupTitleBlock
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

  if (isGlobal) {
    schema.splice(2, 0, ageObject)
    schema.splice(3, 0, statusObject)
  }

  if (isGloballyCanEdit || isProgramCanEdit) {
    schema.push(actionObject)
  }

  return schema
}

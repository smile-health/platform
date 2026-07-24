import { ColumnDef } from '@tanstack/react-table'
import dayjs from 'dayjs'

import 'dayjs/locale/id'
import 'dayjs/locale/en'

import Link from 'next/link'
import { Button } from '#components/button'
import { hasPermission } from '#shared/permission/index'

import { TProgramPlanData } from '../../../program-plan/list/libs/program-plan-list.type'
import { TMainColumn, TRatioRow } from '../libs/program-plan-ratio.list.type'

const isAllowMutate = (detailProgramPlanData: TProgramPlanData | null) => {
  if (
    !detailProgramPlanData ||
    !hasPermission('program-plan-material-ratio-mutate') ||
    detailProgramPlanData.is_final
  ) {
    return false
  }

  return true
}

export const MainColumn = ({
  t,
  locale,
  programPlanId,
  detailProgramPlanData,
  setLink,
  onClickDelete,
}: TMainColumn): Array<ColumnDef<TRatioRow>> => {
  const schema: Array<ColumnDef<TRatioRow>> = [
    {
      header: 'No.',
      accessorKey: 'no',
      size: 20,
      cell: ({ row: { index } }) => index + 1,
    },
    {
      header: t('programPlanMaterialRatio:material_ratio'),
      accessorKey: 'materials',
      cell: ({ row: { original } }) => {
        const {
          material_left_name,
          material_left_type,
          material_right_name,
          material_right_type,
        } = original

        return (
          <div className="ui-flex ui-items-center ui-gap-4">
            <div className="ui-flex-1 ui-border ui-border-neutral-300 ui-rounded ui-px-3 ui-py-2 ui-bg-neutral-100">
              <div className="ui-text-dark-teal ui-font-bold">
                {material_left_name}
              </div>
              <div className="ui-text-xs ui-text-gray-600">
                {material_left_type}
              </div>
            </div>
            <span className="ui-text-dark-teal">:</span>
            <div className="ui-flex-1 ui-border ui-border-neutral-300 ui-rounded ui-px-3 ui-py-2 ui-bg-neutral-100">
              <div className="ui-text-dark-teal ui-font-bold">
                {material_right_name}
              </div>
              <div className="ui-text-xs ui-text-gray-600">
                {material_right_type}
              </div>
            </div>
          </div>
        )
      },
    },
    {
      header: t('programPlanMaterialRatio:title'),
      accessorKey: 'ratio',
      cell: ({ row: { original } }) => (
        <span className="ui-text-dark-teal">{original.ratio}</span>
      ),
    },
    {
      header: t('common:updated_by'),
      accessorKey: 'updated',
      cell: ({ row: { original } }) => (
        <div className="ui-text-dark-teal">
          <div className="ui-text-sm ui-font-normal">{original.updated_by}</div>
          <div className="ui-text-sm ui-font-normal ui-my-1">
            {dayjs(original.updated_at)
              .locale(locale)
              .format('DD MMM YYYY HH:mm')
              .toUpperCase()}
          </div>
        </div>
      ),
    },
    ...(isAllowMutate(detailProgramPlanData)
      ? [
          {
            header: t('common:action'),
            accessorKey: 'action',
            cell: ({ row }: { row: { original: TRatioRow } }) => (
              <div className="ui-flex ui-justify-start ui-items-center ui-gap-2">
                <Button asChild size="sm" variant="subtle">
                  <Link
                    href={setLink(
                      `/v5/program-plan/${programPlanId}/ratio/${row.original.id}/edit`
                    )}
                  >
                    {t('common:edit')}
                  </Link>
                </Button>
                <Button
                  type="button"
                  variant="subtle"
                  className="ui-px-1"
                  color="danger"
                  onClick={() => onClickDelete(row.original)}
                >
                  {t('common:delete')}
                </Button>
              </div>
            ),
          },
        ]
      : []),
  ]

  return schema
}

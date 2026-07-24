import Link from 'next/link'
import { ColumnDef, Row } from '@tanstack/react-table'
import { Button } from '#components/button'
import { hasPermission } from '#shared/permission/index'
import { Task } from '#types/task'
import { parseDateTime } from '#utils/date'
import { TFunction } from 'i18next'

import { TProgramPlanData } from '../../program-plan/list/libs/program-plan-list.type'

const isAllowMutate = (detailProgramPlanData: TProgramPlanData | null) => {
  if (
    !detailProgramPlanData ||
    !hasPermission('task-mutate') ||
    detailProgramPlanData.is_final
  ) {
    return false
  }

  return true
}

type TColumns = {
  t: TFunction<['common', 'task']>
  size: number
  page: number
  programPlanId: number
  lang: string
  detailProgramPlanData: TProgramPlanData | null
  setLink: (link: string) => string
  onClickDetailCoverage: (task: Task) => void
  onClickDelete: (task: Task) => void
}

export const columnsListTask = ({
  t,
  size,
  page,
  programPlanId,
  lang,
  detailProgramPlanData,
  setLink,
  onClickDetailCoverage,
  onClickDelete,
}: TColumns): ColumnDef<Task>[] => {
  return [
    {
      header: 'No.',
      accessorKey: 'no',
      size: 40,
      minSize: 40,
      cell: ({ row: { index } }) => (page - 1) * size + (index + 1),
    },
    {
      header: t('task:list.columns.task_id'),
      accessorKey: 'code',
    },
    {
      header: t('task:list.columns.material_name'),
      accessorKey: 'material.name',
    },
    {
      header: t('task:list.columns.activity'),
      accessorKey: 'activity.name',
    },
    {
      header: t('task:list.columns.national_ip'),
      accessorKey: 'ip',
    },
    {
      header: t('task:list.columns.monthly_distribution'),
      cell: ({ row }) => {
        const month = row.original.month_distribution
        if (month.length === 12) return t('task:list.all_month')

        return month.join(', ')
      },
      size: 160,
    },
    {
      header: t('task:list.columns.group_target'),
      accessorKey: 'target_group',
      cell: ({ row }) => row.original.target_group.name,
    },
    {
      header: t('task:list.columns.number_of_doses'),
      accessorKey: 'number_of_dose',
    },
    {
      header: t('task:list.columns.target_coverage'),
      cell: ({ row }) => {
        const total = row.original.coverage.province_count
        const isAll = total === 0
        const suffix = lang === 'en' && total > 1 ? 's' : ''

        return (
          <div className="ui-space-y-2">
            {isAll ? (
              <p>{t('task:list.all_province')}</p>
            ) : (
              <p>
                {total} {t('common:form.province.label')}
                {suffix}
              </p>
            )}
            <Button
              size="sm"
              variant="subtle"
              className="ui-px-1 ui-h-6 ui-relative -ui-translate-x-1"
              onClick={() => {
                onClickDetailCoverage(row.original)
              }}
            >
              {t('common:see_detail')}
            </Button>
          </div>
        )
      },
    },
    {
      header: t('common:updated_by'),
      cell: ({ row }) => (
        <div>
          <p>{row.original.user_updated_by?.fullname ?? '-'}</p>
          <p className="ui-uppercase">
            {parseDateTime(
              row.original.user_updated_at,
              'DD MMM YYYY HH:mm',
              lang
            )}
          </p>
        </div>
      ),
      maxSize: 360,
    },
    ...(isAllowMutate(detailProgramPlanData)
      ? [
        {
          header: () => (
            <div className="ui-font-semibold ui-pl-3">
              {t('common:action')}
            </div>
          ),
          accessorKey: 'action',
          size: 40,
          maxSize: 40,
          cell: ({ row }: { row: Row<Task> }) => {
            return (
              <div className="ui-flex ui-gap-2">
                <Button
                  asChild
                  id={`btn-link-task-edit-${row.original.id}`}
                  size="sm"
                  variant="subtle"
                >
                  <Link
                    href={setLink(
                      `/v5/program-plan/${programPlanId}/task/${row.original.id}/edit`
                    )}
                  >
                    {t('common:edit')}
                  </Link>
                </Button>
                <Button
                  id={`btn-task-delete-${row.original.id}`}
                  size="sm"
                  variant="subtle"
                  color="danger"
                  onClick={() => onClickDelete(row.original)}
                >
                  {t('common:delete')}
                </Button>
              </div>
            )
          },
        },
      ]
      : []),
  ]
}

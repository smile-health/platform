import { ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'

import StatusIcon from '../components/StatusIcon'
import {
  TCompletenessItem,
  TExaminationColumn,
} from '../libs/bmhp-approval-province-completeness.type'

export const useBmhpApprovalProvinceCompletenessTableColumns = (
  examinationColumns: TExaminationColumn[]
): ColumnDef<TCompletenessItem>[] => {
  const { t } = useTranslation(['bmhpApproval'])

  return [
    {
      id: 'no',
      header: t('bmhpApproval:completeness.no'),
      size: 52,
      cell: ({ row }) => row.original.si_no ?? row.index + 1,
      meta: {
        headerClassName: 'ui-text-center',
        cellClassName: 'ui-text-center ui-text-neutral-500',
      },
    },
    {
      id: 'puskesmas_name',
      header: t('bmhpApproval:completeness.health_care_name'),
      size: 220,
      cell: ({ row }) => (
        <div>
          <div>{row.original.puskesmas_name}</div>
          {row.original.sub_district_name && (
            <div className="ui-text-xs ui-text-neutral-400">
              {row.original.sub_district_name}
            </div>
          )}
        </div>
      ),
    },
    ...examinationColumns.map<ColumnDef<TCompletenessItem>>((col) => ({
      id: `examination_${col.examination_id}`,
      header: col.examination_name,
      size: 120,
      cell: ({ row }) => {
        const screening = row.original.screenings.find(
          (s) => s.examination_id === col.examination_id
        )
        if (!screening) return <span className="ui-text-neutral-300">—</span>
        return <StatusIcon status={screening.status} />
      },
      meta: {
        headerClassName: 'ui-text-center',
        cellClassName: 'ui-text-center',
      },
    })),
    {
      id: 'progress',
      header: t('bmhpApproval:completeness.progress'),
      cell: ({ row }) => (
        <span
          className={
            row.original.progress.completed === row.original.progress.total
              ? 'ui-text-success-600 ui-font-semibold'
              : 'ui-text-neutral-600'
          }
        >
          {row.original.progress.completed}/{row.original.progress.total}
        </span>
      ),
      meta: {
        headerClassName: 'ui-text-center',
        cellClassName: 'ui-text-center',
      },
    },
  ]
}

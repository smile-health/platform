import React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '#components/button'
import useSmileRouter from '#hooks/useSmileRouter'
import dayjs from 'dayjs'
import 'dayjs/locale/id'
import 'dayjs/locale/en'
import { useTranslation } from 'react-i18next'

import { TBmhpApprovalMinistryItem } from '../libs/bmhp-approval-ministry.type'

// ── Action Cell ───────────────────────────────────────────────────────────────

const ActionCell = ({
  item,
  year,
  programPlanId,
}: {
  item: TBmhpApprovalMinistryItem
  year?: string
  programPlanId?: number
}) => {
  const { t } = useTranslation(['bmhpApproval'])
  const router = useSmileRouter()

  // Determine if status persetujuan is "dikirim"
  const isStatusPersetujuanDikirim = (item as any).status_persetujuan === 'dikirim'

  if (item.status !== 1) {
    return <div className="ui-text-center ui-text-neutral-400">-</div>
  }

  return (
    <div className="ui-flex ui-justify-center">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          const queryParams: Record<string, string> = {}
          if (programPlanId) queryParams.program_plan_id = String(programPlanId)

          router.push(`/v5/bmhp-approval-ministry/kako/${item.province_id}`, null, queryParams)
        }}
      >
        {isStatusPersetujuanDikirim
          ? t('bmhpApproval:button.view_recap')
          : t('button.review_entry')}
      </Button>
    </div>
  )

}

// ── Column definitions ────────────────────────────────────────────────────────

import { TFunction } from 'i18next'

export const getBmhpApprovalMinistryTableColumn = ({
  locale,
  t,
  year,
  programPlanId,
}: {
  locale: string
  t: TFunction<['bmhpApproval']>
  year?: string
  programPlanId?: number
}): ColumnDef<TBmhpApprovalMinistryItem>[] => [
    {
      accessorKey: 'si_no',
      header: t('bmhpApproval:ministry.table.no', { defaultValue: 'No' }),
      size: 48,
      meta: { cellClassName: 'ui-w-10 ui-text-center' },
      cell: ({ row }) => row.original.si_no,
      enableSorting: false,
    },
    {
      accessorKey: 'province_name',
      header: t('bmhpApproval:ministry.table.province_name', { defaultValue: 'Nama Provinsi' }),
      enableSorting: false,
      cell: ({ row }) => (
        <span className="ui-font-medium">{row.original.province_name}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: t('bmhpApproval:ministry.table.submission_status', { defaultValue: 'Submission Status' }),
      enableSorting: false,
      size: 200,
      meta: {
        headerClassName: 'ui-text-center',
        cellClassName: 'ui-text-center',
      },
      cell: ({ row }) => {
        const isSubmitted = row.original.status === 1

        const statusText = isSubmitted
          ? t('bmhpApproval:ministry.status.submitted', { defaultValue: 'Dikirim' })
          : t('bmhpApproval:ministry.status.not_submitted', { defaultValue: 'Belum dikirim' })

        const colorClass = isSubmitted
          ? 'ui-text-green-700'
          : 'ui-text-gray-700'

        const submittedAtText = row.original.submitted_at
          ? dayjs(row.original.submitted_at).locale(locale).format('DD MMM YYYY, HH:mm')
          : '-'

        return (
          <div className="ui-flex ui-flex-col ui-items-center ui-gap-1">
            <div
              className={`ui-w-fit ui-text-sm ui-font-semibold ${colorClass}`}
            >
              {statusText}
            </div>
            <span className="ui-text-xs ui-text-neutral-500">{submittedAtText}</span>
          </div>
        )
      },
    },
    // Temporarily comment out status_persetujuan column
    // {
    //   accessorKey: 'status_persetujuan',
    //   header: t('bmhpApproval:ministry.table.approval_status', { defaultValue: 'Status Persetujuan' }),
    //   enableSorting: false,
    //   size: 160,
    //   cell: ({ row }) => {
    //     const statusPersetujuan = (row.original as any).status_persetujuan || 'belum dikirim'

    //     const isDikirim = statusPersetujuan === 'dikirim'

    //     const colorClass = isDikirim
    //       ? 'ui-text-green-700 ui-bg-green-50'
    //       : 'ui-text-gray-700 ui-bg-gray-100'

    //     const statusText = isDikirim
    //       ? t('bmhpApproval:ministry.status.submitted', { defaultValue: 'Dikirim' })
    //       : t('bmhpApproval:ministry.status.not_submitted', { defaultValue: 'Belum dikirim' })

    //     return (
    //       <div
    //         className={`ui-w-fit ui-px-4 ui-py-2 ui-rounded-full ui-text-sm ui-font-semibold ${colorClass}`}
    //       >
    //         {statusText}
    //       </div>
    //     )
    //   },
    // },
    {
      accessorKey: 'actions',
      header: t('bmhpApproval:ministry.table.action', { defaultValue: 'Aksi' }),
      enableSorting: false,
      size: 140,
      cell: ({ row }) => <ActionCell item={row.original} year={year} programPlanId={programPlanId} />,
    },
  ]

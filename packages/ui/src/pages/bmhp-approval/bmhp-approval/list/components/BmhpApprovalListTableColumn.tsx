import { ColumnDef } from '@tanstack/react-table'
import { Button } from '#components/button'
import useSmileRouter from '#hooks/useSmileRouter'

import {
  TBmhpApprovalItem,
  TBmhpProvinceApprovalItem,
  TMainColumn,
} from '../libs/bmhp-approval-list.type'
import BmhpApprovalStatusBadge from './BmhpApprovalStatusBadge'
import {
  ProvinceReportStatusBadge,
  ProvinceReviewStatusBadge,
} from './BmhpProvinceStatusBadge'

import 'dayjs/locale/id'
import 'dayjs/locale/en'

import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import { useUpdateProvinceApprovalStatus } from '../hooks/useBmhpProvinceApprovalList'

const DetailButton = ({ id, status }: { id: number; status: number }) => {
  const { t } = useTranslation(['bmhpApproval'])
  const router = useSmileRouter()

  // Determine base URL based on current path prefix
  const isProvincePath = router.asPath.includes('bmhp-approval-province')
  const baseUrl = isProvincePath
    ? `/v5/bmhp-approval-province`
    : `/v5/bmhp-approval`

  if (status === 0 || status === 2) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => router.push(`${baseUrl}/${id}/completeness-monitoring`)}
      >
        {t('bmhpApproval:button.review_entry')}
      </Button>
    )
  }

  return (
    <Button
      type="button"
      variant="subtle"
      size="sm"
      onClick={() => router.push(`${baseUrl}/${id}/detail/area-program-plans`)}
    >
      {t('bmhpApproval:button.detail')}
    </Button>
  )
}

const ProvinceActionButton = ({
  programPlanId,
  entityId,
  approvalStatus,
}: {
  programPlanId: number
  entityId: number
  approvalStatus: number
}) => {
  const { t } = useTranslation(['bmhpApproval'])
  const { updateStatus, isLoading } = useUpdateProvinceApprovalStatus()

  // 0 or 2: Not Submitted, 1: Submitted (Not Yet Reviewed), 3: Submitted (Reviewed)
  if (approvalStatus === 0 || approvalStatus === 2) {
    return (
      <Button type="button" variant="outline" size="sm" disabled>
        {t('bmhpApproval:province_approval.action.awaiting_submission')}
      </Button>
    )
  }

  if (approvalStatus === 1) {
    return (
      <Button
        type="button"
        variant="solid"
        color="primary"
        size="sm"
        loading={isLoading}
        onClick={() =>
          updateStatus({
            entity_id: entityId,
            program_plan_id: programPlanId,
            status: 3,
          })
        }
      >
        {t('bmhpApproval:province_approval.action.mark_reviewed')}
      </Button>
    )
  }

  if (approvalStatus === 3) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        loading={isLoading}
        onClick={() =>
          updateStatus({
            entity_id: entityId,
            program_plan_id: programPlanId,
            status: 1,
          })
        }
      >
        {t('bmhpApproval:province_approval.action.change_status')}
      </Button>
    )
  }

  return null
}

export const getBmhpApprovalListTableColumn = ({
  t,
}: TMainColumn): ColumnDef<TBmhpApprovalItem>[] => [
  {
    accessorKey: 'si_no',
    header: 'No.',
    size: 20,
    meta: { cellClassName: 'ui-w-10' },
    cell: ({ row }) => Number(row.original.si_no),
    enableSorting: false,
  },
  {
    accessorKey: 'year',
    header: t('bmhpPlanning:year'),
    enableSorting: false,
    meta: { cellClassName: 'ui-w-20' },
    cell: ({ row }) => row.original.year,
  },
  {
    accessorKey: 'status',
    header: t('bmhpApproval:label.approval_status'),
    enableSorting: false,
    meta: { cellClassName: 'ui-w-20' },
    cell: ({ row }) => (
      <BmhpApprovalStatusBadge status={row.original.approval_status ?? 0} />
    ),
  },
  {
    accessorKey: 'actions',
    header: t('common:action'),
    meta: { cellClassName: 'ui-w-20' },
    cell: ({ row }) => (
      <div className="ui-flex ui-justify-start ui-items-center ui-gap-2">
        <DetailButton
          id={row.original.id}
          status={row.original.approval_status ?? 0}
        />
      </div>
    ),
    enableSorting: false,
  },
]

const ProvinceDetailButton = ({
  id,
  entity_id,
}: {
  id: number
  entity_id: number
}) => {
  const { t } = useTranslation(['bmhpApproval'])
  const router = useSmileRouter()

  return (
    <Button
      type="button"
      variant="subtle"
      size="sm"
      onClick={() =>
        router.push(
          `/v5/bmhp-approval-province/${id}/${entity_id}/detail/area-program-plans`
        )
      }
    >
      {t('bmhpApproval:button.detail')}
    </Button>
  )
}

export const getBmhpProvinceApprovalListTableColumn = ({
  t,
}: TMainColumn): ColumnDef<TBmhpProvinceApprovalItem>[] => [
  {
    accessorKey: 'no',
    header: 'No.',
    size: 20,
    meta: { cellClassName: 'ui-w-10' },
    cell: ({ row }) => Number(row.original.no),
    enableSorting: false,
  },
  {
    accessorKey: 'regency_name',
    header: t('bmhpApproval:province_approval.table.col_regency_name'),
    enableSorting: false,
    meta: { cellClassName: 'ui-w-max' },
    cell: ({ row }) => (
      <div className="ui-font-semibold">{row.original.regency_name}</div>
    ),
  },
  {
    accessorKey: 'report_status',
    header: t('bmhpApproval:province_approval.table.col_report_status'),
    enableSorting: false,
    meta: { cellClassName: 'ui-w-30' },
    cell: ({ row }) => (
      <ProvinceReportStatusBadge
        approvalStatus={row.original.approval_status}
      />
    ),
  },
  {
    accessorKey: 'review_status',
    header: t('bmhpApproval:province_approval.table.col_review_status'),
    enableSorting: false,
    meta: { cellClassName: 'ui-w-30' },
    cell: ({ row }) => (
      <ProvinceReviewStatusBadge
        approvalStatus={row.original.approval_status}
      />
    ),
  },
  {
    accessorKey: 'updated_at',
    header: t('bmhpApproval:province_approval.table.col_updated_by_at'),
    enableSorting: false,
    meta: { cellClassName: 'ui-w-min' },
    cell: ({ row }) => {
      if (
        row.original.approval_status === 0 ||
        (!row.original.updated_by && !row.original.updated_at)
      ) {
        return '-'
      }

      return (
        <div className="ui-text-sm">
          <div>{row.original.updated_by || '-'}</div>
          <div className="ui-text-gray-500">
            {row.original.updated_at
              ? dayjs(row.original.updated_at).format('DD/MM/YYYY HH:mm')
              : '-'}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'actions',
    header: t('bmhpApproval:province_approval.table.col_action'),
    meta: { cellClassName: 'ui-w-min' },
    cell: ({ row }) => (
      <div className="ui-flex ui-flex-row gap-2">
        <ProvinceActionButton
          programPlanId={row.original.program_plan_id}
          entityId={row.original.entity_id}
          approvalStatus={row.original.approval_status}
        />
        {(row.original.approval_status === 1 ||
          row.original.approval_status === 3) && (
          <ProvinceDetailButton
            id={row.original.program_plan_id}
            entity_id={row.original.entity_id}
          />
        )}
      </div>
    ),
    enableSorting: false,
  },
]

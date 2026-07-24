import { ColumnDef } from '@tanstack/react-table'
import { Button } from '#components/button'
import { useTranslation } from 'react-i18next'

import { TNeedsAggregateItem } from '../libs/needs-aggregate.types'

type TUseBmhpApprovalNeedsAggregateTableColumns = {
  onCitySelect?: (cityId: number) => void
}

// ── Status Badge Component ─────────────────────────────────────────────────────────

const NeedsAggregateStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const { t } = useTranslation('bmhpApproval')
  const statusConfig: Record<string, { label: string; className: string }> = {
    pending: {
      label: t('needs_aggregate.status.pending'),
      className: 'ui-bg-transparent ui-text-warning-700 ui-border ui-border-warning-500',
    },
    approved: {
      label: t('needs_aggregate.status.approved'),
      className: 'ui-bg-transparent ui-text-success-700 ui-border ui-border-success-500',
    },
    rejected: {
      label: t('needs_aggregate.status.rejected'),
      className: 'ui-bg-transparent ui-text-error-700 ui-border ui-border-error-500',
    },
  }

  const config = statusConfig[status] || statusConfig.pending

  return (
    <span
      className={`ui-inline-flex ui-items-center ui-justify-center ui-px-3 ui-py-1 ui-text-xs ui-font-semibold ui-rounded-full ui-border ${config.className}`}
    >
      {config.label}
    </span>
  )
}

// ── Columns Hook ───────────────────────────────────────────────────────────────────

export const useBmhpApprovalNeedsAggregateTableColumns = ({
  onCitySelect,
}: TUseBmhpApprovalNeedsAggregateTableColumns = {}): ColumnDef<TNeedsAggregateItem>[] => {
  const { t } = useTranslation('bmhpApproval')
  return [
    {
      id: 'no',
      header: t('needs_aggregate.table.col_no'),
      size: 60,
      cell: ({ row }) => row.original.si_no ?? row.index + 1,
      meta: {
        headerClassName: 'ui-text-center ui-font-semibold',
        cellClassName: 'ui-text-center ui-text-neutral-500',
      },
    },
    {
      id: 'city_name',
      header: t('needs_aggregate.table.col_city_name'),
      size: 250,
      cell: ({ row }) => (
        <span className="ui-text-sm ui-font-medium ui-text-neutral-800">
          {row.original.city_name}
        </span>
      ),
      meta: {
        headerClassName: 'ui-font-semibold',
      },
    },
    {
      id: 'actions',
      header: t('needs_aggregate.table.col_action'),
      size: 140,
      cell: ({ row }) => (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onCitySelect?.(row.original.city_id)}
          className="ui-border-primary-500 ui-text-primary-500 hover:ui-bg-primary-50"
        >
          {t('needs_aggregate.table.btn_review_needs')}
        </Button>
      ),
      meta: {
        headerClassName: 'ui-text-center ui-font-semibold',
        cellClassName: 'ui-text-center',
      },
    },
    {
      id: 'status',
      header: t('needs_aggregate.table.col_review_status'),
      size: 140,
      cell: ({ row }) => <NeedsAggregateStatusBadge status={row.original.status} />,
      meta: {
        headerClassName: 'ui-text-center ui-font-semibold',
        cellClassName: 'ui-text-center',
      },
    },
    {
      id: 'updated_by',
      header: t('needs_aggregate.table.col_updated_by'),
      size: 220,
      cell: ({ row }) => {
        const updatedByName = row.original.user_updated_by?.name ?? '-'
        const formattedDate = row.original.updated_at
          ? new Date(row.original.updated_at).toLocaleString('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : null

        return (
          <div className="ui-flex ui-flex-col">
            <span className="ui-text-sm ui-font-medium ui-text-neutral-800">
              {updatedByName}
            </span>
            {formattedDate && (
              <span className="ui-text-xs ui-text-neutral-500">
                {formattedDate}
              </span>
            )}
          </div>
        )
      },
      meta: {
        headerClassName: 'ui-font-semibold',
      },
    },
  ]
}

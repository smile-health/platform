import { ColumnDef } from '@tanstack/react-table'
import dayjs from 'dayjs'
import 'dayjs/locale/id'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Button } from '#components/button'
import { useTranslation } from 'react-i18next'

import { TProvinceItem } from '../libs/bmhp-approval-province-completeness.type'
import BmhpApprovalProvinceStatusBadge from '../components/BmhpApprovalProvinceStatusBadge'

dayjs.locale('id')
dayjs.extend(relativeTime)

type TUseBmhpApprovalProvinceTableColumns = {
  onCitySelect?: (cityId: number) => void
}

export const useBmhpApprovalProvinceTableColumns = ({
  onCitySelect,
}: TUseBmhpApprovalProvinceTableColumns = {}): ColumnDef<TProvinceItem>[] => {
  const { t } = useTranslation('bmhpApproval')
  return [
    {
      id: 'no',
      header: t('province_completeness.table.col_no'),
      size: 60,
      cell: ({ row }) => row.original.si_no ?? row.index + 1,
      meta: {
        headerClassName: 'ui-text-center ui-font-semibold',
        cellClassName: 'ui-text-center ui-text-neutral-500',
      },
    },
    {
      id: 'city_name',
      header: t('province_completeness.table.col_city_name'),
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
      header: t('province_completeness.table.col_action'),
      size: 140,
      cell: ({ row }) => (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onCitySelect?.(row.original.city_id)}
          className="ui-border-primary-500 ui-text-primary-500 hover:ui-bg-primary-50"
        >
          {t('province_completeness.table.btn_review_target')}
        </Button>
      ),
      meta: {
        headerClassName: 'ui-text-center ui-font-semibold',
        cellClassName: 'ui-text-center',
      },
    },
    {
      id: 'status',
      header: t('province_completeness.table.col_review_status'),
      size: 140,
      cell: ({ row }) => <BmhpApprovalProvinceStatusBadge status={row.original.status} />,
      meta: {
        headerClassName: 'ui-text-center ui-font-semibold',
        cellClassName: 'ui-text-center',
      },
    },
    {
      id: 'updated_by',
      header: t('province_completeness.table.col_updated_by'),
      size: 220,
      cell: ({ row }) => {
        const updatedByName = row.original.user_updated_by?.name ?? '-'
        const formattedDate = row.original.updated_at
          ? dayjs(row.original.updated_at).format('DD MMM YYYY, HH:mm')
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

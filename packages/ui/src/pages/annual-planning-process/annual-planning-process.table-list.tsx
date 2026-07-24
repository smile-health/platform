import { Button, ButtonVariant } from "#components/button"
import { CellContext, ColumnDef, HeaderContext } from "@tanstack/react-table"
import {
  AnnualNeedsDataProvince,
  AnnualPlanningProcessDataDistrict,
} from "./annual-planning-process.types"
import { TFunction } from "i18next"
import Link from "next/link"
import { AnnualPlanningProcessStatus, MinMaxStatus } from "./annual-planning-process.constants"
import cx from "#lib/cx"
import ColumnStatusAnnualPlanning from "./components/ColumnStatusAnnualPlanning"
import { Checkbox } from "#components/checkbox"
import { parseDateTime } from "#utils/date"

type ColumnsDistrictProps = {
  t: TFunction<['annualPlanningProcess', 'common']>
  onClickRow: (data: AnnualPlanningProcessDataDistrict) => void
  no: number
  createUrlDetail: (data: AnnualPlanningProcessDataDistrict) => string
  isViewOnly?: boolean
}
export const columnsDistrict = ({
  t,
  onClickRow,
  no,
  createUrlDetail,
  isViewOnly,
}: ColumnsDistrictProps): ColumnDef<AnnualPlanningProcessDataDistrict>[] => [
    {
      header: 'No',
      accessorKey: 'no',
      cell: ({ row: { index } }) => index + 1 + no,
      size: 50,
    },
    {
      header: t('annualPlanningProcess:list.column.program_plan'),
      accessorKey: 'year',
      cell: ({ row: { original } }) => original?.program_plan?.year || '-',
    },
    {
      header: t('annualPlanningProcess:list.column.approval_status'),
      accessorKey: 'status',
      cell: (info) => <ColumnStatusAnnualPlanning statusId={info.getValue() as number} />
    },
    {
      header: t('common:action'),
      accessorKey: 'action',
      size: 180,
      cell: ({ row }) => {
        const { status } = row.original
        let buttonConfig = {
          text: t('common:detail'),
          variant: 'subtle'
        }

        if (status === AnnualPlanningProcessStatus.REVISION) {
          buttonConfig = { text: t('annualPlanningProcess:list.action.correct_data'), variant: 'outline' }
        } else if (status === AnnualPlanningProcessStatus.DRAFT) {
          buttonConfig = { text: t('annualPlanningProcess:list.action.continue_calculation'), variant: 'outline' }
        }

        if (!buttonConfig.text) return '-'

        return (
          <Button
            onClick={() => onClickRow(row.original)}
            variant={buttonConfig.variant as ButtonVariant}
            type="button"
            id={`action-detail-${row.id}`}
            size="sm"
            className={cx({
              "ui-px-0": buttonConfig.variant === "subtle"
            })}
            disabled={isViewOnly}
          >
            {isViewOnly ? buttonConfig.text : (
              <Link href={createUrlDetail(row.original)}>
                {buttonConfig.text}
              </Link>
            )}
          </Button>
        )
      },
    },
  ]

type ColumnsProvinceProps = {
  t: TFunction<['annualPlanningProcess', 'common']>
  onClickRow: (data: AnnualNeedsDataProvince) => void
  no: number
  createUrlDetail: (data: AnnualNeedsDataProvince) => string
  showCheckbox: boolean
  selectedIds: number[]
  onCheckedChange: (type: 'all' | 'row', id?: number) => void
  isViewOnly?: boolean
  minMaxAnnualNeedIdsActivated: number[]
}
export const columnsProvince = ({
  t,
  onClickRow,
  no,
  createUrlDetail,
  showCheckbox,
  selectedIds,
  onCheckedChange,
  isViewOnly,
  minMaxAnnualNeedIdsActivated,
}: ColumnsProvinceProps): ColumnDef<AnnualNeedsDataProvince>[] => [
    ...showCheckbox ? [
      {
        id: 'select',
        header: ({ table }: HeaderContext<AnnualNeedsDataProvince, unknown>) => {
          const rows = table.getRowModel().rows;

          const allValidToSelect = rows.filter((row) => {
            const { min_max_status, status } = row.original

            return (min_max_status === MinMaxStatus.INACTIVE || !min_max_status) && status === AnnualPlanningProcessStatus.APPROVED
          })

          return (
            <Checkbox
              checked={selectedIds.length > 0 || minMaxAnnualNeedIdsActivated.length > 0}
              indeterminate={selectedIds.length < allValidToSelect.length}
              onChange={() => onCheckedChange('all')}
            />
          )
        },
        cell: ({ row }: CellContext<AnnualNeedsDataProvince, unknown>) => {
          const { min_max_status, status, id } = row.original

          return (
            <Checkbox
              checked={id ? selectedIds.includes(id) || min_max_status === MinMaxStatus.ACTIVE : false}
              onChange={() => onCheckedChange('row', id)}
              disabled={status !== AnnualPlanningProcessStatus.APPROVED || min_max_status === MinMaxStatus.ACTIVE}
            />
          )
        },
        enableSorting: false,
        enableHiding: false,
        size: 50,
      },
    ] : [],
    {
      header: 'No',
      accessorKey: 'no',
      cell: ({ row: { index } }) => index + 1 + no,
      size: 50,
    },
    {
      header: t('annualPlanningProcess:list.column.program_plan'),
      accessorKey: 'year',
      cell: ({ row: { original } }) => original?.program_plan?.year || '-',
    },
    {
      header: t('annualPlanningProcess:list.column.city_district'),
      accessorKey: 'entity.name',
      cell: ({ row: { original } }) => original?.entity?.name ?? '-',
    },
    {
      header: t('annualPlanningProcess:list.column.approval_status'),
      accessorKey: 'status',
      cell: (info) => <ColumnStatusAnnualPlanning statusId={info.getValue() as number} />
    },
    {
      header: t('annualPlanningProcess:list.column.min_max_status'),
      accessorKey: 'min_max_status',
      cell: ({ getValue, row: { original: { min_max_updated_at } } }) => (
        <div className="ui-flex ui-flex-col ui-gap-2">
          <span>
            {getValue() === MinMaxStatus.ACTIVE ? t('annualPlanningProcess:list.min_max.already_activated') : t('common:status.inactive')}
          </span>
          {getValue() === MinMaxStatus.ACTIVE && (
            <span>
              {parseDateTime(min_max_updated_at || '', 'DD MMM YYYY HH:mm').toUpperCase()}
            </span>
          )}
        </div>
      ),
    },
    {
      header: t('common:action'),
      accessorKey: 'action',
      size: 180,
      cell: ({ row }) => {
        const { status } = row.original
        let buttonConfig = {
          text: t('common:detail'),
          variant: 'subtle'
        }

        if (status === AnnualPlanningProcessStatus.DESK) {
          buttonConfig = { text: t('annualPlanningProcess:list.action.review_entry'), variant: 'outline' }
        } else if (status === AnnualPlanningProcessStatus.DRAFT) {
          buttonConfig = { text: '', variant: '' }
        }

        if (!buttonConfig.text) return '-'

        return (
          <Button
            onClick={() => onClickRow(row.original)}
            variant={buttonConfig.variant as ButtonVariant}
            type="button"
            id={`action-detail-${row.id}`}
            size="sm"
            className={cx({
              "ui-px-0": buttonConfig.variant === "subtle"
            })}
            disabled={isViewOnly}
          >
            {isViewOnly ? buttonConfig.text : (
              <Link href={createUrlDetail(row.original)}>
                {buttonConfig.text}
              </Link>
            )}
          </Button>
        )
      },
    },
  ]
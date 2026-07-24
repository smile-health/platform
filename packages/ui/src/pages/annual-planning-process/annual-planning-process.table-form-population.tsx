import { ColumnDef } from "@tanstack/react-table"
import {
  ListInformationPopulationTarget,
  ListPopulationTargetHealthCare,
} from "./annual-planning-process.types"
import { TFunction } from "i18next"
import { parseDateTime } from "#utils/date"
import { numberFormatter } from "#utils/formatter"
import ColumnPopulationAdjustment from "./components/ColumnPopulationAdjustment"
import { isAllDataApproved } from "./annual-planning-process.utils"

const headerClassName = 'ui-px-1 ui-py-4 ui-bg-neutral-100 ui-border-r ui-border-gray-300 ui-text-center'
const cellClassName = (index: number) => `ui-border-r ui-border-gray-300 ui-text-center ${index > 0 ? 'ui-bg-primary-50 ui-bg-opacity-30' : ''}`
export const columnsInformationPopulationTarget = (
  language: string
): ColumnDef<ListInformationPopulationTarget>[] => [
    {
      header: '',
      accessorKey: 'name',
      size: 90,
      meta: {
        headerClassName,
        cellClassName: ({ index }) => cellClassName(index) + ' !ui-bg-neutral-100'
      },
    },
    {
      header: 'Bayi Lahir Hidup',
      accessorKey: 'qty_key_1',
      cell: (info) => numberFormatter(info.getValue() as number, language),
      meta: {
        headerClassName,
        cellClassName: ({ index }) => cellClassName(index)
      }
    },
    {
      header: 'Anak Baduta',
      accessorKey: 'qty_key_2',
      cell: (info) => numberFormatter(info.getValue() as number, language),
      meta: {
        headerClassName,
        cellClassName: ({ index }) => cellClassName(index)
      }
    },
    {
      header: 'Murid Kelas 1 SD',
      accessorKey: 'qty_key_3',
      cell: (info) => numberFormatter(info.getValue() as number, language),
      meta: {
        headerClassName,
        cellClassName: ({ index }) => cellClassName(index)
      }
    },
    {
      header: 'Murid Kelas 2 SD',
      accessorKey: 'qty_key_4',
      cell: (info) => numberFormatter(info.getValue() as number, language),
      meta: {
        headerClassName,
        cellClassName: ({ index }) => cellClassName(index)
      }
    },
    {
      header: 'Murid Kelas 5 SD',
      accessorKey: 'qty_key_5',
      cell: (info) => numberFormatter(info.getValue() as number, language),
      meta: {
        headerClassName,
        cellClassName: ({ index }) => cellClassName(index)
      }
    },
    {
      header: 'Murid Kelas 6 SD',
      accessorKey: 'qty_key_6',
      cell: (info) => numberFormatter(info.getValue() as number, language),
      meta: {
        headerClassName,
        cellClassName: ({ index }) => cellClassName(index)
      }
    },
    {
      header: 'Murid Wanita Kelas 5 SD',
      accessorKey: 'qty_key_7',
      cell: (info) => numberFormatter(info.getValue() as number, language),
      meta: {
        headerClassName,
        cellClassName: ({ index }) => cellClassName(index)
      }
    },
    {
      header: 'Murid Wanita Kelas 6 SD',
      accessorKey: 'qty_key_8',
      cell: (info) => numberFormatter(info.getValue() as number, language),
      meta: {
        headerClassName,
        cellClassName: ({ index }) => cellClassName(index)
      }
    },
    {
      header: 'Wanita Usia Subur (termasuk Ibu hamil)',
      accessorKey: 'qty_key_9',
      cell: (info) => numberFormatter(info.getValue() as number, language),
      meta: {
        headerClassName: 'ui-px-1 ui-py-4 ui-bg-neutral-100 ui-text-center',
        cellClassName: ({ index }) => `ui-text-center ${index > 0 ? 'ui-bg-primary-50 ui-bg-opacity-30' : ''}`
      }
    },
  ]

type ColumnsPopulationTargetHealthCare = {
  t: TFunction<['annualPlanningProcess', 'common']>
  language: string
  onClickRow: (index: number, data: ListPopulationTargetHealthCare) => void
  isRevision: boolean
}
export const columnsPopulationTargetHealthCare = ({
  t,
  language,
  onClickRow,
  isRevision,
}: ColumnsPopulationTargetHealthCare): ColumnDef<ListPopulationTargetHealthCare>[] => [
    {
      header: 'No',
      accessorKey: 'no',
      cell: ({ row: { index } }) => index + 1,
      size: 50,
      meta: { cellClassName: ({ original: { data } }) => !isAllDataApproved(data) && isRevision ? 'ui-bg-[#FEF2F2]' : '' }
    },
    {
      header: t('annualPlanningProcess:create.form.column', { returnObjects: true })[0],
      accessorKey: 'name',
      cell: ({ row: { original: { name, sub_district } } }) => (
        <div className="ui-flex ui-flex-col ui-gap-1 ui-justify-center">
          <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-dark-blue">
            {name ?? '-'}
          </p>
          <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-neutral-500">
            {sub_district?.name ?? '-'}
          </p>
        </div>
      ),
      meta: { cellClassName: ({ original: { data } }) => !isAllDataApproved(data) && isRevision ? 'ui-bg-[#FEF2F2]' : '' }
    },
    {
      header: t('annualPlanningProcess:create.form.column', { returnObjects: true })[1],
      accessorKey: 'correction',
      cell: ({ row }) => (
        <ColumnPopulationAdjustment
          isRevision={isRevision}
          t={t}
          onClickRow={() => onClickRow(row.index, row.original)}
          original={row.original}
        />
      ),
      meta: { cellClassName: ({ original: { data } }) => !isAllDataApproved(data) && isRevision ? 'ui-bg-[#FEF2F2]' : '' }
    },
    {
      header: t('annualPlanningProcess:create.form.column', { returnObjects: true })[2],
      accessorKey: 'updated_by',
      cell: ({ row: { original: { user_updated_by, updated_at } } }) => (
        <div className="ui-flex ui-flex-col ui-gap-1 ui-justify-center">
          <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-dark-blue">
            {user_updated_by?.name ?? '-'}
          </p>
          <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-neutral-500">
            {updated_at ? parseDateTime(updated_at, 'DD MMM YYYY HH:mm', language).toUpperCase() : '-'}
          </p>
        </div>
      ),
      meta: { cellClassName: ({ original: { data } }) => !isAllDataApproved(data) && isRevision ? 'ui-bg-[#FEF2F2]' : '' }
    },
  ]

export const columnsChildPopulationCorrectionPreview = (
  t: TFunction<['annualPlanningProcess', 'common']>
) => [
    {
      header: t('annualPlanningProcess:create.form.column', { returnObjects: true })[3],
      key: 'header-percentage', className: 'ui-text-center'
    },
    {
      header: t('annualPlanningProcess:create.form.column', { returnObjects: true })[4],
      key: 'header-qty-pusdatin', className: 'ui-text-center'
    },
    {
      header: t('annualPlanningProcess:create.form.column', { returnObjects: true })[5],
      key: 'header-qty-correction', className: 'ui-text-center'
    },
  ]
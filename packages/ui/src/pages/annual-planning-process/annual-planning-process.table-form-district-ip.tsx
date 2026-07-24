import { CellContext, ColumnDef } from "@tanstack/react-table"
import {
  GetDetailAnnualPlanningProcessDistrictIPResponse,
  ListMaterialIP,
} from "./annual-planning-process.types"
import { TFunction } from "i18next"
import { parseDateTime } from "#utils/date"
import { numberFormatter } from "#utils/formatter"
import ColumnStatus from "./components/ColumnStatusMaterial"

type ColumnsMaterialList = {
  t: TFunction<'annualPlanningProcess'>
  language: string
  isReview: boolean
  isRevision: boolean
}
export const columnsMaterialList = ({
  t,
  language,
  isReview,
  isRevision,
}: ColumnsMaterialList): ColumnDef<ListMaterialIP>[] => [
    {
      header: 'No',
      accessorKey: 'no',
      cell: ({ row: { index } }) => index + 1,
      size: 50,
    },
    {
      header: t('create.form.district_ip.column.material_name'),
      accessorKey: 'material.name',
      minSize: 250,
    },
    {
      header: t('create.form.district_ip.column.activity'),
      accessorKey: 'activity.name',
    },
    {
      header: t('create.form.district_ip.column.target_group'),
      accessorKey: 'target_group.name',
      cell: (info) => info.getValue() ?? '-',
    },
    {
      header: 'SKU',
      accessorKey: 'sku',
    },
    {
      header: t('create.form.district_ip.column.national_ip'),
      accessorKey: 'national_ip',
      cell: (info) => numberFormatter(info.getValue() as number, language),
    },
    {
      header: t('create.form.district_ip.column.district_ip'),
      accessorKey: 'district_ip',
      cell: (info) => numberFormatter(info.getValue() as number, language),
    },
    ...isReview || isRevision ? [
      {
        header: t('create.form.district_ip.column.data_status'),
        accessorKey: 'district_ip',
        cell: ({ row: { original: { status } } }: CellContext<ListMaterialIP, unknown>) => (
          <ColumnStatus status={status} t={t} />
        ),
      },
    ] : [],
    {
      header: t('create.form.district_ip.column.latest_updated_by'),
      accessorKey: 'updated',
      cell: ({ row: { original: { updated_at, user_updated_by } } }) => (
        <div className="ui-flex ui-flex-col ui-gap-1 ui-justify-center">
          <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-dark-blue">
            {user_updated_by?.name ?? '-'}
          </p>
          <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-neutral-500">
            {updated_at ? parseDateTime(updated_at, 'DD MMM YYYY HH:mm', language).toUpperCase() : '-'}
          </p>
        </div>
      )
    },
  ]

type ColumnsDetailMaterialList = {
  t: TFunction<'annualPlanningProcess'>
  language: string
}
export const columnsDetailMaterialList = ({
  t,
  language,
}: ColumnsDetailMaterialList): ColumnDef<GetDetailAnnualPlanningProcessDistrictIPResponse['data'][number]>[] => [
    {
      header: 'No',
      accessorKey: 'no',
      cell: ({ row: { index } }) => index + 1,
      size: 50,
    },
    {
      header: t('create.form.district_ip.column.material_name'),
      accessorKey: 'material.name',
      minSize: 250,
    },
    {
      header: t('create.form.district_ip.column.activity'),
      accessorKey: 'activity.name',
    },
    {
      header: t('create.form.district_ip.column.target_group'),
      accessorKey: 'target_group.name',
      cell: (info) => info.getValue() ?? '-',
    },
    {
      header: 'SKU',
      accessorKey: 'sku',
    },
    {
      header: t('create.form.district_ip.column.national_ip'),
      accessorKey: 'national_ip',
      cell: (info) => numberFormatter(info.getValue() as number, language),
    },
    {
      header: t('create.form.district_ip.column.district_ip'),
      accessorKey: 'regency_ip',
      cell: (info) => numberFormatter(info.getValue() as number, language),
    },
    {
      header: t('create.form.district_ip.column.latest_updated_by'),
      accessorKey: 'updated',
      cell: ({ row: { original: { user_updated_by, updated_at } } }) => (
        <div className="ui-flex ui-flex-col ui-gap-1 ui-justify-center">
          <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-dark-blue">
            {user_updated_by?.name ?? '-'}
          </p>
          <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-neutral-500">
            {updated_at ? parseDateTime(updated_at, 'DD MMM YYYY HH:mm', language).toUpperCase() : '-'}
          </p>
        </div>
      )
    },
  ]


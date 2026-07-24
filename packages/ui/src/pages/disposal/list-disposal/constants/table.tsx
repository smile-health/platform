import { ColumnDef } from "@tanstack/react-table"
import { Disposal, StockDisposal } from "../types/disposal"
import { TFunction } from "i18next"
import { numberFormatter } from "#utils/formatter"
import { parseDateTime } from "#utils/date"
import { Button } from "#components/button"

type ColumnsProps = {
  onClickRow: (disposal: Disposal) => void
  t: TFunction<['common', 'disposalList']>
  no: number
  language: string
}

type ColumnsDetailProps = {
  onClickRow: (stock: StockDisposal) => void
  t: TFunction<'disposalList'>
  language: string
}

export const columns = ({
  onClickRow,
  t,
  no,
  language,
}: ColumnsProps): ColumnDef<Disposal>[] => [
    {
      header: t('disposalList:table.column.si_no'),
      accessorKey: 'no',
      cell: ({ row: { index } }) => index + 1 + no,
      size: 50,
      meta: {
        cellClassName: 'ui-text-dark-blue ui-content-center'
      },
    },
    {
      header: 'Material',
      accessorKey: 'material.name',
      minSize: 180,
      meta: {
        cellClassName: 'ui-text-dark-blue ui-content-center'
      },
    },
    {
      header: t('disposalList:table.column.enitity_name'),
      accessorKey: 'entity.name',
      size: 280,
      cell: ({
        row: {
          original: { entity },
        },
      }) => {
        const result = [
          entity?.province?.name,
          entity?.regency?.name,
          entity?.sub_district?.name,
          entity?.village?.name,
        ].filter(Boolean).join(', ') || entity?.address || '-'

        return (
          <div className="ui-flex ui-flex-col ui-gap-1 ui-justify-center">
            <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-dark-blue">
              {entity?.name ?? '-'}
            </p>
            <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-neutral-500">
              {entity?.address || result}
            </p>
          </div>
        )
      },
      meta: {
        cellClassName: 'ui-content-center',
      },
    },
    {
      header: t('disposalList:table.column.stock_from_discard'),
      accessorKey: 'total_disposal_discard_qty',
      cell: ({ getValue, row }) => {
        // Handle both new and legacy field names
        const value = getValue() || row.original.extermination_discard_qty || 0
        return numberFormatter(Number(value), language)
      },
      size: 190,
      meta: {
        cellClassName: 'ui-text-dark-blue ui-content-center',
      },
    },
    {
      header: t('disposalList:table.column.stock_from_received'),
      accessorKey: 'total_disposal_received_qty',
      cell: ({ getValue, row }) => {
        // Handle both new and legacy field names
        const value = getValue() || row.original.extermination_received_qty || 0
        return numberFormatter(Number(value), language)
      },
      size: 190,
      meta: {
        cellClassName: 'ui-text-dark-blue ui-content-center',
      },
    },
    {
      header: t('disposalList:table.column.updated_at'),
      accessorKey: 'stock_update',
      size: 150,
      cell: ({
        getValue,
        row: {
          original: { stock_last_update },
        },
      }) => {
        const updateTime = getValue() || stock_last_update
        return updateTime ? parseDateTime(String(updateTime), 'DD MMM YYYY HH:mm').toUpperCase() : '-'
      },
      meta: {
        cellClassName: 'ui-content-center',
      },
    },
    {
      header: t('disposalList:table.column.action'),
      accessorKey: 'action',
      meta: {
        cellClassName: 'ui-content-center',
      },
      cell: ({ row }) => (
        <Button
          onClick={() => onClickRow(row.original)}
          variant="subtle"
          type="button"
          id={`action-detail-${row.id}`}
        >
          {t('disposalList:table.action.detail')}
        </Button>
      ),
    },
  ]

export type TrademarkMaterial = {
  id: string
  material_name: string
  manufacturer_name: string
  stock_from_discard: number
  stock_from_received: number
  updated_at: string
}

type ColumnsTrademarkMaterialProps = {
  t: TFunction<'disposalList'>
  language: string
  onViewDetail: (index: number) => void
}

export const columnsTrademarkMaterial = ({
  t,
  language,
  onViewDetail,
}: ColumnsTrademarkMaterialProps): ColumnDef<TrademarkMaterial>[] => [
    {
      header: 'SI.No',
      accessorKey: 'no',
      cell: ({ row: { index } }) => index + 1,
      size: 80,
      meta: {
        cellClassName: 'ui-text-dark-blue ui-content-center'
      },
    },
    {
      header: t('detail.trademark.table.column.material'),
      accessorKey: 'material_name',
      minSize: 300,
      meta: {
        cellClassName: 'ui-text-dark-blue ui-content-center',
      },
    },
    {
      header: t('detail.trademark.table.column.stock_from_discard'),
      accessorKey: 'stock_from_discard',
      cell: ({ getValue }) => numberFormatter(Number(getValue()) || 0, language),
      size: 180,
      meta: {
        cellClassName: 'ui-text-dark-blue ui-content-center',
      },
    },
    {
      header: t('detail.trademark.table.column.stock_from_received'),
      accessorKey: 'stock_from_received',
      cell: ({ getValue }) => numberFormatter(Number(getValue()) || 0, language),
      size: 190,
      meta: {
        cellClassName: 'ui-text-dark-blue ui-content-center',
      },
    },
    {
      header: t('detail.trademark.table.column.updated_at'),
      accessorKey: 'updated_at',
      cell: ({ getValue }) => parseDateTime(String(getValue()), 'DD MMM YYYY HH:mm').toUpperCase(),
      size: 160,
      meta: {
        cellClassName: 'ui-content-center',
      },
    },
    {
      header: t('detail.trademark.table.column.action'),
      accessorKey: 'action',
      size: 120,
      meta: {
        cellClassName: 'ui-content-center',
      },
      cell: ({ row }) => (
        <Button
          variant="subtle"
          type="button"
          id={`action-detail-${row.id}`}
          onClick={() => onViewDetail(row.index)}
        >
          {t('detail.trademark.table.action.view_detail')}
        </Button>
      ),
    },
  ]

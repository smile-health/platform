import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '#components/checkbox'
import CheckOpnamed from '#components/icons/CheckOpnamed'
import { DetailStock, Stock } from '#types/stock'
import { parseDateTime } from '#utils/date'
import { numberFormatter } from '#utils/formatter'
import { TFunction } from 'i18next'

type CreateColumnMaterial = {
  t: TFunction<'stockOpnameCreate'>
  language: string
  classRow: (item: Stock) => string
  checkStatusMaterial: (item: Stock) => boolean
}

type CreateColumnTrademark = {
  t: TFunction<['common', 'stockOpnameCreate']>
  language: string
  classRow: (item: DetailStock) => string
  checkStatusMaterial: (item: DetailStock) => boolean
}

type CreateColumnStockOpnameProps = {
  t: TFunction<['common', 'stockOpnameCreate']>
}

export const createColumnMaterial = ({
  t,
  language,
  classRow,
  checkStatusMaterial,
}: CreateColumnMaterial): ColumnDef<Stock>[] => [
  {
    accessorKey: 'material.name',
    header: t('form.material.table.column.name'),
    size: 450,
    cell: ({ row: { original } }) => (
      <div>
        {original?.material?.name ?? ''}
        {original?.last_opname_date && (
          <div className="ui-flex ui-space-x-1 ui-items-center">
            <CheckOpnamed className="ui-h-4 ui-w-4 ui-text-green-700" />

            <p className="ui-text-green-700">
              {t('form.material.table.column.last_update', {
                date: parseDateTime(
                  original.last_opname_date,
                  'DD/MM/YYYY HH:mm'
                ),
              })}
            </p>
          </div>
        )}
      </div>
    ),
    meta: {
      cellClassName: ({ original }) => classRow(original),
    },
  },
  {
    accessorKey: 'total_qty',
    header: t('form.material.table.column.remaining_stock'),
    cell: ({ row: { original } }) =>
      numberFormatter(original.aggregate?.total_qty, language),
    meta: {
      cellClassName: ({ original }) => classRow(original),
    },
    size: 200,
  },
  {
    accessorKey: 'material',
    header: t('form.material.table.column.selection'),
    meta: {
      cellClassName: ({ original }) => classRow(original),
    },
    cell: ({ row }: any) => {
      const statusChecked = checkStatusMaterial(row.original)
      return <Checkbox checked={statusChecked} />
    },
  },
]

export const createColumnTrademark = ({
  t,
  language,
  classRow,
  checkStatusMaterial,
}: CreateColumnTrademark): ColumnDef<DetailStock>[] => [
  {
    accessorKey: 'material.name',
    header: t('stockOpnameCreate:form.trademark.table.column.name'),
    size: 450,
    cell: ({ row: { original } }) => original?.material?.name ?? '-',
    meta: {
      cellClassName: ({ original }) => classRow(original),
    },
  },
  {
    accessorKey: 'total_qty',
    header: t('stockOpnameCreate:form.trademark.table.column.remaining_stock'),
    cell: ({ row: { original } }) =>
      numberFormatter(original.total_qty, language),
    meta: {
      cellClassName: ({ original }) => classRow(original),
    },
    size: 200,
  },
  {
    accessorKey: 'so_info',
    header: t('stockOpnameCreate:form.trademark.table.column.so_info'),
    cell: ({ row: { original } }) =>
      !original.last_opname_date ? (
        '-'
      ) : (
        <div className="ui-flex ui-space-x-1 ui-items-center">
          <CheckOpnamed className="ui-h-4 ui-w-4 ui-text-green-700" />

          <p className="ui-text-green-700">
            {parseDateTime(original.last_opname_date, 'DD/MM/YYYY HH:mm')}
          </p>
        </div>
      ),
    meta: {
      cellClassName: ({ original }) => classRow(original),
    },
    size: 200,
  },
  {
    accessorKey: 'material',
    header: t('stockOpnameCreate:form.trademark.table.column.selection'),
    meta: {
      cellClassName: ({ original }) => classRow(original),
    },
    size: 100,
    cell: ({ row }: any) => {
      const statusChecked = checkStatusMaterial(row.original)
      return <Checkbox checked={statusChecked} />
    },
  },
]

export const createColumnStockOpname = ({
  t,
}: CreateColumnStockOpnameProps) => [
  {
    header: 'No',
    id: 'no',
    minSize: 40,
  },
  {
    header: t('stockOpnameCreate:form.transaction.columns.material_info'),
    id: 'material',
    size: 200,
  },
  {
    header: 'Batch',
    id: 'stock-on-hand',
    size: 200,
  },
  {
    header: t('stockOpnameCreate:form.transaction.columns.action'),
    id: 'action',
    size: 60,
  },
]

export const createColumnStockOpnameDetail = ({
  t,
}: CreateColumnStockOpnameProps) => [
  {
    header: 'Si.No',
    id: 'no',
    minSize: 50,
  },
  {
    header: t('stockOpnameCreate:form.transaction.columns.batch'),
    id: 'batch',
    minSize: 200,
  },
  {
    header: t('stockOpnameCreate:form.transaction.columns.activity'),
    id: 'activity',
    minSize: 180,
  },
  {
    header: t('stockOpnameCreate:form.transaction.columns.remaining_stock'),
    id: 'remaining-stock',
    minSize: 150,
  },
  {
    header: t('stockOpnameCreate:form.transaction.columns.stock_in_transit'),
    id: 'stock-in-transit',
    minSize: 130,
  },
  {
    header: t('stockOpnameCreate:form.transaction.columns.real_stock'),
    id: 'real-stock',
    minSize: 130,
  },
]

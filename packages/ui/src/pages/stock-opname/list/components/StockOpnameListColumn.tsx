import { ColumnDef } from '@tanstack/react-table'
import dayjs from 'dayjs'

import {
  textGrouper,
  thousandFormatter,
} from '../libs/stock-opname-list.common'
import {
  TStockOpnameData,
  TStockOpnameMainColumn,
} from '../libs/stock-opname-list.types'
import StockOpnameStatusBox from './StockOpnameStatusBox'
import StockOpnameTitleBlock from './StockOpnameTitleBlock'

import 'dayjs/locale/id'
import 'dayjs/locale/en'

export const mainColumn = ({ t, locale }: TStockOpnameMainColumn) => {
  const schema: Array<ColumnDef<TStockOpnameData>> = [
    {
      header: 'No.',
      accessorKey: 'no',
      size: 20,
      cell: ({
        row: {
          original: { si_no },
        },
      }) => thousandFormatter({ value: si_no as number, locale }) ?? '',
    },
    {
      header: t('stockOpname:columns.entity_name'),
      accessorKey: 'entity',
      cell: ({
        row: {
          original: {
            entity: { name, location },
          },
        },
      }) => (
        <StockOpnameTitleBlock
          arrText={[
            {
              label: name?.toUpperCase() ?? '',
              className: 'ui-text-sm ui-font-bold ui-text-dark-blue ui-mb-1',
            },
            {
              label: location ?? '',
              className: 'ui-text-sm ui-font-thin ui-text-neutral-500',
            },
          ]}
        />
      ),
    },
    {
      header: t('stockOpname:columns.material_info'),
      accessorKey: 'material',
      cell: ({
        row: {
          original: { material, parent_material },
        },
      }) =>
        !!parent_material?.name || !!material?.name ? (
          <StockOpnameTitleBlock
            arrText={[
              {
                label: parent_material?.name ?? '-',
                className: 'ui-text-sm ui-font-bold ui-text-dark-blue ui-mb-1',
              },
              {
                label: material?.name ?? '-',
                className: 'ui-text-sm ui-font-thin ui-text-neutral-500',
              },
            ]}
          />
        ) : (
          '-'
        ),
    },
    {
      header: t('stockOpname:columns.batch'),
      accessorKey: 'batch_code',
      minSize: 150,
      cell: ({
        row: {
          original: { batch },
        },
      }) =>
        !!batch?.code || !!batch?.expired_date ? (
          <StockOpnameTitleBlock
            arrText={[
              {
                label: batch?.code ?? '',
                className:
                  'ui-text-sm ui-font-normal ui-text-dark-blue ui-mb-2',
              },
              {
                label: batch?.expired_date
                  ? `${t('stockOpname:columns.expired_date')}:`
                  : null,
                label2: batch?.expired_date
                  ? dayjs(batch?.expired_date)
                      .locale(locale)
                      .format('DD MMM YYYY')
                  : '-',
                className:
                  'ui-text-sm ui-text-dark-blue ui-font-bold ui-w-fit ui-p-2 ui-border ui-border-neutral-300 ui-rounded-xs ui-bg-stone-100',
                className2:
                  'ui-text-sm ui-text-dark-blue ui-font-normal ui-block',
              },
            ]}
          />
        ) : (
          '-'
        ),
    },
    {
      header: t('stockOpname:columns.activity'),
      accessorKey: 'activity',
      cell: ({ row }) => row.original?.activity?.name ?? '-',
    },
    {
      header: t('stockOpname:columns.remaining_stock_in_smile'),
      accessorKey: 'recorded_qty',
      meta: {
        cellClassName: 'ui-bg-neutral-300',
      },
      cell: ({
        row: {
          original: { recorded_qty },
        },
      }) =>
        thousandFormatter({
          value: recorded_qty ?? 0,
          locale,
        }) ?? '',
    },
    {
      header: t('stockOpname:columns.stock_in_transit'),
      accessorKey: 'in_transit_qty',
      cell: ({
        row: {
          original: { in_transit_qty },
        },
      }) =>
        thousandFormatter({
          value: in_transit_qty ?? 0,
          locale,
        }) ?? '',
    },
    {
      header: t('stockOpname:columns.remaining_stock_real'),
      accessorKey: 'actual_qty',
      meta: {
        cellClassName: 'ui-bg-primary-100',
      },
      cell: ({
        row: {
          original: { actual_qty },
        },
      }) =>
        thousandFormatter({
          value: actual_qty ?? 0,
          locale,
        }) ?? '',
    },
    {
      header: t('stockOpname:columns.stock_taking_period'),
      accessorKey: 'period',
      cell: ({
        row: {
          original: { period },
        },
      }) =>
        period?.name ? (
          <StockOpnameTitleBlock
            arrText={[
              {
                label: period?.name ?? '',
                className:
                  'ui-text-sm ui-font-normal ui-text-dark-blue ui-mb-2',
              },
              {
                label: period?.cutoff_date
                  ? `${t('stockOpname:cut_off_time')}:`
                  : null,
                label2: period?.cutoff_date
                  ? `${dayjs(period?.cutoff_date.replace('Z', '')).locale(locale).format('DD MMM YYYY HH:mm')?.toUpperCase()}`
                  : '-',
                className:
                  'ui-text-sm ui-text-dark-blue ui-font-bold ui-w-fit ui-p-2 ui-border ui-border-neutral-300 ui-rounded-xs ui-bg-stone-100',
                className2:
                  'ui-text-sm ui-text-dark-blue ui-font-normal ui-block',
              },
            ]}
          />
        ) : (
          '-'
        ),
    },
    {
      header: t('stockOpname:columns.compliance'),
      accessorKey: 'status',
      cell: ({
        row: {
          original: { is_within_period },
        },
      }) => <StockOpnameStatusBox status={is_within_period} />,
    },
    {
      header: t('stockOpname:columns.last_stocktaken_by'),
      accessorKey: 'updated_at',
      cell: ({
        row: {
          original: { user_updated_by, updated_at },
        },
      }) => (
        <StockOpnameTitleBlock
          arrText={[
            {
              label:
                textGrouper({
                  text1: user_updated_by?.firstname ?? '',
                  text2: user_updated_by?.lastname ?? '',
                  separator: ' ',
                }) ?? '',
              className: 'ui-text-sm ui-font-normal ui-text-dark-blue ui-mb-2',
            },
            {
              label: updated_at
                ? dayjs(updated_at).locale(locale).format('DD MMM YYYY HH:mm')
                : '',
              className: 'ui-text-sm ui-text-neutral-500 ui-font-normal',
            },
          ]}
        />
      ),
    },
  ]

  return schema
}

export default {}

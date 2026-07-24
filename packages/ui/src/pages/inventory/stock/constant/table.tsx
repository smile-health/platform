import Link from 'next/link'
import { CellContext, ColumnDef } from '@tanstack/react-table'
import { Button } from '#components/button'
import { BOOLEAN } from '#constants/common'
import { DetailStock, Stock, StockDetailStock } from '#types/stock'
import { parseDateTime } from '#utils/date'
import { getBackgroundStock, numberFormatter } from '#utils/formatter'
import { TFunction } from 'i18next'

import StockTitleBlock from '../component/StockTitleBlock'

type ColumnsProps = {
  onClickRow: (stock: Stock) => void
  isHierarchical: boolean
  t: TFunction<['stock', 'common']>
  no: number
  language: string
  createUrlDetail: (stock: Stock) => string
}

type ColumnsDetailProps = {
  onClickRow: (stock: DetailStock) => void
  t: TFunction<'stock'>
  isHierarchical: boolean
  language: string
}

type ColumnsBatch = {
  t: TFunction<'stock'>
  isHierarchical: boolean
  language: string
  isOpenVial: boolean
}

const setRowClassname = (stock: Stock | DetailStock) =>
  `ui-text-dark-blue ui-content-center ${getBackgroundStock(stock.total_available_qty, stock.min, stock.max)}`

const currency = process.env.CURRENCY ?? 'IDR'

export const columns = ({
  onClickRow,
  isHierarchical,
  t,
  no,
  language,
  createUrlDetail,
}: ColumnsProps): ColumnDef<Stock>[] => [
  {
    header: 'SI.No',
    accessorKey: 'no',
    cell: ({ row: { index } }) => index + 1 + no,
    size: 50,
    meta: {
      cellClassName: ({ original }) => setRowClassname(original),
    },
  },
  {
    header: isHierarchical
      ? t('stock:table.column.material.material_hirearchy')
      : 'Material',
    accessorKey: 'material.name',
    minSize: 200,
    meta: {
      cellClassName: ({ original }) => setRowClassname(original),
    },
  },
  {
    header: t('stock:table.column.material.enitity_name'),
    accessorKey: 'entity.name',
    cell: ({
      row: {
        original: { entity },
      },
    }) => (
      <div className="ui-flex ui-flex-col ui-gap-1 ui-justify-center">
        <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-dark-blue">
          {entity?.name ?? '-'}
        </p>
        <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-neutral-500">
          {entity?.location ?? '-'}
        </p>
      </div>
    ),
    meta: {
      cellClassName: ({ original }) =>
        `ui-content-center ${getBackgroundStock(original.total_available_qty, original.min, original.max)}`,
    },
  },
  {
    header: t('stock:table.column.material.stock_on_hand'),
    accessorKey: 'total_qty',
    cell: ({ getValue }) => numberFormatter(Number(getValue()) || 0, language),
    size: 120,
    meta: {
      cellClassName: ({ original }) => setRowClassname(original),
    },
  },
  {
    header: t('stock:table.column.material.allocated'),
    accessorKey: 'total_allocated_qty',
    cell: ({ getValue }) => numberFormatter(Number(getValue()) || 0, language),
    size: 100,
    meta: {
      cellClassName: ({ original }) => setRowClassname(original),
    },
  },
  {
    header: t('stock:table.column.material.available_stock'),
    accessorKey: 'total_available_qty',
    cell: ({
      row: {
        original: { material, total_available_qty, total_open_vial_qty },
      },
    }) =>
      material?.is_open_vial ? (
        <div className="ui-flex ui-flex-col ui-gap-1 ui-justify-center">
          <p className="ui-mb-0 ui-text-sm ui-font-bold ui-text-dark-blue">
            {
              t('stock:table.column.material.vial', {
                returnObjects: true,
                value: numberFormatter(total_available_qty || 0, language),
              })[3]
            }
          </p>
          <p className="ui-mb-0 ui-text-sm ui-font-bold ui-text-dark-blue">
            {
              t('stock:table.column.material.vial', {
                returnObjects: true,
                value: numberFormatter(total_open_vial_qty || 0, language),
              })[2]
            }
          </p>
        </div>
      ) : (
        <p className="ui-mb-0 ui-text-sm ui-font-bold ui-text-dark-blue">
          {numberFormatter(total_available_qty || 0, language)}
        </p>
      ),
    size: 140,
    meta: {
      cellClassName: ({ original }) =>
        `ui-content-center ${getBackgroundStock(original.total_available_qty, original.min, original.max)}`,
    },
  },
  {
    header: t('stock:table.column.material.in_transit'),
    accessorKey: 'total_in_transit_qty',
    cell: ({ getValue }) => numberFormatter(Number(getValue()) || 0, language),
    size: 120,
    meta: {
      cellClassName: ({ original }) => setRowClassname(original),
    },
  },
  {
    header: 'Min',
    accessorKey: 'min',
    cell: ({ getValue }) => numberFormatter(Number(getValue()) || 0, language),
    meta: {
      cellClassName: ({ original }) => setRowClassname(original),
    },
  },
  {
    header: 'Max',
    accessorKey: 'max',
    cell: ({ getValue }) => numberFormatter(Number(getValue()) || 0, language),
    meta: {
      cellClassName: ({ original }) => setRowClassname(original),
    },
  },
  {
    header: t('stock:table.column.material.updated_at'),
    accessorKey: 'updated_at',
    cell: ({
      row: {
        original: { updated_at },
      },
    }) =>
      parseDateTime(updated_at, 'DD MMM YYYY HH:mm', language).toUpperCase(),
    meta: {
      cellClassName: ({ original }) => setRowClassname(original),
    },
  },
  {
    header: t('stock:table.column.material.action'),
    accessorKey: 'action',
    meta: {
      cellClassName: ({ original }) =>
        `ui-content-center ${getBackgroundStock(original.total_available_qty, original.min, original.max)}`,
    },
    cell: ({ row }) => (
      <Button
        onClick={() => onClickRow(row.original)}
        variant="subtle"
        type="button"
        id={`action-detail-${row.id}`}
      >
        <Link href={createUrlDetail(row.original)}>
          {t('stock:table.action.detail')}
        </Link>
      </Button>
    ),
  },
]

export const columnsDetail = ({
  onClickRow,
  t,
  isHierarchical,
  language,
}: ColumnsDetailProps): ColumnDef<DetailStock>[] => [
  {
    header: 'SI.No',
    accessorKey: 'no',
    cell: ({ row: { index } }) => index + 1,
    size: 50,
    meta: {
      cellClassName: ({ original }) =>
        isHierarchical
          ? 'ui-text-dark-blue ui-content-center'
          : setRowClassname(original),
    },
    maxSize: 250,
  },
  ...(isHierarchical
    ? [
        {
          header: 'Material',
          accessorKey: 'material.name',
          meta: {
            cellClassName: ({ original }: { original: DetailStock }) =>
              isHierarchical
                ? 'ui-text-dark-blue ui-content-center'
                : setRowClassname(original),
          },
          maxSize: 350,
          size: 300,
        },
      ]
    : [
        {
          header: t('table.column.activity.name'),
          accessorKey: 'activity.name',
          meta: {
            cellClassName: ({ original }: { original: DetailStock }) =>
              isHierarchical
                ? 'ui-text-dark-blue ui-content-center'
                : setRowClassname(original),
          },
          maxSize: 300,
          size: 250,
        },
      ]),
  {
    header: t('table.column.material.stock_on_hand'),
    accessorKey: 'total_qty',
    cell: ({ getValue }) => numberFormatter(Number(getValue()) || 0, language),
    meta: {
      cellClassName: ({ original }) =>
        isHierarchical
          ? 'ui-text-dark-blue ui-content-center'
          : setRowClassname(original),
    },
  },
  {
    header: t('table.column.material.allocated'),
    accessorKey: 'total_allocated_qty',
    cell: ({ getValue }) => numberFormatter(Number(getValue()) || 0, language),
    meta: {
      cellClassName: ({ original }) =>
        isHierarchical
          ? 'ui-text-dark-blue ui-content-center'
          : setRowClassname(original),
    },
  },
  {
    header: t('table.column.material.in_transit'),
    accessorKey: 'total_in_transit_qty',
    cell: ({ getValue }) => numberFormatter(Number(getValue()) || 0, language),
    meta: {
      cellClassName: ({ original }) =>
        isHierarchical
          ? 'ui-text-dark-blue ui-content-center'
          : setRowClassname(original),
    },
  },
  {
    header: t('table.column.material.available_stock'),
    accessorKey: 'total_available_qty',
    cell: ({
      row: {
        original: { total_available_qty, total_open_vial_qty, material },
      },
    }) => {
      const isOpenVial = material?.is_open_vial === BOOLEAN.TRUE
      const closeVialLabel = isOpenVial
        ? `(${t('table.column.material.close_vial')})`
        : ''
      return (
        <StockTitleBlock
          arrText={[
            {
              label: `${numberFormatter(
                Math.abs(Number(total_available_qty)) ?? 0,
                language
              )} ${closeVialLabel}`,
              className: 'ui-text-dark-blue ui-text-sm',
            },
            {
              label: isOpenVial
                ? `${numberFormatter(
                    Math.abs(Number(total_open_vial_qty)) ?? 0,
                    language
                  )} (${t('table.column.material.open_vial')})`
                : '',
              className: 'ui-text-dark-blue ui-text-sm',
            },
          ]}
        />
      )
    },
    meta: {
      cellClassName: ({ original }) =>
        isHierarchical
          ? 'ui-text-dark-blue ui-content-center'
          : setRowClassname(original),
    },
  },
  ...(!isHierarchical
    ? [
        {
          header: 'Min',
          accessorKey: 'min',
          cell: ({ getValue }: CellContext<DetailStock, unknown>) =>
            numberFormatter(Number(getValue()) || 0, language),
          meta: {
            cellClassName: ({ original }: { original: DetailStock }) =>
              isHierarchical
                ? 'ui-text-dark-blue ui-content-center'
                : setRowClassname(original),
          },
        },
        {
          header: 'Max',
          accessorKey: 'max',
          cell: ({ getValue }: CellContext<DetailStock, unknown>) =>
            numberFormatter(Number(getValue()) || 0, language),
          meta: {
            cellClassName: ({ original }: { original: DetailStock }) =>
              isHierarchical
                ? 'ui-text-dark-blue ui-content-center'
                : setRowClassname(original),
          },
        },
      ]
    : []),
  {
    header: t('table.column.material.updated_at'),
    accessorKey: 'updated_at',
    cell: ({
      row: {
        original: { updated_at },
      },
    }) => parseDateTime(updated_at, 'DD MMM YYYY HH:mm').toUpperCase(),
    meta: {
      cellClassName: ({ original }) =>
        isHierarchical
          ? 'ui-text-dark-blue ui-content-center'
          : setRowClassname(original),
    },
  },
  {
    header: t('table.column.material.action'),
    accessorKey: 'action',
    cell: ({ row }) => (
      <Button
        onClick={() => onClickRow(row.original)}
        variant="subtle"
        type="button"
        id={`action-open-modal-detail-${row.id}`}
      >
        {isHierarchical ? t('table.action.activity') : t('table.action.batch')}
      </Button>
    ),
    meta: {
      cellClassName: ({ original }) =>
        isHierarchical ? '' : setRowClassname(original),
    },
  },
]

export const columnsBatch = ({
  t,
  isHierarchical,
  language,
  isOpenVial,
}: ColumnsBatch): ColumnDef<StockDetailStock>[] => [
  {
    header: 'SI.No',
    accessorKey: 'no',
    cell: ({ row: { index } }) => index + 1,
    size: 50,
    meta: {
      cellClassName: 'ui-text-dark-blue',
    },
  },
  ...(isHierarchical
    ? [
        {
          header: t('table.column.activity.name'),
          accessorKey: 'batch.activity.name',
          cell: ({
            row: {
              original: { activity },
            },
          }: CellContext<StockDetailStock, unknown>) => activity?.name || '-',
          minSize: 150,
          meta: {
            cellClassName: 'ui-text-dark-blue',
          },
        },
      ]
    : []),
  {
    header: t('table.column.batch.info'),
    accessorKey: 'batch_info',
    cell: ({
      row: {
        original: { batch },
      },
    }) => (
      <div className="ui-flex ui-flex-col ui-gap-1">
        <p className="ui-mb-0 ui-text-sm ui-font-bold ui-text-dark-blue">
          {batch?.code ?? '-'}
        </p>
        <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-dark-blue">
          {t('table.column.batch.production_date', {
            value: parseDateTime(
              batch?.production_date ?? '-',
              'DD MMM YYYY'
            ).toUpperCase(),
          })}
        </p>
        <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-dark-blue">
          {t('table.column.batch.manufacturer', {
            value: batch?.manufacture.name ?? '-',
          })}
        </p>
        <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-dark-blue">
          {t('table.column.batch.expired_date', {
            value: parseDateTime(
              batch?.expired_date ?? '-',
              'DD MMM YYYY'
            ).toUpperCase(),
          })}
        </p>
      </div>
    ),
    minSize: 100,
  },
  {
    header: t('table.column.batch.stock_info'),
    accessorKey: 'stock_info',
    cell: ({ row: { original } }) => (
      <div className="ui-flex ui-flex-col ui-gap-1">
        <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-dark-blue">
          {t('table.column.batch.stock.on_hand', {
            value: numberFormatter(original.qty || 0, language),
          })}
        </p>
        <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-dark-blue">
          {t('table.column.batch.stock.allocated', {
            value: numberFormatter(original.allocated_qty || 0, language),
          })}
        </p>
        <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-dark-blue">
          {t('table.column.batch.stock.available', {
            value: isOpenVial
              ? `${
                  t('table.column.material.vial', {
                    returnObjects: true,
                    value: numberFormatter(
                      original.available_qty || 0,
                      language
                    ),
                  })[3]
                } - ${
                  t('table.column.material.vial', {
                    returnObjects: true,
                    value: numberFormatter(
                      original.open_vial_qty || 0,
                      language
                    ),
                  })[2]
                }`
              : numberFormatter(original.available_qty || 0, language),
          })}
        </p>
        <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-dark-blue">
          {t('table.column.batch.stock.in_transit', {
            value: numberFormatter(original.in_transit_qty || 0, language),
          })}
        </p>
      </div>
    ),
    minSize: 100,
  },
  ...(isHierarchical
    ? [
        {
          header: t('table.column.material.updated_at'),
          accessorKey: 'updated_at',
          cell: ({
            row: { original },
          }: CellContext<StockDetailStock, unknown>) =>
            parseDateTime(
              original.updated_at ?? '-',
              'DD MMM YYYY HH:mm'
            ).toUpperCase(),
          minSize: 120,
          meta: {
            cellClassName: 'ui-text-dark-blue ui-content-center',
          },
        },
      ]
    : []),
  {
    header: t('table.column.batch.budget_info'),
    accessorKey: 'budget_info',
    cell: ({ row: { original } }: CellContext<StockDetailStock, unknown>) => (
      <div className="ui-flex ui-flex-col ui-gap-1">
        <p className="ui-mb-0 ui-text-sm ui-font-bold ui-text-dark-blue">
          {t('table.column.budget_source.name', {
            value: original.budget_source?.name ?? '-',
          })}
        </p>
        <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-dark-blue">
          {t('table.column.budget_source.price', {
            value: original.budget_source
              ? numberFormatter(original.price || 0, language, 'currency')
              : '-',
            currency,
          })}
        </p>
        <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-dark-blue">
          {t('table.column.budget_source.total_price', {
            value: original.budget_source
              ? numberFormatter(original.total_price || 0, language, 'currency')
              : '-',
            currency,
          })}
        </p>
      </div>
    ),
    minSize: 150,
  },
]

import { useContext } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '#components/button'
import { TTransactionData } from '#types/transaction'
import dayjs from 'dayjs'

import TransactionListCursorContext from '../helpers/transaction-list-cursor.context'
import {
  capitalize,
  textGrouper,
  thousandFormatter,
} from '../helpers/transaction-list.common'
import { TMainColumn } from '../helpers/transaction-list.types'

import 'dayjs/locale/id'
import 'dayjs/locale/en'

import { BOOLEAN } from '#constants/common'

import { TRANSACTION_TYPE } from '../../TransactionCreate/transaction-create.constant'

const TitleBlock = ({
  arrText,
}: {
  arrText: Array<{
    firstLabel: string | null
    secondLabel?: string
    firstClassName?: string
    secondClassName?: string
  }>
}) => (
  <div>
    {arrText.map(
      (item, index) =>
        item.firstLabel && (
          <div
            key={`_${index.toString()}`}
            className={`${item?.firstClassName ?? 'ui-text-dark-teal'} ui-text-sm`}
          >
            {item.firstLabel}
            {item.secondLabel && (
              <span
                className={` ${
                  item.secondClassName ?? 'ui-text-dark-teal ui-text-sm'
                }`}
              >
                {item.secondLabel}
              </span>
            )}
          </div>
        )
    )}
  </div>
)

const openVialTransactionTypes: Set<number> = new Set<number>([
  TRANSACTION_TYPE.DISCARD,
  TRANSACTION_TYPE.CANCELLATION_OF_DISCARD,
  TRANSACTION_TYPE.RETURN_FROM_HEALTH_FACILITIES,
  TRANSACTION_TYPE.LAST_MILE,
])

export const MainColumnCursor = ({ t, locale, program }: TMainColumn) => {
  const { setTransactionData, pagination } = useContext(TransactionListCursorContext)
  const schema: Array<ColumnDef<TTransactionData>> = [
    {
      header: 'No.',
      accessorKey: 'no',
      size: 20,
      cell: ({ row }) =>
        thousandFormatter({
          value: (pagination.page - 1) * pagination.paginate + row.index + 1,
          locale,
        }),
    },
    {
      header: t('transactionList:columns.entity_name'),
      accessorKey: 'entity',
      meta: {
        cellClassName: 'ui-w-60',
      },
      cell: ({ row }) => (
        <TitleBlock
          arrText={[
            {
              firstLabel: row.original?.entity?.name ?? '',
            },
            {
              firstLabel: textGrouper({
                text1: capitalize(row.original?.entity?.regency?.name ?? ''),
                text2: capitalize(row.original?.entity?.province?.name ?? ''),
              }),
              firstClassName: 'ui-text-neutral-500 ui-text-sm',
            },
          ]}
        />
      ),
    },
    {
      header: t('transactionList:columns.transaction_type'),
      accessorKey: 'transaction_type',
      meta: {
        cellClassName: 'ui-w-60',
      },
      cell: ({ row }) => {
        // Transactions that should have a customer
        const shouldHaveCustomer = [
          TRANSACTION_TYPE.RETURN_FROM_HEALTH_FACILITIES,
          TRANSACTION_TYPE.LAST_MILE,
          TRANSACTION_TYPE.ISSUE,
        ].includes(Number(row.original?.transaction_type?.id))
        const toOrFromLabel =
          Number(row.original?.transaction_type?.id) ===
            TRANSACTION_TYPE.LAST_MILE ||
          Number(row.original?.transaction_type?.id) === TRANSACTION_TYPE.ISSUE
            ? t('common:to')
            : t('common:from')

        // Transactions that involve transfer stock
        const transferStock = [TRANSACTION_TYPE.TRANSFER_STOCK].includes(
          Number(row.original?.transaction_type?.id)
        )

        const shouldHaveVendor = [TRANSACTION_TYPE.RECEIVE].includes(
          Number(row.original?.transaction_type?.id)
        )

        const transferStockDescription =
          Number(row.original?.change_qty) <= 0
            ? `${t('common:from')} ${program?.name} (${row.original?.activity?.name}) ${t('common:to')} ${row.original?.companion_program?.name} (${row.original?.companion_activity?.name})`
            : `${t('common:from')} ${row.original?.companion_program?.name} (${row.original?.companion_activity?.name}) ${t('common:to')} ${program?.name} (${row.original?.activity?.name})`

        // Other transactions
        const otherTransactionType =
          !shouldHaveCustomer && !transferStock && !shouldHaveVendor

        return (
          <TitleBlock
            arrText={[
              {
                firstLabel: row.original?.transaction_type?.title ?? '',
                firstClassName: 'ui-text-dark-blue ui-text-sm ui-font-bold',
              },
              {
                firstLabel:
                  row.original?.customer?.name && shouldHaveCustomer
                    ? `${toOrFromLabel} ${row.original?.customer?.name} (${row.original?.activity?.name})`
                    : '',
                firstClassName: 'ui-text-dark-blue ui-text-sm',
              },
              {
                firstLabel:
                  row.original?.customer?.name && shouldHaveVendor
                    ? `${toOrFromLabel} ${row.original?.vendor?.name} (${row.original?.activity?.name})`
                    : '',
                firstClassName: 'ui-text-dark-blue ui-text-sm',
              },
              {
                firstLabel: otherTransactionType
                  ? `${
                      row.original?.other_reason ??
                      row.original?.transaction_reason?.title ??
                      ''
                    } (${row.original?.activity?.name})`
                  : '',
                firstClassName: 'ui-text-dark-blue ui-text-sm',
              },
              {
                firstLabel:
                  row.original?.companion_program && transferStock
                    ? transferStockDescription
                    : '',
                firstClassName: 'ui-text-dark-blue ui-text-sm',
              },
            ]}
          />
        )
      },
    },
    {
      header: t('transactionList:columns.material'),
      accessorKey: 'material',
      meta: {
        cellClassName: 'ui-w-60',
      },
      cell: ({
        row: {
          original: { material, parent_material },
        },
      }) =>
        program?.config?.material?.is_hierarchy_enabled ? (
          <TitleBlock
            arrText={[
              {
                firstLabel: parent_material?.name ?? '',
                firstClassName: 'ui-text-dark-blue ui-text-sm ui-font-bold',
              },
              {
                firstLabel: material?.name ?? '',
                firstClassName: 'ui-text-neutral-500 ui-text-sm',
              },
            ]}
          />
        ) : (
          (material?.name ?? '-')
        ),
    },
    {
      header: t('transactionList:columns.quantity'),
      accessorKey: 'quantity',
      meta: {
        cellClassName: 'ui-w-60',
      },
      cell: ({
        row: {
          original: {
            material,
            change_qty,
            change_qty_open_vial,
            stock,
            transaction_type,
            customer,
          },
        },
      }) => {
        const isOpenVial =
          material?.is_open_vial === BOOLEAN.TRUE &&
          openVialTransactionTypes.has(Number(transaction_type?.id)) &&
          ([
            TRANSACTION_TYPE.DISCARD,
            TRANSACTION_TYPE.CANCELLATION_OF_DISCARD,
          ].includes(Number(transaction_type?.id)) ||
            Number(customer?.is_open_vial) === BOOLEAN.TRUE)
        const closeVialLabel = isOpenVial
          ? `(${t('transactionList:columns.close_vial')})`
          : ''
        return (
          <TitleBlock
            arrText={[
              {
                firstLabel: `${thousandFormatter({
                  value: Math.abs(Number(change_qty)),
                  locale,
                })} ${closeVialLabel}`,
                firstClassName: 'ui-text-dark-blue ui-text-sm ui-font-bold',
              },
              {
                firstLabel: isOpenVial
                  ? `${thousandFormatter({
                      value: Math.abs(Number(change_qty_open_vial)),
                      locale,
                    })} (${t('transactionList:columns.open_vial')})`
                  : '',
                firstClassName: 'ui-text-dark-blue ui-text-sm ui-font-bold',
              },
              {
                firstLabel: stock?.batch?.code ?? '',
                firstClassName: 'ui-text-neutral-500 ui-text-sm',
              },
            ]}
          />
        )
      },
    },
    {
      header: t('transactionList:columns.stock_history'),
      accessorKey: 'stock_history',
      meta: {
        cellClassName: 'ui-w-60',
      },
      cell: ({
        row: {
          original: {
            material,
            transaction_type,
            customer,
            opening_qty_open_vial,
            closing_qty_open_vial,
            opening_qty,
            closing_qty,
          },
        },
      }) => {
        const isOpenVialMaterial =
          material?.is_open_vial === BOOLEAN.TRUE &&
          openVialTransactionTypes.has(Number(transaction_type?.id)) &&
          ([
            TRANSACTION_TYPE.DISCARD,
            TRANSACTION_TYPE.CANCELLATION_OF_DISCARD,
          ].includes(Number(transaction_type?.id)) ||
            Number(customer?.is_open_vial) === BOOLEAN.TRUE)
        return (
          <TitleBlock
            arrText={[
              {
                firstLabel: t('transactionList:columns.opening_stock'),
                firstClassName: 'ui-font-bold',
              },
              {
                firstLabel: isOpenVialMaterial
                  ? `${thousandFormatter({
                      value: Number(opening_qty_open_vial),
                      locale,
                    })} ${t('transactionList:columns.open_vial')}`
                  : null,
                firstClassName: 'ui-font-normal',
              },
              {
                firstLabel: `${
                  thousandFormatter({
                    value: Number(opening_qty),
                    locale,
                  }) ?? ''
                } ${isOpenVialMaterial ? t('transactionList:columns.close_vial') : ''}`,
                firstClassName: 'ui-font-normal ui-mb-2',
              },
              {
                firstLabel: t('transactionList:columns.closing_stock'),
                firstClassName: 'ui-font-bold',
              },
              {
                firstLabel: isOpenVialMaterial
                  ? `${thousandFormatter({
                      value: Number(closing_qty_open_vial),
                      locale,
                    })} ${t('transactionList:columns.open_vial')}`
                  : null,
                firstClassName: 'ui-font-normal',
              },
              {
                firstLabel: `${
                  thousandFormatter({
                    value: Number(closing_qty),
                    locale,
                  }) ?? ''
                } ${isOpenVialMaterial ? t('transactionList:columns.close_vial') : ''}`,
                firstClassName: 'ui-font-normal',
              },
            ]}
          />
        )
      },
    },
    {
      header: t('transactionList:columns.created_at'),
      accessorKey: 'created_at',
      meta: {
        cellClassName: 'ui-w-40',
      },
      cell: ({ row }) =>
        row.original?.created_at
          ? dayjs(row.original?.created_at)
              .locale(locale)
              .format('DD MMM YYYY HH:mm')
              ?.toUpperCase()
          : '',
    },
    {
      header: t('transactionList:columns.action'),
      accessorKey: 'action',
      meta: {
        cellClassName: 'ui-w-40',
      },
      cell: ({ row }) =>
        row.original?.stock ? (
          <Button
            onClick={() => setTransactionData(row.original)}
            variant="subtle"
            type="button"
            className="!ui-p-0 !ui-h-fit"
          >
            {t('common:detail')}
          </Button>
        ) : null,
    },
  ]

  return schema
}

export default {}

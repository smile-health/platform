import { ColumnDef } from '@tanstack/react-table'
import { Button } from '#components/button'
import { Checkbox } from '#components/checkbox'
import { BOOLEAN } from '#constants/common'
import { TTransactionData } from '#types/transaction'
import { parseDateTime } from '#utils/date'
import { numberFormatter } from '#utils/formatter'
import { TFunction } from 'i18next'

type CreateColumnDiscard = {
  t: TFunction<'transactionCreate'>
  no: number
  language: string
  selected: number[]
}

type CreateColumnCancelDiscard = {
  t: TFunction<'transactionCreate'>
}

type CreateColumnCancelDiscardDetail = {
  t: TFunction<'transactionCreate'>
  language: string
  handleRemove: (index: number) => void
}

export const createColumnDiscard = ({
  t,
  no,
  language,
  selected,
}: CreateColumnDiscard): ColumnDef<TTransactionData>[] => {
  const getIsSelected = (data: TTransactionData) =>
    selected.includes(data.id) ? 'ui-bg-[#E2F3FC]' : ''

  return [
    {
      header: 'SI.No',
      accessorKey: 'no',
      cell: ({ row: { index } }) => index + 1 + no,
      size: 50,
      meta: {
        cellClassName: ({ original }) =>
          `ui-text-dark-blue ${getIsSelected(original)}`,
      },
    },
    {
      header: 'Material',
      accessorKey: 'material.name',
      meta: {
        cellClassName: ({ original }) =>
          `ui-text-dark-blue ${getIsSelected(original)}`,
      },
      cell: ({ getValue }) => getValue() ?? '-',
      minSize: 200,
    },
    {
      header: t(
        'cancel_transaction_discard.table.discard.column.transaction_date'
      ),
      accessorKey: 'created_at',
      meta: {
        cellClassName: ({ original }) =>
          `ui-text-dark-blue ${getIsSelected(original)}`,
      },
      cell: ({
        row: {
          original: { created_at },
        },
      }) => parseDateTime(created_at ?? '-', 'DD MMM YYYY HH:mm').toUpperCase(),
      minSize: 200,
    },
    {
      header: t('cancel_transaction_discard.table.discard.column.activity'),
      accessorKey: 'activity.name',
      cell: ({
        row: {
          original: { activity },
        },
      }) => (
        <div className="ui-flex ui-flex-col ui-gap-1">
          <p className="ui-mb-0 ui-text-sm ui-font-bold ui-text-dark-blue">
            {activity?.name ?? '-'}
          </p>
          <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-dark-blue">
            {t('cancel_transaction_discard.table.discard.column.taken', {
              value: activity?.name ?? '-',
            })}
          </p>
        </div>
      ),
      meta: {
        cellClassName: ({ original }) => getIsSelected(original),
      },
      minSize: 200,
    },
    {
      header: t('cancel_transaction_discard.table.discard.column.reason'),
      accessorKey: 'transaction_reason.title',
      meta: {
        cellClassName: ({ original }) =>
          `ui-text-dark-blue ${getIsSelected(original)}`,
      },
      cell: ({ row: { original } }) =>
        original.transaction_reason?.title ?? '-',
      minSize: 200,
    },
    {
      header: t('cancel_transaction_discard.table.discard.column.quantity'),
      accessorKey: 'change_qty',
      meta: {
        cellClassName: ({ original }) =>
          `ui-text-dark-blue ${getIsSelected(original)}`,
      },
      cell: ({
        row: {
          original: { change_qty, change_qty_open_vial, material },
        },
      }) => {
        const isOpenVialMaterial = material?.is_open_vial === BOOLEAN.TRUE
        if (isOpenVialMaterial)
          return (
            <>
              <p className="ui-mb-1 ui-text-sm ui-font-semibold ui-text-dark-blue">
                {`${numberFormatter(
                  change_qty_open_vial ?? 0,
                  language
                )} (${t('transaction_discard.form.table.column.open_vial')})`}
              </p>
              <p className="ui-mb-0 ui-text-sm ui-font-semibold ui-text-dark-blue">
                {`${numberFormatter(
                  change_qty ?? 0,
                  language
                )} (${t('transaction_discard.form.table.column.close_vial')})`}
              </p>
            </>
          )
        return numberFormatter(change_qty ?? 0, language)
      },
      minSize: 100,
    },
    {
      header: t('cancel_transaction_discard.table.discard.column.batch'),
      accessorKey: 'material.name',
      cell: ({
        row: {
          original: { stock },
        },
      }) => (
        <div className="ui-flex ui-flex-col ui-gap-1">
          <p className="ui-mb-0 ui-text-sm ui-font-bold ui-text-dark-blue">
            {stock?.batch?.code ?? '-'}
          </p>
          <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-dark-blue">
            {t('cancel_transaction_discard.table.discard.column.manufacture', {
              value: stock?.batch?.manufacture?.name ?? '-',
            })}
          </p>
          <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-dark-blue">
            {t('cancel_transaction_discard.table.discard.column.expired_date', {
              value: parseDateTime(
                stock?.batch?.expired_date ?? '-',
                'DD MMM YYYY HH:mm'
              ).toUpperCase(),
            })}
          </p>
        </div>
      ),
      meta: {
        cellClassName: ({ original }) => getIsSelected(original),
      },
      minSize: 250,
    },
    {
      header: t('cancel_transaction_discard.table.discard.column.selection'),
      accessorKey: 'selection',
      meta: {
        cellClassName: ({ original }) =>
          `ui-text-dark-blue ${getIsSelected(original)}`,
      },
      cell: ({
        row: {
          original: { id },
        },
      }) => (
        <div className="text-center">
          <Checkbox checked={selected.includes(id)} />
        </div>
      ),
      size: 80,
    },
  ]
}

export const createColumnCancelDiscard = ({ t }: CreateColumnCancelDiscard) => [
  {
    header: 'SI.No',
    id: 'no',
    size: 50,
  },
  {
    header: 'Material',
    id: 'material-name',
    minSize: 220,
  },
  {
    header: t('cancel_transaction_discard.table.discard.column.activity'),
    id: 'activity-name',
    minSize: 220,
  },
  {
    header: t('cancel_transaction_discard.table.discard.column.batch'),
    id: 'material-name',
    minSize: 220,
  },
  {
    header: t(
      'cancel_transaction_discard.table.discard.column.quantity_accumulation'
    ),
    id: 'acc-qty',
    minSize: 200,
  },
  {
    header: t('cancel_transaction_discard.table.discard.column.reason'),
    id: 'reason',
    minSize: 220,
  },
  {
    header: t('cancel_transaction_discard.table.discard.column.action'),
    id: 'action',
    size: 100,
  },
]

export const createColumnCancelDiscardDetail = ({
  t,
  language,
  handleRemove,
}: CreateColumnCancelDiscardDetail): ColumnDef<TTransactionData>[] => [
  {
    header: t(
      'cancel_transaction_discard.table.discard.column.transaction_date'
    ),
    accessorKey: 'created_at',
    meta: {
      cellClassName: 'ui-text-dark-blue',
    },
    cell: ({
      row: {
        original: { created_at },
      },
    }) => parseDateTime(created_at ?? '-', 'DD MMM YYYY HH:mm').toUpperCase(),
    minSize: 200,
  },
  {
    header: t('cancel_transaction_discard.table.discard.column.reason'),
    accessorKey: 'transaction_reason.title',
    meta: {
      cellClassName: 'ui-text-dark-blue',
    },
    cell: ({ row: { original } }) => original.transaction_reason?.title ?? '-',
    minSize: 200,
  },
  {
    header: t('cancel_transaction_discard.table.discard.column.quantity'),
    accessorKey: 'change_qty',
    meta: {
      cellClassName: 'ui-text-dark-blue',
    },
    cell: ({
      row: {
        original: { change_qty, change_qty_open_vial, material },
      },
    }) => {
      const isOpenVialMaterial = material?.is_open_vial === BOOLEAN.TRUE
      if (isOpenVialMaterial)
        return (
          <>
            <p className="ui-mb-1 ui-text-sm ui-font-normal ui-text-dark-blue">
              {`${numberFormatter(
                change_qty_open_vial ?? 0,
                language
              )} (${t('transaction_discard.form.table.column.open_vial')})`}
            </p>
            <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-dark-blue">
              {`${numberFormatter(
                change_qty ?? 0,
                language
              )} (${t('transaction_discard.form.table.column.close_vial')})`}
            </p>
          </>
        )
      return numberFormatter(change_qty ?? 0, language)
    },
    minSize: 200,
  },
  {
    header: t('cancel_transaction_discard.table.discard.column.taken_activity'),
    accessorKey: 'activity.name',
    meta: {
      cellClassName: 'ui-text-dark-blue',
    },
    cell: ({ getValue }) => getValue() ?? '-',
    minSize: 200,
  },
  {
    header: t('cancel_transaction_discard.table.discard.column.action'),
    accessorKey: 'action',
    cell: ({ row: { index } }) => (
      <Button
        type="button"
        variant="subtle"
        color="danger"
        size="sm"
        onClick={() => handleRemove(index)}
      >
        {t('cancel_transaction_discard.table.discard.column.remove')}
      </Button>
    ),
  },
]

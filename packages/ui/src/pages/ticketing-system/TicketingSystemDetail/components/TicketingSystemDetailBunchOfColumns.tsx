import { ColumnDef } from '@tanstack/react-table'
import dayjs from 'dayjs'
import { TFunction } from 'i18next'

import {
  OrderDetailItem,
  OrderDetailStock,
} from '../../../order/OrderDetail/order-detail.type'
import { thousandFormatter } from '../libs/ticketing-system-detail.common'
import { TicketingSystemItemType } from '../libs/ticketing-system-detail.type'
import TicketingSystemDetailTitleBlock from './TicketingSystemDetailTitleBlock'

import 'dayjs/locale/id'
import 'dayjs/locale/en'

export const orderColumns = (t: TFunction<'ticketingSystem'>) => {
  const schema: Array<ColumnDef<OrderDetailItem>> = [
    {
      header: 'No',
      accessorKey: 'no.',
      cell: ({ row }) => row?.index + 1,
      meta: {
        cellClassName: 'ui-align-top',
      },
    },
    {
      header: 'Material',
      accessorKey: 'material.name',
      meta: {
        cellClassName: 'ui-align-top',
      },
    },
    {
      header: t('table.columns.total_quantity'),
      accessorKey: 'qty',
      meta: {
        cellClassName: 'ui-align-top',
      },
    },
  ]

  return schema
}

export const batchColumns = (
  t: TFunction<'ticketingSystem'>,
  locale: string
) => {
  const schema: Array<ColumnDef<OrderDetailStock>> = [
    { header: 'Batch', accessorKey: 'batch.code' },
    {
      header: t('table.columns.expired_date'),
      accessorKey: 'batch.expired_date',
      cell: (props) => {
        const date = props?.row?.original?.batch?.expired_date
        return date ? dayjs(date).locale(locale).format('DD MMM YYYY') : '-'
      },
    },
    {
      header: t('table.columns.quantity'),
      accessorKey: 'allocated_qty',
    },
  ]

  return schema
}

export const itemReportedColumns = (
  t: TFunction<['ticketingSystem', 'ticketingSystemDetail']>,
  locale: string
) => {
  const schema: Array<ColumnDef<TicketingSystemItemType>> = [
    {
      header: t('ticketingSystemDetail:reported.material_selected'),
      accessorKey: 'material_name',
      cell: ({
        row: {
          original: { material_id, material_name, custom_material },
        },
      }) => (
        <TicketingSystemDetailTitleBlock
          arrText={[
            {
              label: material_name ?? custom_material ?? '-',
              className: 'ui-font-bold ui-text-dark-blue ui-mb-1',
            },
            {
              label: !material_id
                ? `(${t('ticketingSystemDetail:reported.new_material')})`
                : null,
              className: 'ui-text-sm ui-font-normal ui-text-neutral-500',
            },
          ]}
        />
      ),
    },
    {
      header: t('ticketingSystemDetail:reported.quantity'),
      accessorKey: 'qty',
      cell: ({
        row: {
          original: { batch_code, expired_date, qty },
        },
      }) => (
        <TicketingSystemDetailTitleBlock
          arrText={[
            {
              label: batch_code ?? '-',
              className: 'ui-text-sm ui-font-bold ui-text-dark-blue ui-mb-1',
            },
            {
              label: `${t('ticketingSystemDetail:reported.expired_date')}: `,
              className: 'ui-text-sm ui-font-normal ui-text-dark-blue ui-mb-1',
              label2: expired_date
                ? dayjs(expired_date).locale(locale).format('DD MMM YYYY')
                : '-',
            },
            {
              label: `${t('ticketingSystemDetail:reported.quantity')}: `,
              className: 'ui-text-sm ui-font-normal ui-text-dark-blue',
              label2: qty
                ? thousandFormatter({
                    value: Number(qty),
                    locale,
                  })
                : '-',
            },
          ]}
        />
      ),
    },
    {
      header: t('ticketingSystemDetail:reported.reason'),
      accessorKey: 'reason',
      cell: ({
        row: {
          original: { reason, child_reason },
        },
      }) => (
        <TicketingSystemDetailTitleBlock
          arrText={[
            {
              label: `${t('ticketingSystemDetail:reported.reason')}: `,
              className: 'ui-text-sm ui-font-normal ui-text-dark-blue ui-mb-1',
              label2: reason ?? '-',
            },
            {
              label: `${t('ticketingSystemDetail:reported.reason_detail')}: `,
              className: 'ui-text-sm ui-font-normal ui-text-dark-blue',
              label2: child_reason ?? '-',
            },
          ]}
        />
      ),
    },
  ]

  return schema
}

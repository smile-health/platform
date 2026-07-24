import { ColumnDef } from '@tanstack/react-table'
import { ButtonActionTable } from '#components/modules/ButtonActionTable'
import TicketingSystemDiffTime from '#pages/ticketing-system/components/TicketingSystemDiffTime'
import TicketingSystemReversedCountdown from '#pages/ticketing-system/components/TicketingSystemReversedCountdown'
import TicketingSystemStatus from '#pages/ticketing-system/components/TicketingSystemStatus'
import { TicketingSystemStatusEnum } from '#pages/ticketing-system/ticketing-system.constant'
import { parseDateTime } from '#utils/date'
import dayjs from 'dayjs'
import { TFunction } from 'i18next'

import { TicketingSystemListItem } from '../../ticketing-system-list.type'

const ticketingSystemListTableSchema = (
  t: TFunction<'ticketingSystemList'>
): Array<ColumnDef<TicketingSystemListItem>> => {
  return [
    {
      header: t('data.ticket_number'),
      accessorKey: 'id',
      size: 100,
      minSize: 100,
      cell: ({ row }) => {
        const item = row?.original
        return `LK-${item.id}`
      },
    },
    {
      header: t('data.reporter_entity'),
      accessorKey: 'name',
      size: 200,
      minSize: 200,
    },
    {
      header: t('data.order_number'),
      accessorKey: 'order_id',
      size: 70,
      minSize: 70,
    },
    {
      header: t('data.packing_slip'),
      accessorKey: 'do_number',
      size: 100,
      minSize: 100,
    },
    {
      header: t('data.arrival_date'),
      accessorKey: 'arrived_date',
      size: 70,
      minSize: 70,
      cell: ({ row }) => {
        const arrived_date = row?.original?.arrived_date
        return arrived_date ? dayjs(arrived_date).format('DD MMM YYYY') : '-'
      },
      meta: {
        cellClassName: 'ui-uppercase',
      },
    },
    {
      header: t('data.updated_at'),
      accessorKey: 'updated_at',
      size: 90,
      minSize: 90,
      cell: ({ row }) => {
        const updated_at = row?.original?.updated_at
        return parseDateTime(updated_at, 'DD MMM YYYY HH:mm')
      },
      meta: {
        cellClassName: 'ui-uppercase',
      },
    },
    {
      header: 'Lead Time',
      accessorKey: 'created_at',
      size: 70,
      minSize: 70,
      cell: ({ row }) => {
        const item = row?.original

        if (
          item?.status_id === TicketingSystemStatusEnum.ReportCompleted ||
          item?.status_id === TicketingSystemStatusEnum.ReportCancelled
        ) {
          return (
            <TicketingSystemDiffTime
              startDate={item?.created_at}
              endDate={item?.updated_at}
            />
          )
        }

        return <TicketingSystemReversedCountdown startDate={item.created_at} />
      },
    },
    {
      header: 'Status',
      accessorKey: 'status_id',
      size: 30,
      minSize: 30,
      cell: ({ row }) => {
        const item = row?.original

        return (
          <TicketingSystemStatus status={item.status_id} label={item.status} />
        )
      },
    },
    {
      header: t('text.action'),
      accessorKey: 'action',
      size: 30,
      minSize: 30,
      cell: ({ row }) => {
        const item = row?.original

        return (
          <ButtonActionTable
            id={item?.id}
            path="ticketing-system"
            hidden={['edit', 'activation']}
          />
        )
      },
    },
  ]
}

export default ticketingSystemListTableSchema

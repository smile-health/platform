import { ColumnDef } from '@tanstack/react-table'
import { hasPermission } from '#shared/permission/index'
import dayjs from 'dayjs'

import { thousandFormatter } from '../libs/period-of-stock-taking-list.common'
import {
  TMainColumn,
  TPeriodOfStockTakingData,
} from '../libs/period-of-stock-taking-list.type'
import PeriodOfStockTakingEnableDisableButton from './PeriodOfStockTakingEnableDisableButton'
import PeriodOfStockTakingStatusBox from './PeriodOfStockTakingStatusBox'

import 'dayjs/locale/id'
import 'dayjs/locale/en'

export const MainColumn = ({ t, locale }: TMainColumn) => {
  const schema: Array<ColumnDef<TPeriodOfStockTakingData>> = [
    {
      header: 'No.',
      accessorKey: 'no',
      size: 20,
      cell: ({
        row: {
          original: { si_no },
        },
      }) =>
        thousandFormatter({
          value: Number(si_no),
          locale,
        }),
    },
    {
      header: t('periodOfStockTaking:stock_taking_period'),
      accessorKey: 'period_name',
      cell: ({
        row: {
          original: { name },
        },
      }) => name,
    },
    {
      header: t('periodOfStockTaking:cut_off_time'),
      accessorKey: 'cutoff_date',
      cell: ({
        row: {
          original: { cutoff_date },
        },
      }) =>
        cutoff_date
          ? `${dayjs(cutoff_date.replace('Z', '')).locale(locale).format('DD MMM YYYY HH:mm')?.toUpperCase()}`
          : '-',
    },
    {
      header: t('periodOfStockTaking:time_span'),
      accessorKey: 'start_date',
      cell: ({
        row: {
          original: { start_date, end_date },
        },
      }) =>
        `${
          start_date
            ? dayjs(start_date)
                .locale(locale)
                .format('DD MMM YYYY')
                ?.toUpperCase()
            : ''
        } - ${
          end_date
            ? dayjs(end_date)
                .locale(locale)
                .format('DD MMM YYYY')
                ?.toUpperCase()
            : ''
        }`,
    },
    {
      header: t('common:updated_by'),
      accessorKey: 'updated_by',
      cell: ({
        row: {
          original: { user_updated_by, updated_at },
        },
      }) => (
        <div className="ui-text-sm ui-font-normal ui-text-dark-blue">
          {`${user_updated_by?.firstname} ${user_updated_by?.lastname ?? ''} ${t('common:on_for_date')} ${dayjs(
            updated_at
          )
            .locale(locale)
            .format('DD MMM YYYY')} ${t('common:at_for_time')} ${dayjs(
            updated_at
          )
            .locale(locale)
            .format('HH:mm')}`}
        </div>
      ),
    },
    {
      header: t('periodOfStockTaking:status'),
      accessorKey: 'status',
      cell: ({ row: { original } }) =>
        hasPermission('period-of-stock-taking-mutate') ? (
          <PeriodOfStockTakingEnableDisableButton data={original} />
        ) : (
          <div className="ui-w-20">
            <PeriodOfStockTakingStatusBox status={original?.status} />
          </div>
        ),
    },
  ]

  return schema
}

import { ColumnDef } from '@tanstack/react-table'
import { colorClass } from '#pages/asset/list/components/AssetDegreeManagement'
import AssetTitleBlock from '#pages/asset/list/components/AssetTitleBlock'
import { formatToCelcius } from '#utils/strings'
import dayjs from 'dayjs'
import { TFunction } from 'i18next'

import { thousandFormatter } from '../../list/libs/asset-list.common'
import { TListLoggerActivity } from '../libs/asset-detail.types'

import 'dayjs/locale/id'
import 'dayjs/locale/en'

export const AssetDetailLoggerActivityColumns = (
  t: TFunction<['common', 'asset']>,
  language: string
) => {
  const schema: Array<ColumnDef<TListLoggerActivity>> = [
    {
      header: 'No.',
      cell: ({ row: { index } }) => index + 1,
    },
    {
      header: t('asset:detail.date'),
      cell: ({
        row: {
          original: { created_at },
        },
      }) =>
        dayjs(created_at)
          .locale(language)
          .format('DD MMM YYYY HH:mm')
          ?.toUpperCase(),
    },
    {
      header: t('asset:detail.status'),
      cell: ({
        row: {
          original: { temp },
        },
      }) => (
        <AssetTitleBlock
          arrText={[
            {
              label: formatToCelcius(
                thousandFormatter({ value: temp, locale: language })
              ),
              className: `ui-text-sm ui-font-bold ${colorClass(temp, {
                temp,
              })}`,
            },
          ]}
        />
      ),
    },
    {
      header: t('asset:detail.cold_chain_equipment_status'),
      accessorKey: 'cce_status',
      cell: ({
        row: {
          original: { working_status },
        },
      }) => working_status ?? '-',
    },
    {
      header: t('asset:detail.temperature_threshold'),
      cell: ({
        row: {
          original: { max_temp, min_temp },
        },
      }) =>
        `[Min ${min_temp ? formatToCelcius(thousandFormatter({ value: min_temp, locale: language })) : ''} - Max ${
          max_temp
            ? formatToCelcius(
                thousandFormatter({ value: max_temp, locale: language })
              )
            : ''
        }]`,
    },
  ]

  return schema
}

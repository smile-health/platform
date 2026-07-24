import { ColumnDef } from '@tanstack/react-table'
import { TFunction } from 'i18next'

import { thousandFormatter } from '../../list/libs/asset-list.common'
import { TAssetData } from '../../list/libs/asset-list.types'

import 'dayjs/locale/id'
import 'dayjs/locale/en'

export const AssetLoggerRelationColumns = (
  t: TFunction<['common', 'asset']>,
  language: string
) => {
  const schema: Array<ColumnDef<TAssetData>> = [
    {
      header: 'No.',
      cell: ({ row: { index } }) => index + 1,
    },
    {
      header: t('asset:detail.asset_logger_name'),
      cell: ({
        row: {
          original: { asset_model, serial_number },
        },
      }) => `${serial_number} - ${asset_model?.name}`,
    },
    {
      header: t('asset:detail.sensor'),
      cell: ({
        row: {
          original: { child_pos },
        },
      }) => thousandFormatter({ value: child_pos, locale: language }),
    },
    {
      header: t('asset:columns.asset_type'),
      cell: ({
        row: {
          original: { asset_type },
        },
      }) => asset_type?.name ?? '-',
    },
  ]

  return schema
}

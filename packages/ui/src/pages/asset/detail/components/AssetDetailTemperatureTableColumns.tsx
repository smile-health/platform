import { ColumnDef } from '@tanstack/react-table'
import { colorClass } from '#pages/asset/list/components/AssetDegreeManagement'
import AssetTitleBlock from '#pages/asset/list/components/AssetTitleBlock'
import { formatToCelcius } from '#utils/strings'
import dayjs from 'dayjs'
import { TFunction } from 'i18next'

import { thousandFormatter } from '../../list/libs/asset-list.common'
import { TAssetData } from '../../list/libs/asset-list.types'

import 'dayjs/locale/id'
import 'dayjs/locale/en'

export const TemperatureColumns = (
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
      header: t('asset:columns.temperature'),
      cell: ({
        row: {
          original: { latest_log },
        },
      }) => (
        <AssetTitleBlock
          arrText={[
            {
              label: formatToCelcius(
                thousandFormatter({
                  value: latest_log?.temp as number,
                  locale: language,
                })
              ),
              className: `ui-text-sm ui-font-bold ${colorClass(
                latest_log?.temp as number,
                latest_log
              )}`,
            },
            {
              label: dayjs(latest_log?.updated_at)
                ?.locale(language)
                ?.format('DD/MM/YYYY HH:mm'),
              className: 'ui-text-sm ui-font-normal ui-text-gray-400 ui-my-1',
            },
          ]}
        />
      ),
    },
  ]

  return schema
}

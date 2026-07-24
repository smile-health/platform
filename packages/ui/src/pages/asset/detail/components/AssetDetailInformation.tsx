import React, { useContext } from 'react'
import AssetTitleBlock from '#pages/asset/list/components/AssetTitleBlock'
import { formatToCelcius } from '#utils/strings'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import { thousandFormatter } from '../../list/libs/asset-list.common'
import AssetDetailContext from '../libs/asset-detail.context'
import AssetDetailInformationSetStatus from './AssetDetailInformationSetStatus'

import 'dayjs/locale/id'
import 'dayjs/locale/en'

const AssetDetailInformation = () => {
  const { t, i18n } = useTranslation(['common', 'asset'])
  const language = i18n.language
  const { data } = useContext(AssetDetailContext)

  const displayConfig = [
    {
      label: t('asset:detail.asset_type'),
      value: data?.asset_type?.name,
    },
    {
      label: t('asset:detail.production_year'),
      value: data?.prod_year,
    },
    {
      label: t('asset:detail.maintainer'),
      value: data?.maintainers
        ?.map((person) => `${person?.firstname} ${person?.lastname ?? ''}`)
        .join(', '),
    },
    {
      label: t('asset:detail.asset_status'),
      value: <AssetDetailInformationSetStatus />,
    },
    {
      label: t('asset:detail.temperature_threshold'),
      value: (
        <AssetTitleBlock
          arrText={[
            {
              label: `[Min ${data?.min_temp ? formatToCelcius(thousandFormatter({ value: data?.min_temp, locale: language })) : '-'}] - [Max ${
                data?.max_temp
                  ? formatToCelcius(
                      thousandFormatter({
                        value: data?.max_temp,
                        locale: language,
                      })
                    )
                  : '-'
              }]`,
              className: 'ui-text-sm ui-font-semibold ui-text-primary-500',
            },
            {
              label: dayjs(data?.updated_at)
                .locale(language)
                .format('DD MMM YYYY HH:mm')
                ?.toUpperCase(),
              className: 'ui-text-sm ui-font-normal ui-text-gray-400 ui-my-1',
            },
          ]}
        />
      ),
    },
    {
      label: t('asset:detail.asset_temperature'),
      value: data?.temp ? (
        <span className="ui-text-green-500 ui-font-semibold">
          {formatToCelcius(data?.temp)}
        </span>
      ) : (
        '-'
      ),
    },
  ]

  return (
    <div className="ui-table ui-w-3/4 ui-table-fixed">
      {displayConfig.map((item, index) => (
        <div key={index?.toString()} className="ui-table-row">
          <div className="ui-text-sm ui-font-semibold ui-table-cell ui-w-40 ui-py-2">
            {item.label}
          </div>
          <div className="ui-table-cell ui-text-sm ui-font-normal ui-text-gray-400 ui-w-8 ui-py-2">
            :
          </div>
          <div className="ui-text-sm ui-font-normal ui-text-gray-700 ui-table-cell ui-py-2">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  )
}

export default AssetDetailInformation

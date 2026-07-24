import React from 'react'
import { Button } from '#components/button'
import { formatToCelcius } from '#utils/strings'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import { thousandFormatter } from '../libs/asset-list.common'
import { ASSET_TYPE } from '../libs/asset-list.constants'

import 'dayjs/locale/id'
import 'dayjs/locale/en'

type AssetDegreeManagementProps = {
  latestLog: any
  parent: any
  temp: number
  assetType: any
  statusDevice: any
}

export const colorClass = (
  value: number,
  parent: AssetDegreeManagementProps['parent']
) => {
  if (value < parent?.min_temp) return 'ui-text-blue-700'
  if (value > parent?.max_temp) return 'ui-text-rose-500'
  return 'ui-text-green-500'
}
const AssetDegreeManagement: React.FC<AssetDegreeManagementProps> = ({
  latestLog,
  parent,
  temp,
  assetType,
  statusDevice,
}) => {
  const { t, i18n } = useTranslation(['common', 'asset'])
  const language = i18n.language

  if (!statusDevice || (!latestLog && !temp)) return '-'
  return (
    <div className="ui-flex ui-justify-start ui-items-start ui-gap-2">
      <div
        className={`${colorClass(latestLog?.temp ?? temp, parent)} ui-font-bold`}
      >
        {formatToCelcius(
          thousandFormatter({
            value: latestLog?.temp ?? temp,
            locale: language,
          })
        )}
      </div>
      <div className="ui-flex ui-flex-col ui-gap-1">
        <div className="ui-text-dark-teal">
          {dayjs(latestLog?.updated_at)
            .locale(language)
            .format('DD MMM YYYY')
            ?.toUpperCase()}
        </div>
        {assetType?.id === ASSET_TYPE.REMOTE_TEMPERATURE_MONITORING && (
          <Button
            variant="subtle"
            className="ui-text-blue-400"
            onClick={() => {}}
          >
            {t('asset:columns.view_temperature')}
          </Button>
        )}
      </div>
    </div>
  )
}

export default AssetDegreeManagement

import { hasPermission } from '#shared/permission/index'
import { parseDateTime } from '#utils/date'
import { useTranslation } from 'react-i18next'

import { handleOtherValue } from '../../../asset-managements.helper'
import { useStorageTemperatureMonitoringDetail } from '../StorageTemperatureMonitoringDetailContext'
import { DetailUpdateStatusButton } from '../use-cases/update-status/DetailUpdateStatusButton'

export const AssetInfoHeader = () => {
  const { t } = useTranslation(['common'])
  const { data } = useStorageTemperatureMonitoringDetail()

  return (
    <div className="ui-flex ui-items-start ui-justify-between ui-gap-4">
      <div>
        <div className="ui-text-primary-700 ui-font-semibold">
          {data?.serial_number}
          {handleOtherValue(
            data?.asset_model?.name,
            data?.other_asset_model_name
          )}
          {handleOtherValue(
            data?.manufacture?.name,
            data?.other_manufacture_name,
            'manufacturer'
          )}
        </div>
        <div className="ui-text-primary-700">{data?.entity?.name}</div>
        <div className="ui-text-neutral-500">
          {data?.regency?.name ? `${data?.regency?.name},` : ''}
          {data?.province?.name ? ` ${data?.province?.name}` : ''}
        </div>
      </div>
      <div className="ui-flex ui-items-center ui-gap-8">
        <div className="ui-text-neutral-500">
          {data?.updated_at
            ? parseDateTime(data.updated_at, 'DD MMM YYYY HH:mm').toUpperCase()
            : '-'}
          {data?.user_updated_by
            ? ` ${t('common:by')} ${data.user_updated_by?.fullname}`
            : ''}
        </div>
        <div className="flex gap-2">
          {hasPermission('storage-temperature-monitoring-global-mutate') && (
            <DetailUpdateStatusButton />
          )}
        </div>
      </div>
    </div>
  )
}

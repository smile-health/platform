import { Button } from '#components/button'
import useSmileRouter from '#hooks/useSmileRouter'
import { hasPermission } from '#shared/permission/index'
import { parseDateTime } from '#utils/date'
import { useTranslation } from 'react-i18next'

import { MONITORING_DEVICE_INVENTORY_STATUS } from '../../monitoring-device-inventory.constants'
import { useMonitoringDeviceInventoryDetail } from '../MonitoringDeviceInventoryDetailContext'
import { DetailDeleteButton } from '../use-cases/delete/DetailDeleteButton'

export const AssetInfoHeader = () => {
  const { t } = useTranslation(['common'])
  const router = useSmileRouter()
  const { data, isUpdatingStatus, isGlobal, onUpdateStatus } =
    useMonitoringDeviceInventoryDetail()

  const isActive =
    data?.device_status?.id === MONITORING_DEVICE_INVENTORY_STATUS.ACTIVE

  const handleToggleStatus = () => {
    onUpdateStatus({ status: isActive ? 0 : 1 })
  }

  return (
    <div className="ui-flex ui-items-start ui-justify-between ui-gap-4">
      <div>
        <div className="ui-text-primary-700 ui-font-semibold">
          {data?.serial_number} - {data?.asset_model?.name} (
          {data?.manufacturer?.name || '-'})
        </div>
        <div className="ui-text-primary-700">{data?.entity?.name}</div>
        <div className="ui-text-neutral-500">
          {data?.entity?.regency_name ? `${data?.entity?.regency_name},` : ''}
          {data?.entity?.province_name ? ` ${data?.entity?.province_name}` : ''}
        </div>
      </div>
      <div className="ui-flex ui-items-center ui-gap-8">
        <div className="ui-text-neutral-500">
          {data?.updated_at
            ? parseDateTime(data.updated_at, 'DD MMM YYYY HH:mm')
            : '-'}
          {data?.updated_by
            ? ` ${t('common:by')} ${data.updated_by?.name}`
            : ''}
        </div>
        <div className="flex gap-2">
          {hasPermission('monitoring-device-inventory-global-mutate') && (
            <>
              <DetailDeleteButton />
              <Button
                variant="outline"
                color={isActive ? 'danger' : 'success'}
                size="sm"
                onClick={handleToggleStatus}
                loading={isUpdatingStatus}
                disabled={isUpdatingStatus}
              >
                {t(`common:status.${isActive ? 'deactivate' : 'activate'}`)}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={isUpdatingStatus}
                onClick={() =>
                  router.pushGlobal(
                    `/v5/global-asset/management/monitoring-device-inventory/${data?.id}/edit`
                  )
                }
              >
                {t('common:edit')}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

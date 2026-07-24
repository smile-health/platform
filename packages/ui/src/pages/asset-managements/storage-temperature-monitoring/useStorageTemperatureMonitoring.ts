import { useTranslation } from 'react-i18next'

import { WorkingStatusEnum } from './StorageTemperatureMonitoringList/storage-temperature-monitoring-list.constants'
import {
  TAssetInventory,
  WorkingStatusOption,
} from './StorageTemperatureMonitoringList/storage-temperature-monitoring-list.types'

type useStorageTemperatureMonitoringFormProps = {
  data?: TAssetInventory | null
}

export const useStorageTemperatureMonitoringForm = ({
  data,
}: useStorageTemperatureMonitoringFormProps) => {
  const { t } = useTranslation(['common', 'storageTemperatureMonitoring'])
  const {
    NEED_REPAIR,
    UNSUBSCRIBED,
    NOT_USED,
    DEFROSTING,
    UNREPAIRABLE,
    DAMAGED,
    REPAIR,
    STANDBY,
    FUNCTION,
  } = WorkingStatusEnum

  const workingStatus: Record<WorkingStatusEnum, WorkingStatusOption> = {
    [UNSUBSCRIBED]: {
      value: UNSUBSCRIBED,
      label: t('storageTemperatureMonitoring:working_status.unsubscribed'),
      color: 'secondary',
    },
    [NOT_USED]: {
      value: NOT_USED,
      label: t('storageTemperatureMonitoring:working_status.not_used'),
      color: 'neutral',
    },
    [DEFROSTING]: {
      value: DEFROSTING,
      label: t('storageTemperatureMonitoring:working_status.defrosting'),
      color: 'warning',
    },
    [UNREPAIRABLE]: {
      value: UNREPAIRABLE,
      label: t('storageTemperatureMonitoring:working_status.unrepairable'),
      color: 'danger',
    },
    [DAMAGED]: {
      value: DAMAGED,
      label: t('storageTemperatureMonitoring:working_status.damaged'),
      color: 'danger',
    },
    [REPAIR]: {
      value: REPAIR,
      label: t('storageTemperatureMonitoring:working_status.repair'),
      color: 'secondary',
    },
    [NEED_REPAIR]: {
      value: NEED_REPAIR,
      label: t('storageTemperatureMonitoring:working_status.need_repair'),
      color: 'secondary',
    },
    [STANDBY]: {
      value: STANDBY,
      label: t('storageTemperatureMonitoring:working_status.standby'),
      color: 'success',
    },
    [FUNCTION]: {
      value: FUNCTION,
      label: t('storageTemperatureMonitoring:working_status.function'),
      color: 'success',
    },
  }

  return {
    t,
    workingStatus,
  }
}

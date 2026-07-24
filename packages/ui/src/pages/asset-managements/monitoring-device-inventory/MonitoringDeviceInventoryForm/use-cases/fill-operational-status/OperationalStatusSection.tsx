import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { ReactSelectAsync } from '#components/react-select'
import { OperationalStatusBadge } from '#pages/asset-managements/monitoring-device-inventory/components/OperationalStatusBadge'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { loadOperationalStatus } from '../../../MonitoringDeviceInventoryList/monitoring-device-inventory-list.service'
import { useMonitoringDeviceInventoryForm } from '../../MonitoringDeviceInventoryFormContext'

export const OperationalStatusSection = () => {
  const { t } = useTranslation(['common', 'monitoringDeviceInventoryForm'])
  const { isGlobal } = useMonitoringDeviceInventoryForm()
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext()

  return (
    <div className="ui-w-full ui-grid ui-grid-cols-1 ui-gap-4 ui-border ui-rounded-md ui-p-6 ui-mb-6">
      <div className="ui-items-center ui-justify-between flex">
        <div className="ui-font-bold ui-text-primary ui-text-dark-blue">
          {t('monitoringDeviceInventoryForm:section.operational_status.title')}
        </div>

        {watch('asset_rtmd_status_id') && (
          <OperationalStatusBadge
            statusId={watch('asset_rtmd_status_id.value')}
            statusName={watch('asset_rtmd_status_id.label')}
          />
        )}
      </div>

      <FormControl className="ui-w-full">
        <FormLabel htmlFor="asset_rtmd_status_id" required>
          {t('monitoringDeviceInventoryForm:field.operational_status.label')}
        </FormLabel>
        <Controller
          name="asset_rtmd_status_id"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <ReactSelectAsync
              {...field}
              id="asset_rtmd_status_id"
              isClearable
              loadOptions={loadOperationalStatus}
              placeholder={t(
                'monitoringDeviceInventoryForm:field.operational_status.placeholder'
              )}
              additional={{
                page: 1,
                isGlobal,
              }}
              error={!!error?.message}
            />
          )}
        />
        {errors?.asset_rtmd_status_id?.message && (
          <FormErrorMessage>
            {String(errors?.asset_rtmd_status_id?.message)}
          </FormErrorMessage>
        )}
      </FormControl>
    </div>
  )
}

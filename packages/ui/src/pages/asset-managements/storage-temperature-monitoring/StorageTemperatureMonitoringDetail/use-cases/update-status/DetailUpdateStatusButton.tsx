import { useMemo, useState } from 'react'
import { Button } from '#components/button'
import { useTranslation } from 'react-i18next'

import { useStorageTemperatureMonitoringDetail } from '../../StorageTemperatureMonitoringDetailContext'
import { DetailUpdateStatusModal } from './DetailUpdateStatusModal'

export type DetailUpdateBody = {
  working_status: {
    value?: number
    label?: string
  }
}

export const DetailUpdateStatusButton = () => {
  const { t } = useTranslation(['common', 'storageTemperatureMonitoringDetail'])
  const [isOpen, setIsOpen] = useState(false)
  const { data, isUpdatingStatus, onUpdateStatus } =
    useStorageTemperatureMonitoringDetail()

  const defaultValues = useMemo<DetailUpdateBody>(
    () => ({
      working_status: {
        value: Number(data?.working_status?.id),
        label: data?.working_status?.name ?? '',
      },
    }),
    [data?.working_status?.id, data?.working_status?.name]
  )

  return (
    <>
      <DetailUpdateStatusModal
        open={isOpen}
        setOpen={setIsOpen}
        onConfirm={onUpdateStatus}
        isUpdating={isUpdatingStatus}
        defaultValues={defaultValues}
      />
      <Button
        variant="outline"
        color="primary"
        size="md"
        onClick={() => setIsOpen(true)}
        loading={isUpdatingStatus}
        disabled={isUpdatingStatus}
      >
        {t('storageTemperatureMonitoringDetail:button.change_status')}
      </Button>
    </>
  )
}

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import useSmileRouter from '#hooks/useSmileRouter'
import { AxiosError } from 'axios'
import { TFunction } from 'i18next'
import { UseFormSetError } from 'react-hook-form'

import {
  createAssetInventory,
  updateAssetInventory,
} from '../../services/storage-temperature-monitoring.services'
import { MonitoringDeviceInventoryFormSubmitData } from '../libs/monitoring-device-inventory-form.type'

export const useSubmitMonitoringDeviceInventory = (
  t: TFunction<['common', 'assetManagements']>,
  setError: UseFormSetError<any>
) => {
  const router = useSmileRouter()
  const queryClient = useQueryClient()
  const {
    query: { id: monitoringDeviceInventoryId },
  } = router
  const createMutation = useMutation({
    mutationFn: createAssetInventory,
    onSuccess: () => {
      queryClient?.invalidateQueries({
        queryKey: ['monitoring-device-inventory'],
      })
      toast.success({
        description: t('assetManagements:toast.create_success'),
        id: 'toast-success-create-monitoring-device-inventory',
      })
      router.pushGlobal(
        '/v5/global-asset-managements/monitoring-device-inventory'
      )
    },
    onError: (error: AxiosError) => {
      const { message, errors } = error?.response?.data as {
        message: string
        errors: { [key: string]: Array<string> }
      }
      toast.danger({
        description: message || t('assetManagements:toast.create_failed'),
        id: 'toast-error-create-monitoring-device-inventory',
      })
      if (errors) {
        Object.keys(errors).forEach((key) => {
          const errorKey = key === 'entity_id' ? 'entity' : key
          setError(errorKey, {
            type: 'manual',
            message: errors[key]?.join(','),
          })
        })
      }
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: MonitoringDeviceInventoryFormSubmitData
    }) => updateAssetInventory(id, data),
    onSuccess: () => {
      queryClient?.invalidateQueries({
        queryKey: ['monitoring-device-inventory'],
      })
      toast.success({
        description: t('assetManagements:toast.update_success'),
        id: 'toast-success-update-monitoring-device-inventory',
      })
      router.pushGlobal(
        `/v5/global-asset-managements/monitoring-device-inventory/${monitoringDeviceInventoryId}`
      )
    },
    onError: (error: AxiosError) => {
      const { message, errors } = error?.response?.data as {
        message: string
        errors: { [key: string]: Array<string> }
      }
      toast.danger({
        description: message || t('assetManagements:toast.update_failed'),
        id: 'toast-error-update-monitoring-device-inventory',
      })
      if (errors) {
        Object.keys(errors).forEach((key) => {
          const errorKey = key === 'entity_id' ? 'entity' : key
          setError(errorKey, {
            type: 'manual',
            message: errors[key]?.join(','),
          })
        })
      }
    },
  })

  const submitMonitoringDeviceInventory = (
    data: MonitoringDeviceInventoryFormSubmitData
  ) => {
    if (monitoringDeviceInventoryId) {
      const id = Number(monitoringDeviceInventoryId)
      updateMutation.mutate({ id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const pendingMonitoringDeviceInventory =
    createMutation.isPending || updateMutation.isPending

  return { submitMonitoringDeviceInventory, pendingMonitoringDeviceInventory }
}

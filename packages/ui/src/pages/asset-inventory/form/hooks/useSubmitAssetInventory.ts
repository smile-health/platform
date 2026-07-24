import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import useSmileRouter from '#hooks/useSmileRouter'
import { AxiosError } from 'axios'
import { TFunction } from 'i18next'
import { UseFormSetError } from 'react-hook-form'

import {
  createAssetInventory,
  updateAssetInventory,
} from '../../services/asset-inventory.services'
import { AssetInventoryFormSubmitData } from '../libs/asset-inventory-form.type'

export const useSubmitAssetInventory = (
  t: TFunction<['common', 'assetInventory']>,
  setError: UseFormSetError<any>
) => {
  const router = useSmileRouter()
  const queryClient = useQueryClient()
  const {
    query: { id: assetInventoryId },
  } = router
  const createMutation = useMutation({
    mutationFn: createAssetInventory,
    onSuccess: (res: { id: number }) => {
      queryClient?.invalidateQueries({
        queryKey: ['asset-inventory'],
      })
      toast.success({
        description: t('assetInventory:toast.create_success'),
        id: 'toast-success-create-asset-inventory',
      })
      router.pushGlobal(
        `/v5/global-asset/management/operational-asset-inventory/${res?.id}`
      )
    },
    onError: (error: AxiosError) => {
      const { message, errors } = error?.response?.data as {
        message: string
        errors: { [key: string]: Array<string> }
      }
      toast.danger({
        description: message || t('assetInventory:toast.create_failed'),
        id: 'toast-error-create-asset-inventory',
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
      data: AssetInventoryFormSubmitData
    }) => updateAssetInventory(id, data),
    onSuccess: () => {
      queryClient?.invalidateQueries({
        queryKey: ['asset-inventory'],
      })
      toast.success({
        description: t('assetInventory:toast.update_success'),
        id: 'toast-success-update-asset-inventory',
      })
      router.pushGlobal(
        `/v5/global-asset/management/operational-asset-inventory/${assetInventoryId}`
      )
    },
    onError: (error: AxiosError) => {
      const { message, errors } = error?.response?.data as {
        message: string
        errors: { [key: string]: Array<string> }
      }
      toast.danger({
        description: message || t('assetInventory:toast.update_failed'),
        id: 'toast-error-update-asset-inventory',
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

  const submitAssetInventory = (data: AssetInventoryFormSubmitData) => {
    if (assetInventoryId) {
      const id = Number(assetInventoryId)
      updateMutation.mutate({ id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const pendingAssetInventory =
    createMutation.isPending || updateMutation.isPending

  return { submitAssetInventory, pendingAssetInventory }
}

import React, { useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation } from '@tanstack/react-query'
import { Button } from '#components/button'
import { FormControl, FormLabel } from '#components/form-control'
import { TextArea } from '#components/text-area'
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { AxiosError } from 'axios'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as yup from 'yup'

import { deleteAssetInventory } from '../../services/asset-inventory.services'
import AssetInventoryDetailModalDeleteConfirmation from './AssetInventoryDetailModalDeleteConfirmation'

export type TDeleteAssetInput = {
  reason: string
}

const AssetInventoryDetailDeleteAssetButton = () => {
  const { t } = useTranslation(['common', 'assetInventory'])
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const router = useSmileRouter()
  const { id } = router.query
  const { mutate: deleteAssetInventoryMutation, isPending } = useMutation({
    mutationFn: (payload: TDeleteAssetInput) =>
      deleteAssetInventory(Number(id), payload),
    onSuccess: () => {
      toast.success({
        description: t('assetInventory:toast.change_status_success'),
      })
      router.pushGlobal(
        '/v5/global-asset/management/operational-asset-inventory'
      )
    },
    onError: (err: AxiosError) => {
      return toast.danger({
        description:
          (err?.response?.data as { message?: string })?.message ??
          t('assetInventory:toast.change_status_failed'),
      })
    },
    onSettled: () => {
      setIsOpen(false)
    },
  })

  const methods = useForm<TDeleteAssetInput>({
    defaultValues: {
      reason: '',
    },
    mode: 'onChange',
    resolver: yupResolver(
      yup.object({
        reason: yup.string().required(t('common:validation.required')),
      })
    ),
  })

  const {
    register,
    formState: { errors },
    reset,
  } = methods

  const onValid: SubmitHandler<TDeleteAssetInput> = (formData) => {
    deleteAssetInventoryMutation(formData)
  }

  useSetLoadingPopupStore(isPending)

  return (
    <>
      <AssetInventoryDetailModalDeleteConfirmation
        open={isOpen}
        setOpen={setIsOpen}
        onSubmit={onValid}
        methods={methods}
      >
        <FormControl className="ui-mb-4">
          <FormLabel htmlFor="delete__asset__reason__textarea" required>
            {t('assetInventory:deletion.reason')}
          </FormLabel>
          <TextArea
            {...register('reason')}
            id="delete__asset__reason__textarea"
            placeholder={t('assetInventory:deletion.reason_placeholder')}
          />
          {errors.reason && (
            <p className="ui-text-red-500 ui-text-sm">
              {errors.reason.message}
            </p>
          )}
        </FormControl>
      </AssetInventoryDetailModalDeleteConfirmation>
      <Button
        variant="outline"
        color="danger"
        className="ui-mb-4 ui-w-auto"
        onClick={() => {
          setIsOpen(true)
          reset()
        }}
      >
        {t('common:delete')}
      </Button>
    </>
  )
}

export default AssetInventoryDetailDeleteAssetButton

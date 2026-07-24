import React, { useContext, useState } from 'react'
import { ModalConfirmation } from '@repo/ui/components/modules/ModalConfirmation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '#components/button'
import { toast } from '#components/toast'
import { BOOLEAN } from '#constants/common'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { useTranslation } from 'react-i18next'

import { updateAssetActivation } from '../../services/asset-inventory.services'
import AssetInventoryDetailContext from '../libs/asset-inventory-detail.context'

const AssetInventoryDetailChangeStatusButton = () => {
  const { t } = useTranslation(['common', 'assetInventory'])
  const queryClient = useQueryClient()
  const { data } = useContext(AssetInventoryDetailContext)
  const router = useSmileRouter()
  const { id } = router.query
  const sendStatus =
    Number(data?.status?.id) === BOOLEAN.TRUE ? BOOLEAN.FALSE : BOOLEAN.TRUE
  const { mutate: updateAssetActivationMutation, isPending } = useMutation({
    mutationFn: () => updateAssetActivation(Number(sendStatus), Number(id)),
    onSuccess: () => {
      toast.success({
        description: t('assetInventory:toast.change_status_success'),
      })
    },
    onError: (err) =>
      toast.danger({
        description:
          err?.message ?? t('assetInventory:toast.change_status_failed'),
      }),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['detail-asset-inventory', id],
      })
      queryClient.invalidateQueries({
        queryKey: ['detail-asset-inventory-child', id],
      })
      setIsOpen(false)
    },
  })
  const [isOpen, setIsOpen] = useState(false)
  useSetLoadingPopupStore(isPending)
  return (
    <>
      <ModalConfirmation
        open={isOpen}
        setOpen={setIsOpen}
        description={t('assetInventory:disable_confirmation')}
        onSubmit={updateAssetActivationMutation}
      />
      <Button
        variant="outline"
        color={Number(data?.status?.id) === BOOLEAN.TRUE ? 'danger' : 'success'}
        className="ui-mb-4 ui-w-auto"
        onClick={() => setIsOpen(true)}
      >
        {Number(data?.status?.id) === BOOLEAN.TRUE
          ? t('assetInventory:deactivate')
          : t('assetInventory:activate')}
      </Button>
    </>
  )
}

export default AssetInventoryDetailChangeStatusButton

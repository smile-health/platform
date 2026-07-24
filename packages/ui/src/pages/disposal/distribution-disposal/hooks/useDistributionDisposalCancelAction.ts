import { useContext } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { AxiosError } from 'axios'
import { TFunction } from 'i18next'

import { cancelDistributionDisposal } from '../services/distribution-disposal.services'
import DistributionDisposalDetailContext from '../utils/distribution-disposal-detail.context'

export const useDistributionDisposalCancelAction = (
  t: TFunction<['common', 'distributionDisposal']>,
  language: string
) => {
  const router = useSmileRouter()
  const queryClient = useQueryClient()
  const { id } = router.query

  const { setInProcess, comment, setComment, setSavedQuantityData } =
    useContext(DistributionDisposalDetailContext)

  const { mutate: handleCancelShipment, isPending: isPendingCancelShipment } =
    useMutation({
      mutationKey: ['cancel-shipment-distribution-disposal', id],
      mutationFn: () => cancelDistributionDisposal(Number(id), { comment }),
      onError: (err: AxiosError) => {
        const { message } = err.response?.data as { message: string }
        toast.danger({ description: message })
      },
      onSuccess: () => {
        setInProcess(false)
        setComment('')
        setSavedQuantityData(null)
        toast.success({
          description: t(
            'distributionDisposal:detail.status_confirmation.success_cancel'
          ),
        })
        queryClient.invalidateQueries({
          queryKey: ['distribution-disposal-detail', { id, language }],
        })
      },
    })

  useSetLoadingPopupStore(isPendingCancelShipment)

  return {
    handleCancelShipment,
  }
}

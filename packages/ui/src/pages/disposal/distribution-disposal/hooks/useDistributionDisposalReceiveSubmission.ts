import { useContext } from 'react'
import { useParams } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { TFunction } from 'i18next'

import { fulfillDistributionDisposal } from '../services/distribution-disposal.services'
import {
  TSubmitUpdateReceivedStock,
  TUpdateReceivedStock,
} from '../types/DistributionDisposal'
import DistributionDisposalDetailContext from '../utils/distribution-disposal-detail.context'

export const useDistributionDisposalReceiveSubmission = (
  t: TFunction<['common', 'distributionDisposal']>,
  language: string
) => {
  const {
    comment,
    setComment,
    setInProcess,
    savedQuantityData,
    setSavedQuantityData,
  } = useContext(DistributionDisposalDetailContext)

  const params = useParams()
  const id = params.id as string
  const queryClient = useQueryClient()
  const submittedData = {
    comment,
    items: savedQuantityData as TUpdateReceivedStock[],
  }
  const { mutate: handleReceiveShipment, isPending: isPendingFulfillOrder } =
    useMutation({
      mutationKey: ['fulfill-shipment-distribution-disposal', id],
      mutationFn: () =>
        fulfillDistributionDisposal(
          Number(id),
          submittedData as TSubmitUpdateReceivedStock
        ),
      onError: (err: any) => {
        const { data } = err.response
        toast.danger({ description: data?.message ?? data?.error })
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['distribution-disposal-detail', { id, language }],
        })
        setComment('')
        setSavedQuantityData(null)
        setInProcess(false)
        toast.success({
          description: t('distributionDisposal:receive.success'),
        })
      },
    })

  useSetLoadingPopupStore(isPendingFulfillOrder)

  return {
    handleReceiveShipment,
  }
}

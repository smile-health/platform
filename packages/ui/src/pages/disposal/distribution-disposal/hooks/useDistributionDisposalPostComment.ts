import { useContext } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { TFunction } from 'i18next'

import { createDistributionDisposalComment } from '../services/distribution-disposal.services'
import DistributionDisposalDetailContext from '../utils/distribution-disposal-detail.context'

export const useDistributionDisposalPostComment = (
  t: TFunction<['common', 'distributionDisposal']>,
  language: string
) => {
  const router = useSmileRouter()
  const queryClient = useQueryClient()
  const { id } = router.query
  const { comment, setComment } = useContext(DistributionDisposalDetailContext)

  const { mutate, isPending, isError } = useMutation({
    mutationKey: ['post-comment-distribution-disposal', id],
    mutationFn: () =>
      createDistributionDisposalComment(Number(id), { comment }),
    onError: (err: any) => {
      const { data } = err.response
      toast.danger({ description: data })
    },
    onSuccess: () => {
      toast.success({
        description: t('distributionDisposal:detail.comment.success_submit'),
      })
      setComment('')
      queryClient.invalidateQueries({
        queryKey: ['distribution-disposal-detail', { id, language }],
      })
    },
  })

  useSetLoadingPopupStore(isPending)

  return {
    mutate,
    isPending,
    isError,
  }
}

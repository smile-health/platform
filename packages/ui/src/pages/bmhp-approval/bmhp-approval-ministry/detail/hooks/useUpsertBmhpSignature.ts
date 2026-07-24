import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  upsertBmhpSignature,
  UpsertSignaturePayload,
} from '../services/ministry-detail.service'

export const useUpsertBmhpSignature = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpsertSignaturePayload) => upsertBmhpSignature(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bmhp-approval-signature'] })
    },
  })
}

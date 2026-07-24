import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useTranslation } from 'react-i18next'

import {
  PatchVerificationStatusBody,
  ReviewProgramPlanBody,
  UpdateVerificationStatusBody,
} from '../libs/target-adjustment.type'
import {
  patchVerificationStatus,
  reviewProgramPlan,
  // updateTargetAdjustmentData,
  updateVerificationStatus,
} from '../services/target-adjustment.service'

// export const useUpdateTargetAdjustment = () => {
//   const { t } = useTranslation(['common', 'bmhpApproval'])
//   const queryClient = useQueryClient()

//   const mutation = useMutation({
//     mutationFn: (body: UpdateBmhpVerificationsBody) =>
//       updateTargetAdjustmentData(body),
//     onSuccess: () => {
//       toast.success({
//         title: t('bmhpApproval:target_adjustment.mutations.save_success_title'),
//         description: t(
//           'bmhpApproval:target_adjustment.mutations.save_success_desc'
//         ),
//       })
//       queryClient.invalidateQueries({ queryKey: ['bmhp-target-adjustment'] })
//     },
//     onError: (error: unknown) => {
//       const msg =
//         (error as { response?: { data?: { message?: string } } })?.response
//           ?.data?.message ||
//         (error as { message?: string })?.message ||
//         t('error.generic', 'Gagal menyimpan data')
//       toast.danger({ title: 'Error', description: msg })
//     },
//   })

//   return {
//     updateData: mutation.mutate,
//     isUpdating: mutation.isPending,
//   }
// }

export const useReviewProgramPlan = () => {
  const { t } = useTranslation(['bmhpApproval'])
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (body: ReviewProgramPlanBody) => reviewProgramPlan(body),
    onSuccess: (_, variables) => {
      const isApprove = variables.status === 1
      queryClient.invalidateQueries({ queryKey: ['bmhp-approval-list'] })
      toast.success({
        title: isApprove
          ? t('bmhpApproval:target_adjustment.mutations.approve_success_title')
          : t('bmhpApproval:target_adjustment.mutations.revision_success_title'),
        description: isApprove
          ? t('bmhpApproval:target_adjustment.mutations.approve_success_desc')
          : t('bmhpApproval:target_adjustment.mutations.revision_success_desc'),
      })
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        t('bmhpApproval:target_adjustment.mutations.revision_error')
      toast.danger({ title: 'Error', description: msg })
    },
  })

  return {
    sendRevision: mutation.mutate,
    isSending: mutation.isPending,
    isSuccess: mutation.isSuccess,
  }
}

export const useUpdateVerificationStatus = () => {
  const { t } = useTranslation(['common', 'bmhpApproval'])
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (body: UpdateVerificationStatusBody) =>
      updateVerificationStatus(body),
    onSuccess: (_, variables) => {
      const isApprove = variables.status === 1
      toast.success({
        title: isApprove
          ? t('bmhpApproval:target_adjustment.mutations.approve_success_title')
          : t('bmhpApproval:target_adjustment.mutations.save_success_title'),
        description: isApprove
          ? t('bmhpApproval:target_adjustment.mutations.approve_success_desc')
          : t('bmhpApproval:target_adjustment.mutations.save_success_desc'),
      })
      queryClient.invalidateQueries({ queryKey: ['bmhp-target-adjustment'] })
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        t('error.generic', 'Gagal menyimpan status')
      toast.danger({ title: 'Error', description: msg })
    },
  })

  return {
    updateStatus: mutation.mutate,
    isUpdatingStatus: mutation.isPending,
  }
}

export const usePatchVerificationStatus = () => {
  const { t } = useTranslation(['common', 'bmhpApproval'])
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (body: PatchVerificationStatusBody) =>
      patchVerificationStatus(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bmhp-target-adjustment'] })
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        t('error.generic', 'Failed to update verification status')
      toast.danger({ title: 'Error', description: msg })
    },
  })

  return {
    patchStatus: mutation.mutate,
    isPatchingStatus: mutation.isPending,
  }
}

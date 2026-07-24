import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useTranslation } from 'react-i18next'

import { submitProvinceToMOH } from '../../services/bmhp-planning.services'

// import { submitProvinceToMOH } from '../services/bmhp-planning.services'

export const useBmhpApprovalProvince = () => {
  const { t } = useTranslation(['common', 'bmhpApproval'])
  const queryClient = useQueryClient()

  const mutationSubmitToMOH = useMutation({
    mutationFn: (programPlanId: number) =>
      submitProvinceToMOH({ program_plan_id: programPlanId }),
    onSuccess: (res) => {
      toast.success({
        title:
          res?.message ??
          t('bmhpApproval:province_approval.mutations.submit_to_moh_success'),
      })
      queryClient.invalidateQueries({ queryKey: ['bmhp-approval-province-list'] })
    },
    onError: (err: any) => {
      toast.danger({
        title:
          err?.response?.data?.message ??
          err?.message ??
          t('bmhpApproval:province_approval.mutations.submit_to_moh_error'),
      })
    },
  })

  return {
    submitToMOH: mutationSubmitToMOH.mutate,
    isSubmitting: mutationSubmitToMOH.isPending,
  }
}

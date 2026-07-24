import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import useSmileRouter from '#hooks/useSmileRouter'
import { ErrorResponse } from '#types/common'
import { AxiosError } from 'axios'
import { UseFormSetError } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  createProgramPlanMaterialRatio,
  updateProgramPlanMaterialRatio,
} from '../../services/program-plan-material-ratio.services'
import { ProgramPlanMaterialRatioFormData } from '../libs/program-plan-material-ratio-form.type'

type TUseSubmitProgramPlanMaterialRatioProps = {
  setError: UseFormSetError<ProgramPlanMaterialRatioFormData>
}

export const useSubmitProgramPlanMaterialRatio = ({
  setError,
}: TUseSubmitProgramPlanMaterialRatioProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'programPlanMaterialRatio'])
  const router = useSmileRouter()
  const { id: planId, ratioId } = router.query
  const queryClient = useQueryClient()
  const { mutate, isPending } = useMutation({
    mutationFn: (data: ProgramPlanMaterialRatioFormData) => {
      if (ratioId) {
        return updateProgramPlanMaterialRatio(
          Number(planId),
          Number(ratioId),
          data
        )
      }
      return createProgramPlanMaterialRatio(Number(planId), data)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['list-program-plan-material-ratio'],
        refetchType: 'all',
      })
      await queryClient.invalidateQueries({
        queryKey: ['detail-program-plan', language, planId],
        refetchType: 'all',
      })
      const toastMessageDescription = ratioId
        ? t('programPlanMaterialRatio:toast.update_success')
        : t('programPlanMaterialRatio:toast.create_success')
      toast.success({
        description: toastMessageDescription,
        id: 'toast-success-create-update-program-plan-material-ratio',
      })
      router.push(`/v5/program-plan/${planId}/ratio`)
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      if (error instanceof AxiosError) {
        const response = error.response?.data as ErrorResponse
        toast.danger({
          description: error.response?.data?.message,
          id: 'toast-error-create-update-program-plan-material-ratio',
          duration: 3000,
        })
        if (response.errors) {
          for (const item of Object.keys(response.errors)) {
            setError(item as keyof ProgramPlanMaterialRatioFormData, {
              message: response.errors[item][0],
              type: 'min',
            })
          }
        }
      }
    },
  })

  return { mutate, isPending }
}

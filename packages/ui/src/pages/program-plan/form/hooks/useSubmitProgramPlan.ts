import { useContext } from 'react'
import { useFeatureIsOn } from '@growthbook/growthbook-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import useSmileRouter from '#hooks/useSmileRouter'
import { ErrorResponse } from '#types/common'
import { AxiosError } from 'axios'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import ProgramPlanListContext from '../../list/libs/program-plan-list.context'
import { createProgramPlan } from '../../services/program-plan.services'
import {
  ProgramPlanSubmitData,
  ProgramPlanSubmitForm,
} from '../libs/program-plan-form.type'

type TUseSubmitProgramPlanProps = Readonly<{
  setError: ReturnType<typeof useFormContext>['setError']
}>

export const useSubmitProgramPlan = ({
  setError,
}: TUseSubmitProgramPlanProps) => {
  const isCopyProgramPlan = useFeatureIsOn('annual_planning.copy_program_plan')
  const { setOpenCreateModal } = useContext(ProgramPlanListContext) ?? {}
  const { t } = useTranslation(['common', 'programPlan'])
  const router = useSmileRouter()
  const queryClient = useQueryClient()
  const createMutation = useMutation({
    mutationFn: createProgramPlan,
    onSuccess: () => {
      toast.success({
        description: t('programPlan:message.successfully_created'),
        id: 'toast-success-create-program-plan',
      })
      queryClient.invalidateQueries({
        queryKey: ['list-program-plan'],
        refetchType: 'all',
      })
      if (isCopyProgramPlan) router.push('/v5/program-plan')
      else setOpenCreateModal?.(false)
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      if (error instanceof AxiosError) {
        const response = error.response?.data as ErrorResponse
        toast.danger({
          description: error.response?.data?.message,
          id: 'toast-error-create-program-plan',
          duration: 3000,
        })
        if (response.errors) {
          for (const item of Object.keys(response.errors)) {
            setError(item as keyof ProgramPlanSubmitData, {
              message: response.errors[item][0],
              type: 'min',
            })
          }
        }
      }
    },
  })

  return {
    submitProgramPlan: (data: ProgramPlanSubmitForm) => {
      createMutation.mutate(data)
    },
    pendingProgramPlan: createMutation.isPending,
  }
}

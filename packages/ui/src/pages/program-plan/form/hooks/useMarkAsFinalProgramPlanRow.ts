import { useContext } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import useSmileRouter from '#hooks/useSmileRouter'
import { ErrorResponse } from '#types/common'
import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'

import ProgramPlanListContext from '../../list/libs/program-plan-list.context'
import { markFinalProgramPlan } from '../../services/program-plan.services'

export const useMarkAsFinalProgramPlanRow = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'programPlan'])
  const { setPopUpDataRow } = useContext(ProgramPlanListContext)
  const queryClient = useQueryClient()
  const router = useSmileRouter()
  const { id } = router.query
  const { mutate, isPending } = useMutation({
    mutationFn: () => markFinalProgramPlan(Number(id)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['detail-program-plan', language, id],
        refetchType: 'all',
      })
      await queryClient.invalidateQueries({
        queryKey: ['list-program-plan'],
        refetchType: 'all',
      })
      toast.success({
        description: t('programPlan:toast.mark_as_final_success'),
        id: 'toast-success-mark-as-final-program-plan',
      })
      router.push('/v5/program-plan')
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      if (error instanceof AxiosError) {
        toast.danger({
          description: error.response?.data?.message,
          id: 'toast_error_finalize_program_plan',
          duration: 3000,
        })
      }
    },
    onSettled: () => {
      setPopUpDataRow(null)
    },
  })

  return { mutate, isPending }
}

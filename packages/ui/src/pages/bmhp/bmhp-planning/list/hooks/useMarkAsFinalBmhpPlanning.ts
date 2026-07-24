import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import useSmileRouter from '#hooks/useSmileRouter'
import { ErrorResponse } from '#types/common'
import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'

import { markFinalBmhpPlanning } from '../../services/bmhp-planning.services'

export const useMarkAsFinalBmhpPlanning = (onSettled?: () => void) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'bmhpPlanning'])
  const queryClient = useQueryClient()
  const router = useSmileRouter()
  const { year_id } = router.query

  const { mutate, isPending } = useMutation({
    mutationFn: () => markFinalBmhpPlanning(Number(year_id)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['bmhp-planning-year-detail', language, year_id],
        refetchType: 'all',
      })
      await queryClient.invalidateQueries({
        queryKey: ['bmhp-planning-years'],
        refetchType: 'all',
      })
      toast.success({
        description: t('bmhpPlanning:message.mark_as_final_success'),
        id: 'toast-success-mark-as-final-bmhp-planning',
      })
      router.push('/v5/bmhp-planning')
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      if (error instanceof AxiosError) {
        toast.danger({
          description: error.response?.data?.message,
          id: 'toast_error_finalize_bmhp_planning',
          duration: 3000,
        })
      }
    },
    onSettled: () => {
      onSettled?.()
    },
  })

  return { mutate, isPending }
}

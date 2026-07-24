import { useContext } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import useSmileRouter from '#hooks/useSmileRouter'
import { ErrorResponse } from '#types/common'
import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'

import AnnualPlanningSubstitutionListContext from '../../list/libs/annual-planning-substitution-list.context'
import { deleteAnnualPlanningSubstitution } from '../../services/annual-planning-substitution.services'

export const useDeleteAnnualPlanningSubstitutionRow = () => {
  const { t } = useTranslation(['common', 'annualPlanningSubstitution'])
  const router = useSmileRouter()
  const { id: planId } = router.query
  const { openedRow, setOpenedRow } = useContext(
    AnnualPlanningSubstitutionListContext
  )
  const queryClient = useQueryClient()
  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      deleteAnnualPlanningSubstitution(Number(planId), openedRow?.id || 0),
    onSuccess: () => {
      toast.success({
        description: t('annualPlanningSubstitution:toast.delete_success'),
        id: 'toast-success-delete-annual-planning-substitution',
      })
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      if (error instanceof AxiosError) {
        toast.danger({
          description: error.response?.data?.message,
          id: 'toast-error-delete-annual-planning-substitution',
          duration: 3000,
        })
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['list-annual-planning-substitution'],
        refetchType: 'all',
      })
      await queryClient.invalidateQueries({
        queryKey: ['detail-program-plan'],
        refetchType: 'all',
      })
      setOpenedRow(null)
    },
  })

  return { mutate, isPending }
}

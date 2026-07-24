import { useContext } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import useSmileRouter from '#hooks/useSmileRouter'
import { ErrorResponse } from '#types/common'
import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'

import AnnualPlanningTargetGroupListContext from '../../list/libs/annual-planning-target-group-list.context'
import {
  changeStatusAnnualPlanningTargetGroup,
  deleteAnnualPlanningTargetGroup,
} from '../../services/annual-planning-target-group.services'

export const useActivateDeactivateAnnualPlanningTargetGroupRow = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'annualPlanningTargetGroup'])
  const router = useSmileRouter()
  const { id: routerId } = router.query
  const { setOpenedRow, openedRow, isGlobal } = useContext(
    AnnualPlanningTargetGroupListContext
  )
  const queryClient = useQueryClient()
  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      isGlobal
        ? changeStatusAnnualPlanningTargetGroup(
            openedRow?.id || 0,
            Number(!openedRow?.is_active)
          )
        : deleteAnnualPlanningTargetGroup(Number(routerId), openedRow?.id || 0),
    onSuccess: (res) => {
      if (!isGlobal) {
        toast.success({
          description: t('annualPlanningTargetGroup:toast.delete_success'),
          id: 'toast-success-delete-annual-planning-target-group',
        })
        return
      }
      if (!openedRow?.is_active) {
        toast.success({
          description: t('annualPlanningTargetGroup:toast.activate_success'),
          id: 'toast-success-activate-annual-planning-target-group',
        })
        return
      }
      toast.success({
        description: t('annualPlanningTargetGroup:toast.deactivate_success'),
        id: 'toast-success-deactivate-annual-planning-target-group',
      })
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      if (error instanceof AxiosError) {
        toast.danger({
          description: error.response?.data?.message,
          id: 'toast_error_create_annual_planning_target_group',
          duration: 3000,
        })
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['list-annual-planning-target-group'],
      })
      if (!isGlobal)
        await queryClient.invalidateQueries({
          queryKey: ['detail-program-plan', language, routerId],
        })
      if (openedRow?.opened_for === 'activation') setOpenedRow(null)
    },
  })

  return { mutate, isPending }
}

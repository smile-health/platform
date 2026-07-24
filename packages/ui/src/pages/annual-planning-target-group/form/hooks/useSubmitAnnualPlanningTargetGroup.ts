import { useContext } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import useSmileRouter from '#hooks/useSmileRouter'
import { ErrorResponse } from '#types/common'
import { AxiosError } from 'axios'
import { UseFormSetError } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import AnnualPlanningTargetGroupListContext from '../../list/libs/annual-planning-target-group-list.context'
import {
  createAnnualPlanningTargetGroup,
  updateAnnualPlanningTargetGroup,
} from '../../services/annual-planning-target-group.services'
import {
  AnnualPlanningTargetGroupFormData,
  AnnualPlanningTargetGroupProgramChildFormData,
} from '../libs/annual-planning-target-group-form.type'

type TUseSubmitAnnualPlanningTargetGroupProps = {
  setError: UseFormSetError<AnnualPlanningTargetGroupFormData>
  isGlobal: boolean
  handleClose: () => void
}

export const useSubmitAnnualPlanningTargetGroup = ({
  setError,
  isGlobal = false,
  handleClose,
}: TUseSubmitAnnualPlanningTargetGroupProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'annualPlanningTargetGroup'])
  const router = useSmileRouter()
  const { id } = router.query
  const programPlanId = id ? Number(id) : null
  const { openedRow, setOpenedRow } = useContext(
    AnnualPlanningTargetGroupListContext
  )
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationKey: [
      'create-annual-planning-target-group',
      isGlobal,
      programPlanId,
    ],
    mutationFn: (data: AnnualPlanningTargetGroupFormData) =>
      openedRow?.opened_for === 'edit'
        ? updateAnnualPlanningTargetGroup(data, Number(openedRow.id))
        : createAnnualPlanningTargetGroup(data, isGlobal, programPlanId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['list-annual-planning-target-group'],
      })
      if (!isGlobal) {
        await queryClient.invalidateQueries({
          queryKey: ['detail-program-plan', language, programPlanId],
        })
      }
      if (openedRow?.opened_for === 'edit')
        toast.success({
          description: t('annualPlanningTargetGroup:toast.update_success'),
          id: 'toast_success_update_annual_planning_target_group',
        })
      else
        toast.success({
          description: t('annualPlanningTargetGroup:toast.create_success'),
          id: 'toast_success_create_annual_planning_target_group',
        })
      handleClose()
      if (openedRow?.opened_for === 'edit') {
        setTimeout(() => {
          setOpenedRow(null)
        }, 300)
      }
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      if (error instanceof AxiosError) {
        const response = error.response?.data as ErrorResponse
        toast.danger({
          description: error.response?.data?.message,
          id: 'toast_error_create_annual_planning_target_group',
          duration: 3000,
        })
        if (response.errors) {
          if (isGlobal)
            for (const item of Object.keys(response.errors)) {
              setError(item as keyof AnnualPlanningTargetGroupFormData, {
                message: response.errors[item][0],
                type: 'min',
              })
            }
          else
            for (const item of Object.keys(response.errors)) {
              const modifiedItem = `target_group.${item}.target_group_child`
              setError(
                modifiedItem as keyof AnnualPlanningTargetGroupProgramChildFormData,
                {
                  message: response.errors[item][0],
                  type: 'min',
                }
              )
            }
        }
      }
    },
  })

  return { mutate, isPending }
}

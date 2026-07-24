import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import useSmileRouter from '#hooks/useSmileRouter'
import { ErrorResponse } from '#types/common'
import { AxiosError } from 'axios'
import { UseFormSetError } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  createAnnualPlanningSubstitution,
  editAnnualPlanningSubstitution,
} from '../../services/annual-planning-substitution.services'
import { AnnualPlanningSubstitutionFormData } from '../libs/annual-planning-substitution-form.type'

type TUseSubmitAnnualPlanningSubstitutionProps = {
  setError: UseFormSetError<AnnualPlanningSubstitutionFormData>
}

export const useSubmitAnnualPlanningSubstitution = ({
  setError,
}: TUseSubmitAnnualPlanningSubstitutionProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'annualPlanningSubstitution'])
  const router = useSmileRouter()
  const { id: planId, substitutionId } = router.query
  const queryClient = useQueryClient()
  const { mutate, isPending } = useMutation({
    mutationFn: (data: AnnualPlanningSubstitutionFormData) =>
      substitutionId
        ? editAnnualPlanningSubstitution(
            Number(planId),
            Number(substitutionId),
            data
          )
        : createAnnualPlanningSubstitution(Number(planId), data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['list-annual-planning-substitution'],
        refetchType: 'all',
      })
      await queryClient.invalidateQueries({
        queryKey: ['detail-program-plan', language, planId],
        refetchType: 'all',
      })
      const toastMessageDescription = substitutionId
        ? t('annualPlanningSubstitution:toast.update_success')
        : t('annualPlanningSubstitution:toast.create_success')
      toast.success({
        description: toastMessageDescription,
        id: 'toast-success-create-update-annual-planning-substitution',
      })
      router.push(`/v5/program-plan/${planId}/substitution`)
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      if (error instanceof AxiosError) {
        const response = error.response?.data as ErrorResponse
        toast.danger({
          description: error.response?.data?.message,
          id: 'toast_error_create_update_annual_planning_substitution',
          duration: 3000,
        })
        if (response.errors) {
          const { material_id, ...restErrors } = response.errors
          const modifiedRestErrors = Object.keys(restErrors).reduce(
            (acc, key) => {
              const newKey = `substitution_materials.${key?.split('.')[1]}.substitution_material_child`
              acc[newKey] = restErrors[key]
              return acc
            },
            {} as Record<string, string[]>
          )
          const mappedResponseErrors: Record<string, string[]> = {
            material: material_id ?? null,
            ...modifiedRestErrors,
          }

          const filteredMappedResponseErrors = Object.fromEntries(
            Object.entries(mappedResponseErrors).filter(
              ([, value]) => value !== null
            )
          )

          for (const key of Object.keys(filteredMappedResponseErrors)) {
            setError(key as keyof AnnualPlanningSubstitutionFormData, {
              message: filteredMappedResponseErrors[key][0],
              type: 'min',
            })
          }
        }
      }
    },
  })

  return { mutate, isPending }
}

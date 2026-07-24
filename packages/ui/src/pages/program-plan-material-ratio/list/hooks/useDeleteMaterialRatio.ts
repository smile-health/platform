import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'

import { deleteProgramPlanMaterialRatio } from '../../services/program-plan-material-ratio.services'
import { TRatioRow } from '../libs/program-plan-ratio.list.type'

export default function useDeleteMaterialRatio() {
  const { t } = useTranslation(['common', 'programPlanMaterialRatio'])
  const queryClient = useQueryClient()

  const { mutate, isPending: isPendingDelete } = useMutation({
    mutationFn: (materialRatioId: number) =>
      deleteProgramPlanMaterialRatio(materialRatioId),
    onSuccess: () =>
      toast.success({
        description: t('programPlanMaterialRatio:delete.success'),
      }),
    onError: (err: AxiosError) => {
      toast.danger({
        description: err?.message || t('programPlanMaterialRatio:delete.error'),
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['program-plan-material-ratio'],
      })
    },
  })

  const [selectedMaterialRatio, setSelectedMaterialRatio] =
    useState<TRatioRow | null>(null)
  const [showDelete, setShowDelete] = useState(false)

  const handleDeleteMaterialRatio = () => {
    mutate(selectedMaterialRatio?.id as number)
  }

  const handleDeleteButton = (materialRatio: TRatioRow) => {
    setSelectedMaterialRatio(materialRatio)
    setShowDelete(true)
  }

  useSetLoadingPopupStore(isPendingDelete)

  return {
    showDelete,
    setShowDelete,
    handleDeleteButton,
    handleDeleteMaterialRatio,
  }
}

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'

import { importProgramPlanMaterialRatio } from '../../services/program-plan-material-ratio.services'

export default function useImportMaterialRatio() {
  const { t } = useTranslation(['common', 'programPlanMaterialRatio'])
  const params = useParams()
  const programPlanId = Number(params.id)
  const [showImport, setShowImport] = useState(false)
  const queryClient = useQueryClient()

  const { mutate: handleImport, isPending: isPendingImport } = useMutation({
    mutationFn: (data: FormData) =>
      importProgramPlanMaterialRatio(programPlanId, data),
    onSuccess: () =>
      toast.success({
        description: t('programPlanMaterialRatio:import.success'),
      }),
    onError: (err: AxiosError) => {
      toast.danger({
        description: err?.message || t('programPlanMaterialRatio:import.error'),
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['program-plan-material-ratio'],
      })
    },
  })

  useSetLoadingPopupStore(isPendingImport)

  return {
    showImport,
    setShowImport,
    handleImport,
  }
}

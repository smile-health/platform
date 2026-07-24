import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { importTask } from '#services/task'
import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'

export default function useImportTask() {
  const { t } = useTranslation(['common', 'task'])
  const [showImport, setShowImport] = useState(false)
  const queryClient = useQueryClient()
  const params = useParams()
  const programPlanId = Number(params.id)

  const { mutate: handleImport, isPending: isPendingImport } = useMutation({
    mutationFn: (data: FormData) => importTask(programPlanId, data),
    onSuccess: () =>
      toast.success({
        description: t('task:import.success'),
      }),
    onError: (err: AxiosError) => {
      toast.danger({
        description: err?.message || t('task:import.error'),
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['list-task'],
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

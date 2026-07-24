import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'

import { importTargetAdjustment } from '../services/target-adjustment.service'

type ModalImportErrors = { [key: string]: string[] }

export const useImportTargetAdjustment = (programPlanId: number) => {
  const { t } = useTranslation(['bmhpApproval'])
  const queryClient = useQueryClient()

  const [showImportModal, setShowImportModal] = useState<boolean>(false)
  const [listOfImportErrors, setListOfImportErrors] =
    useState<ModalImportErrors | null>(null)

  const { mutate: mutateImport, isPending } = useMutation({
    mutationKey: ['import-target-adjustment', programPlanId],
    mutationFn: (data: FormData) => importTargetAdjustment(programPlanId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['bmhp-target-adjustment'],
      })
      setShowImportModal(false)
      setListOfImportErrors(null)
      toast.success({
        title: t('bmhpApproval:target_adjustment.mutations.import_success_title'),
        description: t('bmhpApproval:target_adjustment.mutations.import_success_desc'),
      })
    },
    onError: (err: AxiosError) => {
      const { message, errors } = err.response?.data as {
        message: string
        errors?: ModalImportErrors
      }
      if (errors) {
        toast.danger({ description: message })
        setListOfImportErrors(errors)
      } else {
        toast.danger({ description: message })
      }
    },
  })

  useSetLoadingPopupStore(isPending)

  return {
    showImportModal,
    setShowImportModal,
    mutateImport,
    listOfImportErrors,
    setListOfImportErrors,
  }
}

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'

import { importAnnualPlanningTargetGroup } from '../../services/annual-planning-target-group.services'

type ModalImportErrors = { [key: string]: string[] }

export const useAnnualPlanningTargetGroupListImport = () => {
  const [showImportModal, setShowImportModal] = useState<boolean>(false)
  const [listOfImportErrors, setListOfImportErrors] = useState<{
    [key: string]: string[]
  } | null>(null)
  const { t } = useTranslation(['common', 'annualPlanningTargetGroup'])
  const queryClient = useQueryClient()
  const { mutate: mutateImport, isPending } = useMutation({
    mutationKey: ['import-list-annual-planning-target-group'],
    mutationFn: importAnnualPlanningTargetGroup,
    onSuccess: () => {
      toast.success({
        description: t('annualPlanningTargetGroup:message.import_success'),
      })
      queryClient.invalidateQueries({ queryKey: ['entities'] })
    },
    onError: (err: AxiosError) => {
      const { message, errors } = err.response?.data as {
        message: string
        errors?: ModalImportErrors
      }

      if (errors) {
        toast.danger({ description: message })
        setListOfImportErrors(errors)
      }
    },
  })

  useSetLoadingPopupStore(isPending)

  return {
    mutateImport,
    showImportModal,
    setShowImportModal,
    listOfImportErrors,
    setListOfImportErrors,
  }
}

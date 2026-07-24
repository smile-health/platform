import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'

import { importAnnualPlanningSubstitution } from '../../services/annual-planning-substitution.services'

type ModalImportErrors = { [key: string]: string[] }

export const useAnnualPlanningSubstitutionListImport = () => {
  const router = useSmileRouter()
  const { id: programPlanId } = router.query
  const [showImportModal, setShowImportModal] = useState<boolean>(false)
  const [listOfImportErrors, setListOfImportErrors] = useState<{
    [key: string]: string[]
  } | null>(null)
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'annualPlanningSubstitution'])
  const queryClient = useQueryClient()
  const { mutate: mutateImport, isPending } = useMutation({
    mutationKey: ['import-list-annual-planning-substitution', programPlanId],
    mutationFn: async (data: FormData) =>
      importAnnualPlanningSubstitution(Number(programPlanId), data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['list-annual-planning-substitution'],
      })
      await queryClient.invalidateQueries({
        queryKey: ['detail-program-plan', language, programPlanId],
      })
      setShowImportModal(false)
      setListOfImportErrors(null)
      toast.success({
        description: t('annualPlanningSubstitution:toast.import_success'),
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

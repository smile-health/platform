import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { importPatientBulk } from '#services/patient'
import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'

type ModalImportErrors = { [key: string]: string[] }

export default function useImportPatient() {
  const { t } = useTranslation(['common', 'patient'])
  const [showImport, setShowImport] = useState(false)
  const [modalImportErrors, setModalImportErrors] = useState<{
    open: boolean
    errors?: ModalImportErrors
  }>({ open: false, errors: undefined })

  const queryClient = useQueryClient()

  const { mutate: handleImport, isPending: isPendingImport } = useMutation({
    mutationFn: (data: FormData) => importPatientBulk(data),
    onSuccess: () =>
      toast.success({
        description: t('patient:toast.import.success'),
      }),
    onError: (err: AxiosError) => {
      const { errors } = err.response?.data as {
        errors?: ModalImportErrors | string
      }

      if (
        errors &&
        typeof errors === 'object' &&
        Object.hasOwn(errors, 'general')
      ) {
        toast.danger({ description: errors?.general[0] })
      } else if (typeof errors === 'string')
        toast.danger({ description: errors })
      else setModalImportErrors({ open: true, errors })
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['patient-bulk'],
      })
    },
  })

  const handleSeeMore = (notes: ModalImportErrors) => {
    setModalImportErrors({ open: true, errors: notes })
  }

  useSetLoadingPopupStore(isPendingImport)

  return {
    modalImportErrors,
    showImport,
    setShowImport,
    setModalImportErrors,
    handleImport,
    handleSeeMore,
  }
}

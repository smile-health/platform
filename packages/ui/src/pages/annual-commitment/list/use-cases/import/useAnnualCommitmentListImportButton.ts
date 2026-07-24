import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'

import { ModalImportErrors } from '../../../../activity/activity.type'
import { importAnnualCommitments } from '../../annual-commitment-list.service'

type TModalImport = {
  type: 'import' | 'error' | null
  errors?: Record<string, string[]>
}

const useAnnualCommitmentListImport = () => {
  const { t } = useTranslation(['common', 'annualCommitmentList'])
  const queryClient = useQueryClient()

  const [modalImport, setModalImport] = useState<TModalImport>({
    type: null,
  })
  const [modalImportErrors, setModalImportErrors] = useState<{
    open: boolean
    errors?: ModalImportErrors
  }>({ open: false, errors: undefined })

  const showModal = (
    type: 'import' | 'error',
    errors?: Record<string, string[]>
  ) => {
    setModalImport({ type, errors })
  }

  const hideModal = () => {
    setModalImport({ type: null })
  }

  const { mutate: onImport, ...importMutation } = useMutation({
    mutationFn: (data: FormData) => importAnnualCommitments(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['annual-commitment-list'],
      })
      toast.success({
        description: t('common:message.success.add', {
          type: t('annualCommitmentList:title').toLowerCase(),
        }),
      })
    },
    onError: (error: AxiosError) => {
      const { message, errors } = error.response?.data as {
        message: string
        errors?: TModalImport['errors']
      }

      if (
        !errors ||
        error?.response?.status === 500 ||
        errors?.hasOwnProperty('general')
      ) {
        const errMsg = errors?.general?.[0] ?? message
        toast.danger({
          description:
            errMsg ||
            t('common:message.failed.add', {
              type: t('annualCommitmentList:title').toLowerCase(),
            }),
        })
      } else {
        setModalImportErrors({ open: true, errors })
      }
    },
  })

  useSetLoadingPopupStore(importMutation?.isPending)

  return {
    modalImport,
    showModal,
    hideModal,
    onImport,
    importMutation,
    modalImportErrors,
    setModalImportErrors,
  }
}

export default useAnnualCommitmentListImport

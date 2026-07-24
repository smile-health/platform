import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { queryClient } from '#provider/query-client'
import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'

import { importMonitoringDeviceInventoryList } from '../../monitoring-device-inventory-list.service'

type ModalImportErrors = { [key: string]: string[] }

export const useListImport = () => {
  const { t } = useTranslation(['common', 'monitoringDeviceInventoryList'])

  const [showModal, setShowModal] = useState(false)
  const [errors, setErrors] = useState<ModalImportErrors | null>(null)

  const importMutation = useMutation({
    mutationFn: importMonitoringDeviceInventoryList,
    onSuccess: () => {
      toast.success({
        description: t('monitoringDeviceInventoryList:message.import_success'),
      })
      queryClient.invalidateQueries({ queryKey: ['entities'] })
    },
    onError: (err: AxiosError) => {
      const { message, errors } = err.response?.data as {
        message: string
        errors?: ModalImportErrors
      }

      if (!errors || (errors && Object.hasOwn(errors, 'general')))
        toast.danger({ description: errors?.general[0] ?? message })
      else setErrors(errors)
    },
  })

  return {
    execute: importMutation.mutate,
    isLoading: importMutation.isPending,
    errors,
    modal: {
      show: showModal,
      set: setShowModal,
    },
  }
}

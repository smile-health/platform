import { useMutation } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { templatePatientBulk } from '#services/patient'
import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'

export default function useDownloadTemplatePatient() {
  const { t } = useTranslation(['common', 'patient'])
  const {
    mutate: handleDownloadTemplate,
    isPending: isPendingDownloadTemplate,
  } = useMutation({
    mutationFn: () => templatePatientBulk(),
    onSuccess: () => {
      toast.success({ description: t('patient:toast.download.success') })
    },
    onError: (err: AxiosError) => {
      const { message } = err.response?.data as { message: string }

      toast.danger({ description: message || t('message.common.error') })
    },
  })

  useSetLoadingPopupStore(isPendingDownloadTemplate)

  return { handleDownloadTemplate }
}

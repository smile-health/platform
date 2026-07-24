import { useMutation } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { getTemplatePopulation } from '#services/population'
import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'

export default function useDownloadTemplatePopulation() {
  const { t } = useTranslation(['common', 'population'])
  const {
    mutate: handleDownloadTemplate,
    isPending: isPendingDownloadTemplate,
  } = useMutation({
    mutationFn: () => getTemplatePopulation(),
    onSuccess: () => {
      toast.success({ description: t('population:toast.download.success') })
    },
    onError: (err: AxiosError) => {
      const { message } = err.response?.data as { message: string }

      toast.danger({ description: message || t('message.common.error') })
    },
  })

  useSetLoadingPopupStore(isPendingDownloadTemplate)

  return { handleDownloadTemplate }
}

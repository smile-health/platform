import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { ListManufacturersParams } from '#services/manufacturer'
import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'

import {
  downloadTemplateManufacturer,
  exportManufacturer,
  importManufacturer,
} from '../manufacturer.service'

type TModalImport = {
  type: 'import' | 'error' | null
  errors?: Record<string, string[]>
}

export default function useManufacturerFileManager(
  filter: ListManufacturersParams
) {
  const { t } = useTranslation(['manufacturer', 'common'])
  const queryClient = useQueryClient()
  const [modalImport, setModalImport] = useState<TModalImport>({
    type: null,
  })

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
    mutationFn: (data: FormData) => importManufacturer(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['manufacturers'],
      })
      toast.success({
        description: t('common:message.success.add', {
          type: t('manufacturer:title.manufacturer').toLowerCase(),
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
              type: t('manufacturer:title.manufacturer').toLowerCase(),
            }),
        })
      } else {
        showModal('error', errors)
      }
    },
  })

  const downloadQuery = useQuery({
    queryKey: ['manufacturer-template'],
    queryFn: downloadTemplateManufacturer,
    enabled: false,
  })

  const exportQuery = useQuery({
    queryKey: ['manufacturer-export', filter],
    queryFn: () => exportManufacturer(filter),
    enabled: false,
  })

  const isImportLoading = importMutation?.isPending
  const isExportLoading = exportQuery?.isLoading || exportQuery?.isFetching
  const isDownloadTemplateLoading =
    downloadQuery?.isLoading || downloadQuery?.isFetching

  useSetLoadingPopupStore(
    isImportLoading || isExportLoading || isDownloadTemplateLoading
  )

  return {
    import: {
      modalImport,
      showModal,
      hideModal,
      onImport,
    },
    onDownloadTemplate: () => downloadQuery.refetch(),
    onExport: () => exportQuery.refetch(),
  }
}

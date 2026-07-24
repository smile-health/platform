import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { AxiosError } from 'axios'
import { Values } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { handleFilterParams } from '../user.helper'
import { downloadTemplateUser, exportUser, importUser } from '../user.service'

type TModalImport = {
  type: 'import' | 'error' | null
  errors?: Record<string, string[]>
}

export default function useUserFileManager(query: Values<Record<string, any>>) {
  const { t } = useTranslation(['user', 'common'])
  const queryClient = useQueryClient()
  const [modalImport, setModalImport] = useState<TModalImport>({
    type: null,
  })

  const currentFilter = handleFilterParams(query)

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
    mutationFn: (data: FormData) => importUser(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['users'],
      })
      toast.success({
        description: t('common:message.success.add', {
          type: t('user:title.user'),
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
              type: t('user:title.user'),
            }),
        })
      } else {
        showModal('error', errors)
      }
    },
  })

  const downloadQuery = useQuery({
    queryKey: ['user-template'],
    queryFn: downloadTemplateUser,
    enabled: false,
  })

  const exportQuery = useQuery({
    queryKey: ['user-export', currentFilter],
    queryFn: () => exportUser(currentFilter),
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

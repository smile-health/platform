import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { ErrorResponse } from '#types/common'
import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'

type TChangeStatusState = {
  id?: number
  status?: number
  show: boolean
}

type ParamData = {
  id: string
  status: number
}

type TUseChangeStatus<T> = {
  titlePage: string
  validateQueryKey: string
  queryFn: (id: string, status: number) => Promise<T>
  onSuccess?: VoidFunction
}

export default function useChangeStatus<T>({
  titlePage,
  validateQueryKey,
  queryFn,
  onSuccess,
}: TUseChangeStatus<T>) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [changeStatusState, setChangeStatusState] =
    useState<TChangeStatusState>({
      show: false,
    })

  const handleResetChangeStatusState = (show: boolean) => {
    setChangeStatusState({
      show,
    })
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ParamData) => queryFn(data?.id, data?.status),
    onSuccess: async () => {
      onSuccess && onSuccess()
      await queryClient.invalidateQueries({
        queryKey: [validateQueryKey],
      })
      toast.success({
        description: t('message.success.update', {
          type: titlePage?.toLowerCase(),
        }),
      })
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const response = error.response?.data as ErrorResponse
        toast.danger({
          description: response.message || t('message.common.error'),
        })
      }
    },
  })

  const onChangeStatus = () => {
    const { id, status } = changeStatusState

    if (id && typeof status === 'number') {
      mutate({
        id: String(changeStatusState?.id),
        status: changeStatusState?.status ? 0 : 1,
      })
    }
  }

  return {
    onChangeStatus,
    isLoading: isPending,
    changeStatusState,
    setChangeStatusState,
    handleResetChangeStatusState,
  }
}

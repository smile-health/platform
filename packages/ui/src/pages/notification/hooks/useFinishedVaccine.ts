import { useMemo } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  keepPreviousData,
  useMutation,
  useQuery,
} from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import {
  getReasonFinishedVaccine,
  stopNotification,
} from '#services/notification'
import { ErrorResponse } from '#types/common'
import { PayloadStopNotification, StopNotificationResponse } from '#types/notification'
import { AxiosResponseWithStatusCode } from '#utils/api'
import { AxiosError } from 'axios'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { FinishedVaccineValues } from '../notification.types'
import { finishedVaccineSchema } from '../schemas/finishedVaccineSchema'

export const useFinishedVaccine = (isOpenModal: boolean) => {
  const { t } = useTranslation(['common', 'notification'])

  const { data: listReasonData, isLoading: isLoadingListReason } = useQuery({
    queryKey: ['notification-reason'],
    queryFn: () => getReasonFinishedVaccine(),
    placeholderData: keepPreviousData,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: isOpenModal,
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    setError,
  } = useForm<FinishedVaccineValues>({
    resolver: yupResolver(finishedVaccineSchema(t)),
    mode: 'onBlur',
  })

  const {
    mutate: handleStopNotification,
    isPending: isPendingStopNotification,
  } = useMutation<
    AxiosResponseWithStatusCode<StopNotificationResponse>,
    AxiosError<ErrorResponse>,
    PayloadStopNotification & { programId: number }
  >({
    mutationFn: (payload: PayloadStopNotification & { programId: number }) => {
      const { programId, ...otherPayload } = payload
      const defaultResponseSuccess = {
        status: 'success',
        message: t('notification:finishedVaccine.success'),
      }

      return stopNotification(programId, otherPayload, defaultResponseSuccess)
    },
    onSuccess: (response) => {
      toast.success({
        description: response.message,
      })
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const response = error.response?.data as ErrorResponse
        toast.danger({ description: response.message })
      } else {
        toast.danger({
          description: t('notification:finishedVaccine.error'),
        })
      }
    },
  })

  const reasons = useMemo(() => {
    return (
      listReasonData?.data.map((item) => ({
        value: item.id,
        label: item.title,
      })) ?? []
    )
  }, [listReasonData])

  useSetLoadingPopupStore(isPendingStopNotification)

  return {
    register,
    handleSubmit,
    stopNotification: handleStopNotification,
    errors,
    setError,
    setValue,
    watch,
    reset,
    reasons,
    isLoadingListReason,
  }
}

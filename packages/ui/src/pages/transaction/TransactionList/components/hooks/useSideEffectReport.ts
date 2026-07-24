import { yupResolver } from '@hookform/resolvers/yup'
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { ErrorResponse } from '#types/common'
import { AxiosError } from 'axios'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { addSideEffect, listReactions } from '../../../transaction.services'
import { schemaSideEffect } from '../../helpers/transaction-list.schema'
import { SideEffectFormValues } from '../../helpers/transaction-list.types'

type TUseSideEffectReport = {
  isOpenModal: boolean
  actualTransactionDate: string
}

export const useSideEffectReport = ({
  isOpenModal,
  actualTransactionDate,
}: TUseSideEffectReport) => {
  const { t } = useTranslation(['common', 'transactionList'])

  const { data: listReactionData, isLoading: isLoadingListReaction } = useQuery(
    {
      queryKey: ['reactions'],
      queryFn: () => listReactions(),
      placeholderData: keepPreviousData,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      enabled: isOpenModal,
    }
  )

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<SideEffectFormValues>({
    resolver: yupResolver(schemaSideEffect({ t, actualTransactionDate })),
    mode: 'onBlur',
  })
  const queryClient = useQueryClient()

  const { mutate: handleAddSideEffect, isPending: isPendingAddSideEffect } =
    useMutation({
      mutationFn: ({
        consumptionId,
        data,
      }: {
        consumptionId: number
        data: SideEffectFormValues
      }) => addSideEffect(consumptionId, data),
      onSuccess: () => {
        reset()
        queryClient.invalidateQueries({
          queryKey: ['detail-transaction'],
        })
        toast.success({
          description: t('transactionList:detail.side_effect.add.success'),
        })
      },
      onError: (error) => {
        if (error instanceof AxiosError) {
          const response = error.response?.data as ErrorResponse
          toast.danger({ description: response.message })
          for (const item of Object.keys(response?.errors ?? {})) {
            setError(item as keyof SideEffectFormValues, {
              message: response?.errors?.[item]?.[0],
            })
          }
        }
      },
    })

  useSetLoadingPopupStore(isPendingAddSideEffect)

  return {
    register,
    handleSubmit,
    addSideEffect: handleAddSideEffect,
    setError,
    errors,
    setValue,
    watch,
    reset,
    listReactionData,
    isLoadingListReaction,
  }
}

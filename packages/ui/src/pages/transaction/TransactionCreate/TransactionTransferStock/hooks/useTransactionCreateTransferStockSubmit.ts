import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { ErrorResponse } from '#types/common'
import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'

import { createTransferStock } from '../transaction-transfer-stock.services'
import {
  CreateTransactionTransferStock,
  CreateTransactionTransferStockBody,
  CreateTransactionTransferStockMaterial,
} from '../transaction-transfer-stock.type'

export default function useTransactionCreateTransferStockSubmit() {
  const { t } = useTranslation('transactionCreate')
  const router = useSmileRouter()

  const [showModalNeedRelation, setShowModalNeedRelation] = useState(false)
  const [needRelationData, setNeedRelationData] = useState({
    header: '',
    message: '',
    list: [] as string[],
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (data: CreateTransactionTransferStockBody) =>
      createTransferStock(data),
    onSuccess: () => {
      toast.success({
        description: t('transaction_transfer_stock.toast.success.create'),
      })
      router.push('/v5/transaction')
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const responseData = error.response?.data as ErrorResponse
        const errors = responseData?.errors as unknown as Record<string, unknown>

        if (errors?.need_relation === true) {
          toast.danger({ description: responseData?.message })
          setNeedRelationData({
            header: errors.header as string,
            message: errors.message as string,
            list: errors.list as string[],
          })
          setShowModalNeedRelation(true)
          return
        }

        toast.danger({ description: responseData.message })
      }
    },
  })

  const submitTransferStock = ({
    formData,
  }: {
    formData: CreateTransactionTransferStock
  }) => {
    const { items } = formData
    const materials: CreateTransactionTransferStockMaterial[] = (
      items as CreateTransactionTransferStock['items']
    )?.flatMap((item) => {
      return item.batches
        ?.filter((itemBatch) => !!itemBatch?.change_qty)
        .map((itemBatch) => {
          return {
            material_id: item.material_id,
            stock_id: itemBatch?.batch_id ?? null,
            companion_activity_id: item.destination_activity?.value,
            qty: Number(itemBatch.change_qty),
          }
        })
    })
    const data: CreateTransactionTransferStockBody = {
      entity_id: formData.entity?.value,
      companion_program_id: formData?.destination_program_id,
      materials: materials,
      is_acknowledged: true
    }
    mutate(data)
  }
  useSetLoadingPopupStore(isPending)
  return {
    submitTransferStock,
    showModalNeedRelation,
    setShowModalNeedRelation,
    needRelationData,
  }
}

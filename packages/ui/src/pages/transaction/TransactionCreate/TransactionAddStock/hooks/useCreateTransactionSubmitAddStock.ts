import { useMutation } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'

import { ApiErrorResponse, CreateTransctionForm } from '../../transaction-create.type'
import { createAddStock } from '../transaction-add-stock.service'
import {
  CreateTransactionAddStock,
  CreateTransactionAddStockBody,
  CreateTransactionAddStockMaterial,
} from '../transaction-add-stock.type'
import { parseDateTime } from '#utils/date'
import { extractErrorMessage } from '../../utils/helper'

export const useCreateTransactionSubmitAddStock = () => {
  const { t } = useTranslation('transactionCreateAddStock')
  const router = useSmileRouter()


  const { mutate, isPending } = useMutation({
    mutationFn: (data: CreateTransactionAddStockBody) => createAddStock(data),
    onSuccess: () => {
      toast.success({
        description: t('toast.success.create'),
      })
      router.push('/v5/transaction')
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const res = error.response?.data as ApiErrorResponse;
        const message = extractErrorMessage(res);
        toast.danger({ description: message });
      }
    },
  })

  const submitAddStock = ({ formData }: { formData: CreateTransctionForm }) => {
    const { items } = formData
    const materials: CreateTransactionAddStockMaterial[] = (
      items as CreateTransactionAddStock['items']
    )?.flatMap((item) => {
      return item.batches
        ?.filter(
          (itemBatch) =>
            !!itemBatch?.change_qty
        )
        .map((itemBatch) => {
          const batch = itemBatch?.batch_id
            ? null
            : {
                code: itemBatch.code,
                expired_date: itemBatch.expired_date
                  ? parseDateTime(itemBatch.expired_date, 'YYYY-MM-DD')
                  : null,
                production_date: itemBatch.production_date
                  ? parseDateTime(itemBatch.production_date, 'YYYY-MM-DD')
                  : null,
                manufacture_id: itemBatch?.manufacturer?.value,
              }

          return {
            material_id: item.material_id,
            transaction_reason_id: itemBatch.transaction_reason?.value?.id,
            other_reason: itemBatch.other_reason,
          stock_id: itemBatch?.batch_id ?? null,
            qty: Number(itemBatch.change_qty),
            batch: item.managed_in_batch ? batch : null,
            stock_quality_id: itemBatch?.status_material?.value,
            budget_source_id: itemBatch?.budget_source?.value,
            total_price: itemBatch?.budget_source_price,
            year: itemBatch?.budget_source_year?.value,
          }
        })
    })
    const data: CreateTransactionAddStockBody = {
      entity_id: formData.entity?.value,
      activity_id: formData.activity?.value,
      entity_activity_id: formData?.entity_activity_id,
      materials: materials,
    }
    mutate(data)
  }
  useSetLoadingPopupStore(isPending)
  return {
    submitAddStock,
  }
}

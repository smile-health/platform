import { useMutation, useQuery } from '@tanstack/react-query'
import useSmileRouter from '#hooks/useSmileRouter'
import { listStock } from '#services/stock'
import { useLoadingPopupStore } from '#store/loading.store'
import { AxiosError } from 'axios'
import { UseFormSetError } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { toast } from '../../../../components/toast/Toast'
import { createOrder, createOrderBody } from '../order-create.service'
import { TOrderCreateForm } from '../order-create.type'
import { handleOrderErrors } from '../utils/orderCreateErrorHandler'

export default function useOrderCreateStocks(
  setError: UseFormSetError<TOrderCreateForm>,
  entity_id?: number,
  activity_id?: number,
  keyword?: string
) {
  const { t } = useTranslation(['orderCreate', 'common'])
  const router = useSmileRouter()
  const { setLoadingPopup } = useLoadingPopupStore()

  const payload = {
    keyword,
    entity_id,
    activity_id,
    page: '1',
    paginate: '10',
    only_have_qty: '1',
  }
  const { data: stocks, isLoading } = useQuery({
    queryFn: () => listStock(payload),
    queryKey: ['order-stocks', entity_id, activity_id, keyword],
    enabled: false,
  })

  const { mutate: mutateOrder, isPending: isPendingMutateOrder } = useMutation({
    onMutate: () => setLoadingPopup(true),
    mutationFn: (data: createOrderBody) => createOrder(data),
    onSettled: () => setLoadingPopup(false),
    onSuccess: async (response) => {
      toast.success({
        description: t('common:message.success.create', {
          type: t('orderCreate:title.new_order').toLowerCase(),
        }),
      })
      router.push(`/v5/order/${response.createdOrderId}`)
    },
    onError: (error: AxiosError) => {
      setLoadingPopup(false)
      handleOrderErrors(error, setError)
    },
  })

  return { stocks, isLoading, mutateOrder, isPendingMutateOrder }
}

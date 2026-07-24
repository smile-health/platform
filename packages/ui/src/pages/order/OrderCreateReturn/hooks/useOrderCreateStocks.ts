import { useMutation, useQuery } from '@tanstack/react-query'
import useSmileRouter from '#hooks/useSmileRouter'
import { listStock } from '#services/stock'
import { useLoadingPopupStore } from '#store/loading.store'
import { AxiosError } from 'axios'
import { UseFormSetError } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { toast } from '../../../../components/toast/Toast'
import {
  createOrderBody,
  createOrderReturn,
} from '../order-create-return.service'
import { TOrderCreateReturnForm } from '../order-create-return.type'
import {
  handleOrderErrors,
  NeedRelationPayload,
} from '../utils/order-create-error-handler'

export default function useOrderCreateStocks(
  setError: UseFormSetError<TOrderCreateReturnForm>,
  entity_id?: number,
  activity_id?: number,
  keyword?: string,
  onNeedRelation?: (payload: NeedRelationPayload) => void
) {
  const { t } = useTranslation(['orderCreateReturn', 'common'])
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
    mutationFn: (data: createOrderBody) => createOrderReturn(data),
    onSettled: () => setLoadingPopup(false),
    onSuccess: (response) => {
      toast.success({
        description: t('common:message.success.create', {
          type: t('orderCreateReturn:title.new_return'),
        }),
      })
      router.push(`/v5/order/${response.id}`)
    },
    onError: (error: AxiosError) => {
      setLoadingPopup(false)
      handleOrderErrors(error, setError, onNeedRelation)
    },
  })

  return { stocks, isLoading, mutateOrder, isPendingMutateOrder }
}

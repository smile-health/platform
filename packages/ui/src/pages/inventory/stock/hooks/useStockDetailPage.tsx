import { useSetLoadingPopupStore } from "#hooks/useSetLoading"
import { listStock } from "#services/stock"
import { Stock } from "#types/stock"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

export const useStockDetailPage = () => {
  const [currentStock, setCurrentStock] = useState<Stock | undefined>(undefined)
  const { t } = useTranslation('stock')
  const { query } = useRouter()
  const {
    entity_id,
    material_id,
    batch_ids,
    expired_end_date,
    expired_start_date,
    activity_id,
  } = query as { [key: string]: string }

  const { isFetching: IsFetchingStock, data: dataStock, isSuccess } = useQuery({
    queryKey: ['stock-detail', entity_id, material_id],
    queryFn: () => {
      const params = {
        entity_id: Number(entity_id),
        with_details: 1,
        material_id,
        page: '1',
        paginate: '10',
        ...batch_ids && { batch_ids },
        ...expired_start_date && { expired_start_date },
        ...expired_end_date && { expired_end_date },
        ...activity_id && { activity_id: Number(activity_id) },
      }

      return listStock(params)
    },
    enabled: !!entity_id && !!material_id,
    staleTime: 0,
  })

  useEffect(() => {
    if (isSuccess) setCurrentStock(dataStock?.data[0])
  }, [isSuccess])

  useSetLoadingPopupStore(IsFetchingStock)

  return {
    t,
    dataStock: currentStock,
  }
}
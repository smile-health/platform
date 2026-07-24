import { useQuery } from '@tanstack/react-query'
import { listEntityActivitiesDate } from '#services/entity'

export default function useEntityActivites(id?: string | number, source?: string ) {
  const { data, isLoading, isFetching } = useQuery({
    queryFn: () => {
      if (!id) return []

      return listEntityActivitiesDate(id, {
        is_ongoing: 1,
        ...(source === 'distribution' || source === 'central_distribution' ? {  is_ordered_sales : 1} : {is_ordered_purchase: 0})
      })
    },
    queryKey: ['order-entity-activities', id],
    enabled: !!id,
    select: (res) => {
      return res?.map((data) => ({
        label: data?.name,
        value: data?.id,
      }))
    },
  })

  return {
    data,
    isLoading: isLoading || isFetching,
  }
}

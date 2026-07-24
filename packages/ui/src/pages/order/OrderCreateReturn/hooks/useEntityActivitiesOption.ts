import { useQuery } from '@tanstack/react-query'

import { listEntityActivities } from '../order-create-return.service'

export default function useEntityActivitesOption(id: string) {
  const payload = { id, params: { is_ordered_purchase: 1, is_ongoing: 1 } }
  const { data: entityActivities } = useQuery({
    queryFn: () => listEntityActivities(payload),
    queryKey: ['order-entity-activities', id],
    enabled: !!id,
    select: (res) => {
      const typeData = res?.map((data) => ({
        label: data?.name,
        value: data?.id,
        entity_activity_id: data?.entity_activity_id,
      }))

      return typeData
    },
  })

  return entityActivities || []
}

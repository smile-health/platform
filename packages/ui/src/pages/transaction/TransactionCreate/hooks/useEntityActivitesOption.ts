import { useQuery } from '@tanstack/react-query'
import { TDetailActivityDate } from '#types/entity'

import { listEntityActivities } from '../transaction-create.service'

export default function useEntityActivitesOption(id: string) {
  const payload = { id, params: { is_ongoing: 1 } }
  const { data: entityActivities } = useQuery({
    queryFn: () => listEntityActivities(payload),
    queryKey: ['transaction-entity-activities', id],
    enabled : !!id,
    select: (res) => {
      const typeData = res?.map((type: TDetailActivityDate) => ({
        label: type?.name,
        value: type?.id,
        entity_activity_id: type?.entity_activity_id
      }))

      return typeData
    },
  })

  return entityActivities || []
}

import { useQuery } from '@tanstack/react-query'

import { exportActivity } from '../activity.service'
import { ExportActivitiesParams } from '../activity.type'

export const useActivityExport = ({ keyword }: ExportActivitiesParams) => {
  const exportQuery = useQuery({
    queryKey: ['activity-export', keyword],
    queryFn: () => exportActivity({ keyword }),
    enabled: false,
  })

  return { exportQuery }
}

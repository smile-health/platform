import { useQuery } from '@tanstack/react-query'

import { downloadTemplateActivity } from '../activity.service'

export const useActivityDownload = () => {
  const downloadQuery = useQuery({
    queryKey: ['activity-template'],
    queryFn: downloadTemplateActivity,
    enabled: false,
  })

  return { downloadQuery }
}

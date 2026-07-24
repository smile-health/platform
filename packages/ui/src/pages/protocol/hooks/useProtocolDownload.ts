import { useQuery } from '@tanstack/react-query'

import { downloadTemplateProtocol } from '../protocol.service'

export const useProtocolDownload = () => {
  const downloadQuery = useQuery({
    queryKey: ['entity-template'],
    queryFn: downloadTemplateProtocol,
    enabled: false,
  })

  return { downloadQuery }
}

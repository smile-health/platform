import { useQuery } from '@tanstack/react-query'

import { exportProtocol } from '../protocol.service'
import { ExportProtocolsParams } from '../protocol.type'

export const useProtocolExport = ({ keyword }: ExportProtocolsParams) => {
  const exportQuery = useQuery({
    queryKey: ['protocol-export', keyword],
    queryFn: () => exportProtocol({ keyword }),
    enabled: false,
  })

  return { exportQuery }
}

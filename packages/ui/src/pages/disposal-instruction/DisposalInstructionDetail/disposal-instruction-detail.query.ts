import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { getDisposalInstructionDetail } from './disposal-instruction-detail.service'

export const useDisposalInstructionDetailQuery = (id: string) => {
  const { i18n } = useTranslation()

  const query = useQuery({
    queryKey: [i18n.language, 'disposal-instruction', 'detail', id],
    queryFn: () => getDisposalInstructionDetail(id),
    enabled: Boolean(id),
  })

  return query
}

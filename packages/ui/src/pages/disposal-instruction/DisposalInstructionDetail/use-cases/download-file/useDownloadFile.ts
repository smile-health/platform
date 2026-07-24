import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { downloadHandoverReportLetter } from './download-file.service'

export const useDownloadFile = () => {
  const { i18n } = useTranslation()
  const params = useParams()
  const disposalInstructionId = params.id as string

  const downloadHandoverReportLetterQuery = useQuery({
    queryKey: [
      i18n.language,
      'disposal-instruction',
      'detail',
      'download-handover-report-letter',
    ],
    queryFn: () => downloadHandoverReportLetter(Number(disposalInstructionId)),
    enabled: false,
  })

  return {
    handoverReportLetter: {
      query: downloadHandoverReportLetterQuery,
      isLoading:
        downloadHandoverReportLetterQuery.isLoading ||
        downloadHandoverReportLetterQuery.isFetching,
      download: () => downloadHandoverReportLetterQuery.refetch(),
    },
  }
}

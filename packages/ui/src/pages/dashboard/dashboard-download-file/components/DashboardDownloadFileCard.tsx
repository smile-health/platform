import { useQuery } from '@tanstack/react-query'
import { Button } from '#components/button'
import { H5 } from '#components/heading'
import Download from '#components/icons/Download'
import { parseDateTime } from '#utils/date'
import { useTranslation } from 'react-i18next'

import { downloadFile } from '../dashboard-download-file.service'

type Props = Readonly<{
  title: string
  code: number
  updated_at: string
}>

export default function DashboardDownloadFileCard(props: Props) {
  const { title, code, updated_at } = props
  const { t } = useTranslation('dashboardDownload')

  const { isLoading, isFetching, refetch } = useQuery({
    queryKey: ['download-file', code],
    queryFn: () => downloadFile(code),
    enabled: false,
  })

  return (
    <div className="ui-flex ui-justify-between ui-items-center ui-gap-2 ui-p-4 ui-rounded ui-border ui-border-neutral-300">
      <div className="ui-space-y-0.5">
        <H5>{title || '-'}</H5>
        <p className="ui-flex ui-item-center ui-gap-2 ui-text-gray-500 ui-text-[15px]">
          <span>{t('last_updated')}:</span>
          <span>{parseDateTime(updated_at)}</span>
        </p>
      </div>
      <Button
        data-testid={`btn-export-${code}`}
        variant="outline"
        type="button"
        onClick={() => refetch()}
        disabled={isLoading || isFetching}
        leftIcon={<Download className="ui-size-5" />}
      >
        {t('download')}
      </Button>
    </div>
  )
}

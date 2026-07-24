import React from 'react'
import { Badge } from '#components/badge'
import { Button } from '#components/button'
import { Exists } from '#components/exists'
import Download from '#components/icons/Download'
import ExcelFile from '#components/icons/ExcelFile'
import { Color } from '#types/component'
import { parseDateTime } from '#utils/date'
import { useTranslation } from 'react-i18next'

import { STATUS } from '../export-history-list.constant'
import { TDataExportHistory } from '../exrport-history-list.type'

const ListExportFile = ({
  index,
  item,
  downloadFile,
}: {
  index: number
  item: TDataExportHistory
  downloadFile: (originalFileName: string, fileName: string) => void
}) => {
  const {
    t,
    i18n: { language },
  } = useTranslation('exportHistory')
  const LabelStatus = (val: string) => {
    let color: Color = 'neutral'
    switch (val) {
      case STATUS.FAILED:
        color = 'danger'
        break
      case STATUS.SUCCESS:
        color = 'success'
        break
      case STATUS.IN_PROGRESS:
        color = 'secondary'
        break
      case STATUS.IN_QUEUE:
        color = 'info'
        break
      case STATUS.DONE:
        color = 'success'
        break
      default:
        color = 'neutral'
        break
    }
    return color
  }
  return (
    <div
      className="ui-w-full ui-h-28 ui-bg-white ui-rounded ui-border ui-border-gray-300"
      key={`item-history-file-${index.toString()}`}
    >
      <div className="ui-flex ui-pl-5 ui-py-5">
        <div className="ui-flex ui-flex-row ui-space-x-5 ui-w-4/5">
          <div>
            <ExcelFile />
          </div>
          <div className="ui-flex ui-flex-col ui-space-y-4">
            <div className="ui-flex ui-flex-col ui-space-y-2">
              <div className="ui-text-dark-blue ui-text-sm ui-font-bold">
                {item?.filename ?? '-'}
              </div>
              <div className="ui-text-xs ui-text-neutral-500">
                {t('filter.request_date.label')}:{' '}
                {parseDateTime(item?.created_at, 'DD MMM YYYY HH:mm', language)}
              </div>
            </div>
            <div className="ui-flex ui-gap-2">
              <Badge
                variant="light"
                color={LabelStatus(item?.status)}
                size="sm"
                rounded="xl"
              >
                {item?.status_label ?? '-'}
              </Badge>
              <span className="ui-h-full ui-w-px ui-bg-neutral-300" />
              <div className="ui-text-xs ui-text-dark-blue ui-p-1">
                {item?.program?.name ?? 'Global'}
              </div>
            </div>
          </div>
        </div>
        <div className="ui-w-1/5 ui-flex ui-justify-end ui-pr-5">
          <Exists useIt={item?.status === STATUS.DONE && !!item?.download_url}>
            <Button
              id={`download-link-file-${index.toString()}`}
              size="sm"
              className="ui-w-[120px]"
              leftIcon={<Download />}
              variant="outline"
              onClick={() =>
                downloadFile(item?.original_filename, item?.filename)
              }
            >
              {t('download')}
            </Button>
          </Exists>
        </div>
      </div>
    </div>
  )
}

export default ListExportFile

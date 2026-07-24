import React, { FC } from 'react'
import TicketingSystemStatus from '#pages/ticketing-system/components/TicketingSystemStatus'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import { HistoryChangeStatus } from '../libs/ticketing-system-detail.type'

import 'dayjs/locale/id'
import 'dayjs/locale/en'

type TicketingSystemDetailStatusBoxProps = {
  historyData: HistoryChangeStatus
}
const TicketingSystemDetailStatusBox: FC<
  TicketingSystemDetailStatusBoxProps
> = ({ historyData }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation('common')

  if (!historyData) return null

  return (
    <div className="ui-flex ui-flex-col ui-items-center">
      <TicketingSystemStatus
        status={historyData?.status_id}
        label={historyData?.status_label}
      />
      <div className="ui-p-2 ui-bg-transparent ui-flex ui-flex-col ui-items-center ui-w-fit">
        <div className="ui-text-sm ui-font-normal ui-text-neutral-500 ui-cursor-default">
          {dayjs(historyData?.created_at)
            .locale(language)
            .format('DD MMM YYYY HH:mm')
            ?.toUpperCase()}
        </div>
        <div className="ui-text-sm ui-font-normal ui-text-dark-teal ui-cursor-default ui-text-center ui-w-56">
          {`${t('by')} ${historyData?.created_by?.firstname} ${historyData?.created_by?.lastname || ''}`}
        </div>
      </div>
    </div>
  )
}

export default TicketingSystemDetailStatusBox

import React, { useContext } from 'react'
import TicketingSystemDiffTime from '#pages/ticketing-system/components/TicketingSystemDiffTime'
import TicketingSystemReversedCountdown from '#pages/ticketing-system/components/TicketingSystemReversedCountdown'
import { TicketingSystemStatusEnum } from '#pages/ticketing-system/ticketing-system.constant'

import TicketingSystemDetailContext from '../libs/ticketing-system-detail.context'

const TicketingSystemDetailCardOrderResponseTime = () => {
  const { detail } = useContext(TicketingSystemDetailContext)
  if (
    detail?.status_id === TicketingSystemStatusEnum.ReportCompleted ||
    detail?.status_id === TicketingSystemStatusEnum.ReportCancelled
  ) {
    return (
      <TicketingSystemDiffTime
        startDate={detail?.created_at}
        endDate={detail?.updated_at}
      />
    )
  }

  return (
    <TicketingSystemReversedCountdown
      startDate={detail?.created_at as string}
    />
  )
}

export default TicketingSystemDetailCardOrderResponseTime

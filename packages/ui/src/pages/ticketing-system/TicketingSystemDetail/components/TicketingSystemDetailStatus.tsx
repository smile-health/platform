import React, { useContext, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import TicketingSystemDetailContext from '../libs/ticketing-system-detail.context'
import TicketingSystemCustomerCard from './TicketingSystemCustomerCard'
import TicketingSystemDetailCard from './TicketingSystemDetailCard'
import TicketingSystemDetailShowOrderDetail from './TicketingSystemDetailShowOrderDetail'
import TicketingSystemDetailStatusBox from './TicketingSystemDetailStatusBox'

const TicketingSystemDetailStatus = () => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { detail } = useContext(TicketingSystemDetailContext)
  const { t } = useTranslation(['ticketingSystemDetail', 'common'])

  useEffect(() => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
      }
    }, 100)
  }, [detail?.history_change_status?.length])

  return (
    <div className="ui-mb-6 ui-w-full ui-border ui-border-neutral-300 ui-rounded ui-p-6">
      <h2 className="ui-mb-6 ui-text-base ui-font-bold ui-text-dark-teal ui-cursor-default">
        {t('ticketingSystemDetail:ticket_status')}
      </h2>
      <div
        ref={scrollRef}
        className="status__ticketing ui-flex ui-justify-start ui-items-start ui-w-full ui-gap-10 ui-mb-6 ui-overflow-hidden hover:ui-overflow-auto"
      >
        {detail?.history_change_status?.map((item, index) => (
          <div className="ui-relative ui-w-auto" key={item.id}>
            <TicketingSystemDetailStatusBox historyData={item} />
            {index < detail?.history_change_status?.length - 1 && (
              <div className="ui-absolute ui-top-3 ui-right-0 -ui-mr-24 ui-w-56 ui-h-px ui-bg-zinc-300 -ui-z-10" />
            )}
          </div>
        ))}
      </div>
      <div className="ui-flex ui-justify-between ui-items-start ui-w-full ui-gap-6">
        <TicketingSystemCustomerCard />
        <TicketingSystemDetailCard />
      </div>
      {detail?.order_id ? (
        <div className="ui-flex ui-justify-end ui-items-center ui-w-full ui-mt-6">
          <TicketingSystemDetailShowOrderDetail />
        </div>
      ) : null}
    </div>
  )
}

export default TicketingSystemDetailStatus

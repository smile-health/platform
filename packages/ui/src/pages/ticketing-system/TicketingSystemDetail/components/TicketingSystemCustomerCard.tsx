import React, { useContext } from 'react'
import { RenderDetailValue } from '#components/modules/RenderDetailValue'
import { useTranslation } from 'react-i18next'

import TicketingSystemDetailContext from '../libs/ticketing-system-detail.context'

const TicketingSystemCustomerCard = () => {
  const { t } = useTranslation(['ticketingSystemDetail', 'common'])
  const { order, detail } = useContext(TicketingSystemDetailContext)
  return (
    <div className="border ui-rounded-md border-neutral-300 ui-p-6 ui-w-full bg-transparent">
      <h2 className="ui-mb-6 ui-text-base ui-font-bold ui-text-dark-teal ui-cursor-default">
        {t('ticketingSystemDetail:customer')}
      </h2>
      <RenderDetailValue
        className="ui-grid ui-grid-cols-[150px_1fr] ui-gap-x-2"
        showColon={false}
        data={[
          {
            label: `${t('ticketingSystemDetail:customer_name')} :`,
            value: order?.customer?.name ?? detail?.entity?.name ?? '-',
          },
          {
            label: `${t('ticketingSystemDetail:address')} :`,
            value: order?.customer?.address ?? detail?.entity?.address ?? '-',
          },
        ]}
      />
    </div>
  )
}

export default TicketingSystemCustomerCard

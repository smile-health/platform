import { useContext } from 'react'
import { RenderDetailValue } from '#components/modules/RenderDetailValue'
import { useTranslation } from 'react-i18next'

import TicketingSystemDetailContext from '../libs/ticketing-system-detail.context'
import TicketingSystemDetailCardOrderResponseTime from './TicketingSystemDetailCardLeadTime'

const TicketingSystemDetailCard = () => {
  const { t } = useTranslation(['ticketingSystemDetail', 'common'])
  const { detail, order } = useContext(TicketingSystemDetailContext)
  const detailData = [
    {
      label: t('ticketingSystemDetail:detail.do_number'),
      value: detail?.do_number ?? '-',
    },
    {
      label: t('ticketingSystemDetail:detail.reported_order_number'),
      value: detail?.order_id ?? '-',
    },
    {
      label: t('ticketingSystemDetail:detail.toal_lead_time'),
      value: <TicketingSystemDetailCardOrderResponseTime />,
    },
  ]

  if (order?.id)
    detailData.push({
      label: t(
        'ticketingSystemDetail:detail.customer_inquiries_to_cancel_the_order'
      ),
      value: order?.id ? t('common:yes') : t('common:no'),
    })

  return (
    <div className="ui-rounded-md ui-p-6 ui-w-full border border-neutral-300 bg-transparent">
      <h2 className="ui-mb-6 ui-text-base ui-font-bold ui-text-dark-teal ui-cursor-default">
        {t('ticketingSystemDetail:detail.title')}
      </h2>
      <RenderDetailValue
        className="ui-grid ui-grid-cols-[1fr_3px_250px] ui-gap-x-2"
        valuesClassName="ui-font-bold ui-text-dark-teal"
        data={detailData}
      />
    </div>
  )
}

export default TicketingSystemDetailCard

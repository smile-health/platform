import { useContext, useState } from 'react'
import { Button } from '#components/button'
import PaperIcon from '#components/icons/PaperIcon'
import TicketingSystemOrderDetailDrawer from '#pages/ticketing-system/components/TicketingSystemOrderDetailDrawer'
import { useTranslation } from 'react-i18next'

import TicketingSystemDetailContext from '../libs/ticketing-system-detail.context'

const TicketingSystemDetailShowOrderDetail = () => {
  const { t } = useTranslation(['ticketingSystemDetail', 'common'])
  const [showOrderDetail, setShowOrderDetail] = useState(false)
  const { order } = useContext(TicketingSystemDetailContext)
  return (
    <>
      <TicketingSystemOrderDetailDrawer
        open={showOrderDetail}
        onClose={() => setShowOrderDetail(false)}
        orderId={order?.id?.toString() as string}
      />
      <Button
        size="lg"
        variant="outline"
        type="button"
        className="ui-text-primary-500 !ui-py-2 !ui-px-3 hover:!ui-bg-primary-100 hover:ui-shadow-lg ui-border-primary-500"
        leftIcon={<PaperIcon />}
        onClick={() => setShowOrderDetail(true)}
      >
        <span className="ui-text-sm">
          {t('ticketingSystemDetail:order_detail.show_order_detail')}
        </span>
      </Button>
    </>
  )
}

export default TicketingSystemDetailShowOrderDetail

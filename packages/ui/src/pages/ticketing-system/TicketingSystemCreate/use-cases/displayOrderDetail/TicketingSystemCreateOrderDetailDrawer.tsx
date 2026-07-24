import TicketingSystemOrderDetailDrawer from '#pages/ticketing-system/components/TicketingSystemOrderDetailDrawer'

import { useTicketingSystemCreateContext } from '../../TicketingSystemCreateProvider'
import useTicketingSystemCreateOrderDetail from './useTicketingSystemCreateOrderDetail'

const TicketingSystemCreateOrderDetailDrawer = () => {
  const ticketingSystemCreate = useTicketingSystemCreateContext()
  const orderDetail = useTicketingSystemCreateOrderDetail()

  return (
    <TicketingSystemOrderDetailDrawer
      orderId={ticketingSystemCreate.form.watch('order_id.value')}
      open={orderDetail.isDrawerOpen}
      onClose={orderDetail.closeDrawer}
    />
  )
}

export default TicketingSystemCreateOrderDetailDrawer

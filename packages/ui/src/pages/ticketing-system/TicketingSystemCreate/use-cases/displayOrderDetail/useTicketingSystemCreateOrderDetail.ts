import useTicketingSystemCreateOrderDetailStore from './ticketing-system-create-order-detail.store'

const useTicketingSystemCreateOrderDetail = () => {
  const states = useTicketingSystemCreateOrderDetailStore()

  return {
    isDrawerOpen: states.isOrderDetailDrawerOpen,
    openDrawer: () => states.setIsOrderDetailDrawerOpen(true),
    closeDrawer: () => states.setIsOrderDetailDrawerOpen(false),
  }
}

export default useTicketingSystemCreateOrderDetail

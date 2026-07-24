import { create } from 'zustand'

interface UseTicketingSystemCreateOrderDetailStore {
  isOrderDetailDrawerOpen: boolean
  setIsOrderDetailDrawerOpen: (isOrderDetailDrawer: boolean) => void
}

const useTicketingSystemCreateOrderDetailStore =
  create<UseTicketingSystemCreateOrderDetailStore>()((set) => ({
    isOrderDetailDrawerOpen: false,
    setIsOrderDetailDrawerOpen: (isOrderDetailDrawer) =>
      set({ isOrderDetailDrawerOpen: isOrderDetailDrawer }),
  }))

export default useTicketingSystemCreateOrderDetailStore

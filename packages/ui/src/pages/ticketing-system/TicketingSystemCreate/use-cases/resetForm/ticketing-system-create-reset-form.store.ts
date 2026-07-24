import { create } from 'zustand'

interface UseTicketingSystemCreateResetFormStore {
  isResetFormModalOpen: boolean
  setIsResetFormModalOpen: (isResetFormModal: boolean) => void
}

const useTicketingSystemCreateResetFormStore =
  create<UseTicketingSystemCreateResetFormStore>()((set) => ({
    isResetFormModalOpen: false,
    setIsResetFormModalOpen: (isResetFormModal) =>
      set({ isResetFormModalOpen: isResetFormModal }),
  }))

export default useTicketingSystemCreateResetFormStore

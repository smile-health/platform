import { create } from 'zustand'

interface UseTicketingSystemCreateSubmitFormStore {
  isSubmitFormModalOpen: boolean
  setIsSubmitFormModalOpen: (isSubmitFormModal: boolean) => void
}

const useTicketingSystemCreateSubmitFormStore =
  create<UseTicketingSystemCreateSubmitFormStore>()((set) => ({
    isSubmitFormModalOpen: false,
    setIsSubmitFormModalOpen: (isSubmitFormModal) =>
      set({ isSubmitFormModalOpen: isSubmitFormModal }),
  }))

export default useTicketingSystemCreateSubmitFormStore

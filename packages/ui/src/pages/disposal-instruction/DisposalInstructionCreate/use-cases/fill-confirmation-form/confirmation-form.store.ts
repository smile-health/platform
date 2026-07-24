import { create } from 'zustand'

type UseConfirmationFormStore = {
  isModalShow: boolean
  showModal: () => void
  closeModal: () => void
}

export const useConfirmationFormStore = create<UseConfirmationFormStore>(
  (set) => ({
    isModalShow: false,
    showModal: () => set({ isModalShow: true }),
    closeModal: () => set({ isModalShow: false }),
  })
)

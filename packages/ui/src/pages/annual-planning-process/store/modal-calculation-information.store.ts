import { create } from "zustand"

type ModalCalculationInformation = {
  openCalculationInformation: boolean
  setOpenCalculationInformation: (open: boolean) => void
}

export const useModalCalculationInformation = create<ModalCalculationInformation>((set) => ({
  openCalculationInformation: false,
  setOpenCalculationInformation: (open: boolean) => set(() => ({ openCalculationInformation: open })),
}))

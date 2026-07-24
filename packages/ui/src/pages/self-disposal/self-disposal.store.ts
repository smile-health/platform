import { create } from "zustand";

interface State {
  modalReset: { open: boolean }
  setModalReset: (open: boolean) => void
}

export const useModalResetStore = create<State>((set) => ({
  modalReset: { open: false },
  setModalReset: (open) =>
    set(() => ({ modalReset: { open } })),
}))
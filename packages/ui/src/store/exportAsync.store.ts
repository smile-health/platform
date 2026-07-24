import { create } from 'zustand'

interface State {
  exportAsyncPopup: boolean
  setExportAsyncPopup: (flag: boolean) => void
}

export const useExportAsyncPopupStore = create<State>((set) => ({
  exportAsyncPopup: false,
  setExportAsyncPopup: (exportAsyncPopup) => set(() => ({ exportAsyncPopup })),
}))

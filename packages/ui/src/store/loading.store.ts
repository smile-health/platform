import { create } from 'zustand'

interface State {
    loadingPopup: boolean
    setLoadingPopup: (flag: boolean) => void
}

export const useLoadingPopupStore = create<State>((set) => ({
    loadingPopup: false,
    setLoadingPopup: (loadingPopup) => set(() => ({ loadingPopup }))
}))
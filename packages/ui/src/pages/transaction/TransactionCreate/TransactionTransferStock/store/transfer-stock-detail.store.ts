import { create } from 'zustand'

interface State {
  isOpenDrawer: boolean
  setIsOpenDrawer: (flag: boolean) => void
}

export const useOpenDrawerStore = create<State>((set) => ({
  isOpenDrawer: false,
  setIsOpenDrawer: (isOpenDrawer) => set(() => ({ isOpenDrawer })),
}))

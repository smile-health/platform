import { create } from 'zustand'

interface StateModalWarningItem{
  modalRemove: { open: boolean }
  setModalRemove: (open: boolean) => void
  customFunction?: (param: any) => void
  setCustomFunction: (fn: (param?: any) => void) => void
  content?: {
    title?: string
    description?: string
  }
  setContent: (content?: { title?: string; description?: string }) => void
}

export const useModalWarningItemStore =
  create<StateModalWarningItem>((set) => ({
    modalRemove: { open: false },
    setModalRemove: (open) => set(() => ({ modalRemove: { open } })),
    customFunction: undefined,
    setCustomFunction: (fn) =>
      set((state) => ({ ...state, customFunction: fn })),
    content: undefined,
    setContent: (content) => set(() => ({ content: content ?? undefined })),
  }))

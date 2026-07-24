import { create } from 'zustand'

interface State {
  modalWarning: { open: boolean; description: string }
  setModalWarning: (open: boolean, description: string) => void
}

interface StateModalWarningRemoveMaterial {
  modalRemove: { open: boolean; indexMaterial: number | undefined }
  setModalRemove: (open: boolean, indexMaterial: number | undefined) => void
  customFunction?: (param: any) => void
  setCustomFunction: (fn: (param?: any) => void) => void
  content?: {
    title?: string
    description?: string
  }
  setContent: (content?: { title?: string; description?: string }) => void
}

export const useModalWarningStore = create<State>((set) => ({
  modalWarning: { open: false, description: '' },
  setModalWarning: (open, description) =>
    set(() => ({ modalWarning: { open, description } })),
}))

export const useModalWarningRemoveMaterialStore =
  create<StateModalWarningRemoveMaterial>((set) => ({
    modalRemove: { open: false, indexMaterial: undefined },
    setModalRemove: (open, indexMaterial) =>
      set(() => ({ modalRemove: { open, indexMaterial } })),
    customFunction: undefined,
    setCustomFunction: (fn) =>
      set((state) => ({ ...state, customFunction: fn })),
    content: undefined,
    setContent: (content) => set(() => ({ content: content ?? undefined })),
  }))

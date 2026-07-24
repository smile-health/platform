import { Row } from '@tanstack/react-table'
import { create } from 'zustand'

import { DisposalItem, WasteInfo } from '../../disposal-instruction-detail.type'

type UseDisposalItemsStore = {
  selectedDisposalItemRow: Row<DisposalItem> | null
  selectedWasteInfoRow: Row<WasteInfo> | null

  isQtyDetailModalShow: boolean
  showQtyDetailModal: (selectedDisposalItemRow: Row<DisposalItem>) => void
  closeQtyDetailModal: () => void

  isWmsDetailDrawerShow: boolean
  showWmsDetailDrawer: (selectedDisposalItemRow: Row<DisposalItem>) => void
  closeWmsDetailDrawer: () => void

  isWmsStatusHistoryModalShow: boolean
  showWmsStatusHistoryModal: (
    isWmsStatusHistoryModalShow: Row<WasteInfo>
  ) => void
  closeWmsStatusHistoryModal: () => void
}

export const useDisposalItemsStore = create<UseDisposalItemsStore>((set) => ({
  selectedDisposalItemRow: null,
  selectedWasteInfoRow: null,

  isQtyDetailModalShow: false,
  showQtyDetailModal: (selectedDisposalItemRow) =>
    set({ isQtyDetailModalShow: true, selectedDisposalItemRow }),
  closeQtyDetailModal: () => set({ isQtyDetailModalShow: false }),

  isWmsDetailDrawerShow: false,
  showWmsDetailDrawer: (selectedDisposalItemRow) =>
    set({ isWmsDetailDrawerShow: true, selectedDisposalItemRow }),
  closeWmsDetailDrawer: () => set({ isWmsDetailDrawerShow: false }),

  isWmsStatusHistoryModalShow: false,
  showWmsStatusHistoryModal: (selectedWasteInfoRow: Row<WasteInfo>) =>
    set({ isWmsStatusHistoryModalShow: true, selectedWasteInfoRow }),
  closeWmsStatusHistoryModal: () => set({ isWmsStatusHistoryModalShow: false }),
}))

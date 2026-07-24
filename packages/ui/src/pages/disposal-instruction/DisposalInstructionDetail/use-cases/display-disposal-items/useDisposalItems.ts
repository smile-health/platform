import { useDisposalItemsStore } from './disposal-items.store'

export const useDisposalItems = () => {
  const disposalItemsStore = useDisposalItemsStore()

  return {
    selectedDisposalItem: disposalItemsStore.selectedDisposalItemRow?.original,
    selectedWasteInfo: disposalItemsStore.selectedWasteInfoRow?.original,
    qtyDetailModal: {
      isShow: disposalItemsStore.isQtyDetailModalShow,
      show: disposalItemsStore.showQtyDetailModal,
      close: disposalItemsStore.closeQtyDetailModal,
    },
    wmsDetailDrawer: {
      isShow: disposalItemsStore.isWmsDetailDrawerShow,
      show: disposalItemsStore.showWmsDetailDrawer,
      close: disposalItemsStore.closeWmsDetailDrawer,
    },
    wmsStatusHistoryModal: {
      isShow: disposalItemsStore.isWmsStatusHistoryModalShow,
      show: disposalItemsStore.showWmsStatusHistoryModal,
      close: disposalItemsStore.closeWmsStatusHistoryModal,
    },
  }
}

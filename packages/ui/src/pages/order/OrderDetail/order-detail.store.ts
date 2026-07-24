import { Row } from '@tanstack/react-table'
import { Stock } from '#types/stock'
import { create } from 'zustand'

import {
  OrderDetailItem,
  OrderDetailItemFormType,
  OrderDetailMappedOrderItem,
  OrderDetailResponse,
  OrderItemProjectionCapcity,
} from './order-detail.type'
import { AllocatedFormBatchModalValues } from './OrderDetailAllocate/Form/OrderHierarchyAllocatedFormBatchModal'
import { ReceiveOrderItemsModalFormHierarchyProps } from './OrderDetailReceive/Hierarchy/ReceiveOrderItemsModalFormHierarchy'

interface OrderDetailState {
  indexHierarchyRow?: number
  setIndexHierarchyRow: (indexHierarchyRow?: number) => void

  data?: OrderDetailResponse
  setData: (data?: OrderDetailResponse) => void

  vendorStockData?: Stock[]
  setVendorStockData: (vendorStockData?: Stock[]) => void

  mappedOrderItem?: OrderDetailMappedOrderItem[]
  setMappedOrderItem: (mappedOrderItem?: OrderDetailMappedOrderItem[]) => void

  isLoading: boolean
  setLoading: (isLoading: boolean) => void

  isShowFloatingBar: boolean
  setShowFloatingBar: (isShowFloatingBar: boolean) => void

  selectedOrderItemData?: OrderDetailItem

  isOpenItemForm: boolean
  itemFormType: OrderDetailItemFormType
  setOpenItemForm: (
    isOpenItemForm: boolean,
    itemFormType?: OrderDetailItemFormType,
    selectedOrderItemData?: OrderDetailItem
  ) => void

  isOpenCancelForm: boolean
  setOpenCancelForm: (isOpenCancelForm: boolean) => void

  isOpenValidateDrawerForm: boolean
  setOpenValidateDrawerForm: (isOpenValidateDrawerForm: boolean) => void
  isOpenValidateModalForm: boolean
  setOpenValidateModalForm: (isOpenValidateModalForm: boolean) => void

  isOpenConfirmDrawerForm: boolean
  setOpenConfirmDrawerForm: (isOpenConfirmDrawerForm: boolean) => void
  isOpenConfirmModalForm: boolean
  setOpenConfirmModalForm: (isOpenConfirmModalForm: boolean) => void

  isOpenModalConfirmHierarchyChildren: boolean
  setOpenModalConfirmHierarchyChildren: (
    isOpenModalConfirmHierarchyChildren: boolean
  ) => void

  isOpenCancelConfirmationForm: boolean
  setOpenCancelConfirmationForm: (isOpenCancelConfirmationForm: boolean) => void

  isOpenAllocateDrawerForm: boolean
  setOpenAllocateDrawerForm: (isOpenAllocateDrawerForm: boolean) => void
  isOpenAllocateModalForm: boolean
  allocateFormSelectedRow?: Row<OrderDetailMappedOrderItem>
  setOpenAllocateModalForm: (
    isOpenAllocateModalForm: boolean,
    allocateFormSelectedRow?: Row<OrderDetailMappedOrderItem>
  ) => void

  isOpenQuantityDetailModal: boolean
  setOpenQuantityDetailModal: (
    isOpenQuantityDetailModal: boolean,
    selectedOrderItemData?: OrderDetailItem
  ) => void

  isOpenShipForm: boolean
  setOpenShipForm: (isOpenShipForm: boolean) => void

  isOpenReceiveBatchListDrawerForm: boolean
  receiveFormSelectedRow?: Row<OrderDetailMappedOrderItem>
  setOpenReceiveBatchListDrawerForm: (
    isOpenReceiveBatchListDrawerForm: boolean,
    receiveFormSelectedRow?: Row<OrderDetailMappedOrderItem>
  ) => void

  isOpenHierarchyDrawerForm: boolean
  setOpenHierarchyDrawerForm: (isOpenHierarchyDrawerForm: boolean) => void
  isOpenHierarchyModalForm: boolean

  isCustomer: boolean
  setIsCustomer: (isCustomer: boolean) => void
  isVendor: boolean
  setIsVendor: (isVendor: boolean) => void

  isOrderDetailHierarchy: boolean
  setIsOrderDetailHierarchy: (isOrderDetailHierarchy: boolean) => void

  isThirdPartyOrder: boolean
  setIsThirdPartyOrder: (isThirdPartyOrder: boolean) => void

  isOpenAllocateBatchForm: boolean
  allocateBatchFormSelectedRow?: AllocatedFormBatchModalValues
  allocateBatchFormSelectedRowIndex?: number
  allocateBatchFormSelectedRowMaterial?: string
  allocateBatchFormSelectedRowActivity?: string
  allocateBatchFormSubmit?: (
    values?: AllocatedFormBatchModalValues,
    rowIndex?: number
  ) => void
  setOpenAllocateBatchForm: (
    isOpenAllocateBatchForm: boolean,
    allocateBatchFormSelectedRow?: AllocatedFormBatchModalValues,
    allocateBatchFormSelectedRowIndex?: number,
    allocateBatchFormSelectedRowMaterial?: string,
    allocateBatchFormSelectedRowActivity?: string,
    allocateBatchFormSubmit?: (
      values: AllocatedFormBatchModalValues,
      rowIndex?: number
    ) => void
  ) => void
  isReceiveOrderItemsModalForm: boolean
  receiveOrderItemsModalForm?: ReceiveOrderItemsModalFormHierarchyProps
  setIsReceiveOrderItemsModalForm: (
    isReceiveOrderItemsModalForm: boolean,
    receiveOrderItemsModalForm?: ReceiveOrderItemsModalFormHierarchyProps
  ) => void
  orderItemProjectionCapacities?: OrderItemProjectionCapcity[]
  setOrderItemProjectionCapacities: (
    orderItemProjectionCapacities?: OrderItemProjectionCapcity[]
  ) => void
}

const useOrderDetailStore = create<OrderDetailState>((set) => ({
  orderItemProjectionCapacities: undefined,
  setOrderItemProjectionCapacities: (orderItemProjectionCapacities) =>
    set({ orderItemProjectionCapacities }),

  isThirdPartyOrder: false,
  setIsThirdPartyOrder: (isThirdPartyOrder) => set({ isThirdPartyOrder }),

  indexHierarchyRow: undefined,
  setIndexHierarchyRow: (indexHierarchyRow) => set({ indexHierarchyRow }),

  data: undefined,
  setData: (data) => set({ data }),

  vendorStockData: undefined,
  setVendorStockData: (vendorStockData) => set({ vendorStockData }),

  mappedOrderItem: undefined,
  setMappedOrderItem: (mappedOrderItem) => set({ mappedOrderItem }),

  isLoading: false,
  setLoading: (isLoading) => set({ isLoading }),

  isShowFloatingBar: false,
  setShowFloatingBar: (isShowFloatingBar) => set({ isShowFloatingBar }),

  selectedOrderItemData: undefined,

  isOpenItemForm: false,
  itemFormType: 'add',
  itemFormData: undefined,
  setOpenItemForm: (isOpenItemForm, itemFormType, itemFormData) => {
    set({
      isOpenItemForm,
      itemFormType,
      selectedOrderItemData: isOpenItemForm ? itemFormData : undefined,
    })
  },

  isOpenCancelForm: false,
  setOpenCancelForm: (isOpenCancelForm) => set({ isOpenCancelForm }),

  isOpenValidateDrawerForm: false,
  setOpenValidateDrawerForm: (isOpenValidateDrawerForm) =>
    set({ isOpenValidateDrawerForm }),
  isOpenValidateModalForm: false,
  setOpenValidateModalForm: (isOpenValidateModalForm) =>
    set({ isOpenValidateModalForm }),

  isOpenConfirmDrawerForm: false,
  setOpenConfirmDrawerForm: (isOpenConfirmDrawerForm) =>
    set({ isOpenConfirmDrawerForm }),
  isOpenConfirmModalForm: false,
  setOpenConfirmModalForm: (isOpenConfirmModalForm) =>
    set({ isOpenConfirmModalForm }),

  isOpenModalConfirmHierarchyChildren: false,
  setOpenModalConfirmHierarchyChildren: (isOpenModalConfirmHierarchyChildren) =>
    set({ isOpenModalConfirmHierarchyChildren }),

  isOpenCancelConfirmationForm: false,
  setOpenCancelConfirmationForm: (isOpenCancelConfirmationForm) =>
    set({ isOpenCancelConfirmationForm }),

  isOpenAllocateDrawerForm: false,
  setOpenAllocateDrawerForm: (isOpenAllocateDrawerForm) =>
    set({ isOpenAllocateDrawerForm }),
  isOpenAllocateModalForm: false,
  allocateFormSelectedRow: undefined,
  setOpenAllocateModalForm: (
    isOpenAllocateModalForm,
    allocateFormSelectedRow
  ) => {
    set({ isOpenAllocateModalForm })
    if (isOpenAllocateModalForm) set({ allocateFormSelectedRow })
    if (!isOpenAllocateModalForm) set({ allocateFormSelectedRow: undefined })
  },

  isOpenQuantityDetailModal: false,
  setOpenQuantityDetailModal: (
    isOpenQuantityDetailModal,
    selectedOrderItemData
  ) => {
    set({
      isOpenQuantityDetailModal,
      selectedOrderItemData: isOpenQuantityDetailModal
        ? selectedOrderItemData
        : undefined,
    })
  },

  isOpenShipForm: false,
  setOpenShipForm: (isOpenShipForm) => set({ isOpenShipForm }),

  isOpenReceiveBatchListDrawerForm: false,
  receiveFormSelectedRow: undefined,
  setOpenReceiveBatchListDrawerForm: (
    isOpenReceiveBatchListDrawerForm,
    receiveFormSelectedRow
  ) => {
    set({ isOpenReceiveBatchListDrawerForm })
    if (isOpenReceiveBatchListDrawerForm) set({ receiveFormSelectedRow })
    if (!isOpenReceiveBatchListDrawerForm)
      set({ receiveFormSelectedRow: undefined })
  },

  isVendor: false,
  setIsVendor: (isVendor) => set({ isVendor }),

  isCustomer: false,
  setIsCustomer: (isCustomer) => set({ isCustomer }),

  isOrderDetailHierarchy: false,
  setIsOrderDetailHierarchy: (isOrderDetailHierarchy) =>
    set({ isOrderDetailHierarchy }),

  isOpenHierarchyDrawerForm: false,
  setOpenHierarchyDrawerForm: (isOpenHierarchyDrawerForm) =>
    set({ isOpenHierarchyDrawerForm }),
  isOpenHierarchyModalForm: false,

  isOpenAllocateBatchForm: false,
  allocateBatchFormSelectedRow: undefined,
  allocateBatchFormSelectedRowIndex: undefined,
  allocateBatchFormSelectedRowMaterial: undefined,
  allocateBatchFormSelectedRowActivity: undefined,
  allocateBatchFormSubmit: undefined,
  setOpenAllocateBatchForm: (
    isOpenAllocateBatchForm,
    allocateBatchFormSelectedRow,
    allocateBatchFormSelectedRowIndex,
    allocateBatchFormSelectedRowMaterial,
    allocateBatchFormSelectedRowActivity,
    allocateBatchFormSubmit
  ) => {
    set({
      isOpenAllocateBatchForm,
      allocateBatchFormSelectedRowIndex,
      allocateBatchFormSelectedRow: isOpenAllocateBatchForm
        ? allocateBatchFormSelectedRow
        : undefined,
      allocateBatchFormSelectedRowMaterial,
      allocateBatchFormSelectedRowActivity,
      allocateBatchFormSubmit,
    })
  },
  isReceiveOrderItemsModalForm: false,
  receiveOrderItemsModalForm: undefined,
  setIsReceiveOrderItemsModalForm: (
    isReceiveOrderItemsModalForm,
    receiveOrderItemsModalForm
  ) => {
    set({
      isReceiveOrderItemsModalForm,
      receiveOrderItemsModalForm: receiveOrderItemsModalForm
        ? receiveOrderItemsModalForm
        : undefined,
    })
  },
}))

export default useOrderDetailStore

import { createContext, SetStateAction } from 'react'
import { TDetailEntity } from '#types/entity'

import type {
  THandleOpenModal,
  TPayloadEntityCustomerVendor,
} from '../components/EntityDetailTabContents/EntityDetailCustomerVendorContent'

type TEntityDetailCustomerVendorContext = {
  isLoadingExport: boolean
  isSubmittingCustomer: boolean
  payload: TPayloadEntityCustomerVendor
  setPayload: (value: SetStateAction<TPayloadEntityCustomerVendor>) => void
  isViewOnly: boolean
  entity: TDetailEntity | null
  handleOpenModal: (data: THandleOpenModal) => void
  inputFields: any
  methods: any
}

const EntityDetailCustomerVendorContext =
  createContext<TEntityDetailCustomerVendorContext>({
    isLoadingExport: false,
    isSubmittingCustomer: false,
    handleOpenModal: () => {},
    payload: {
      customer_consumption: {
        keyword: '',
        page: 1,
        paginate: 10,
      },
      customer_distribution: {
        keyword: '',
        page: 1,
        paginate: 10,
      },
      vendor: {
        keyword: '',
        page: 1,
        paginate: 10,
      },
    },
    setPayload: () => {},
    isViewOnly: true,
    entity: null,
    inputFields: [],
    methods: null,
  })

export default EntityDetailCustomerVendorContext

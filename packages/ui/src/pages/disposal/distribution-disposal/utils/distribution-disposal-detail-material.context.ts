import { createContext } from 'react'

import { DetailDistributionDisposalItem } from '../types/DistributionDisposal'

type Props = {
  quantityData: DetailDistributionDisposalItem | null
  setQuantityData: (value: DetailDistributionDisposalItem | null) => void
  errorForms: any
  setErrorForms: (value: any) => void
}
const DistributionDisposalDetailMaterialContext = createContext<Props>({
  quantityData: null,
  setQuantityData: () => {},
  errorForms: {},
  setErrorForms: () => {},
})

export default DistributionDisposalDetailMaterialContext

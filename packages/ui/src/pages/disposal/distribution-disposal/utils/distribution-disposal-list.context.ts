import { createContext } from 'react'
import { Pagination } from '#types/common'

import { ListDistributionDisposalResponse } from '../types/DistributionDisposal'

type Props = {
  datasource?: ListDistributionDisposalResponse
  isFetching: boolean
  additionalQuery: Pagination & { purpose?: string }
  setAdditionalQuery: (additionalQuery: Pagination & { purpose?: string }) => void
}
const DistributionDisposalListContext = createContext<Props>({
  datasource: undefined,
  isFetching: false,
  additionalQuery: {
    page: 1,
    paginate: 10,
    tab: 'all',
  } as Pagination,
  setAdditionalQuery: () => {},
})

export default DistributionDisposalListContext

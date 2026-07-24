import { createContext } from 'react'

import { TBmhpApprovalItem } from './bmhp-approval-list.type'

export type BmhpApprovalDetailContextType = {
  approvalData: TBmhpApprovalItem | null
  refetchApprovalData?: () => Promise<any>
  regencyName?: string
  provinceName?: string
}

const BmhpApprovalDetailContext = createContext<BmhpApprovalDetailContextType>({
  approvalData: null,
  regencyName: '-',
  provinceName: '-',
})

export default BmhpApprovalDetailContext

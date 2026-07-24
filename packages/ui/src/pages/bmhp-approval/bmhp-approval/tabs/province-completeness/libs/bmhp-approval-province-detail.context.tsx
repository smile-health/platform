'use client'

import { createContext } from 'react'

import { TBmhpApprovalProvinceDetail } from './bmhp-approval-province-completeness.type'

type TBmhpApprovalProvinceDetailContextValue = {
  approvalData: TBmhpApprovalProvinceDetail | null
  refetchApprovalData: () => void
}

const BmhpApprovalProvinceDetailContext =
  createContext<TBmhpApprovalProvinceDetailContextValue>({
    approvalData: null,
    refetchApprovalData: () => {},
  })

export default BmhpApprovalProvinceDetailContext

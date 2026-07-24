import { createContext } from 'react'
import { GetProfileResponse } from '#services/profile'

import {
  TDistributionDisposal,
  TUpdateReceivedStock,
} from '../types/DistributionDisposal'
import { TProgram } from '#types/program'

type Props = {
  data?: TDistributionDisposal
  isLoading?: boolean
  inProcess: boolean
  setInProcess: (value: boolean) => void
  savedQuantityData?: TUpdateReceivedStock[] | null
  setSavedQuantityData: (value: TUpdateReceivedStock[] | null) => void
  comment: string
  setComment: (value: string) => void
  profile?: GetProfileResponse
  isIronHandedRole?: boolean
  activeProgram?: TProgram
}
const DistributionDisposalDetailContext = createContext<Props>({
  data: undefined,
  isLoading: false,
  inProcess: false,
  setInProcess: () => {},
  savedQuantityData: null,
  setSavedQuantityData: () => {},
  comment: '',
  setComment: () => {},
  profile: undefined,
  isIronHandedRole: false,
  activeProgram: undefined,
})

export default DistributionDisposalDetailContext

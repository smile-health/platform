import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'

import { DisposalInstructionDetail } from './disposal-instruction-detail.type'

export type GetDisposalInstructionDetailResponse = DisposalInstructionDetail

export const getDisposalInstructionDetail = async (
  id: string
): Promise<GetDisposalInstructionDetailResponse> => {
  const response = await axios.get(`/main/disposal/instructions/${id}`)
  return handleAxiosResponse(response)
}

import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'

export namespace CreateDisposalInstructionPayload {
  export type Root = {
    activity_id: number
    customer_id: number
    instruction_type_id: number
    bast_no: string
    disposal_comments: string | null
    disposal_items: Array<DisposalItem>
  }

  export type DisposalItem = {
    material_id: number
    stocks: Array<Stock>
  }

  export type Stock = {
    disposal_stocks: Array<DisposalStock>
  }

  export type DisposalStock = {
    discard_qty: number
    received_qty: number
    disposal_stock_id: number
    transaction_reasons: {
      id: number
    }
  }
}

type CreateDisposalInstructionResponse = {
  id: number
}

export const createDisposalInstruction = async (
  payload: CreateDisposalInstructionPayload.Root
): Promise<CreateDisposalInstructionResponse> => {
  const response = await axios.post('/main/disposal/instructions', payload)

  return handleAxiosResponse(response)
}

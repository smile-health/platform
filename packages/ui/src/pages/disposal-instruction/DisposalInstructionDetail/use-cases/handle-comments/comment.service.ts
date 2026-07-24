import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'

export type CreateCommentPayload = {
  comment: string
}

export const createComment = async (
  id: string | number,
  payload: CreateCommentPayload
) => {
  payload.comment = payload.comment?.trim()
  const response = await axios.post(
    `/main/disposal/instructions/${id}/comment`,
    payload
  )
  return handleAxiosResponse(response)
}

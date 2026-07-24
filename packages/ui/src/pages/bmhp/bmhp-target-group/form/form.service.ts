import axios from '#lib/axios'

import {
  CreateBmhpTargetGroupBody,
  UpdateBmhpTargetGroupBody,
} from '../bmhp-material.types'

const baseUrl = 'main/'

export const createBmhpTargetGroup = async (
  body: CreateBmhpTargetGroupBody
) => {
  const apiUrl = `${baseUrl}bmhp-target-groups`
  const response = await axios.post(apiUrl, body, {
    cleanParams: true,
  })

  return response.data
}

export const updateBmhpTargetGroup = async (
  body: UpdateBmhpTargetGroupBody
) => {
  const apiUrl = `${baseUrl}bmhp-target-groups/${body.id}`
  const response = await axios.put(apiUrl, body, {
    cleanParams: true,
  })

  return response.data
}

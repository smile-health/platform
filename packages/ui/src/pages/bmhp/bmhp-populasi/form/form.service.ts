import axios from '#lib/axios'

import {
  CreateBmhpMethodBody,
  UpdateBmhpMethodBody,
} from '../bmhp-method.types'

const baseUrl = 'main/'

export const createBmhpMethod = async (body: CreateBmhpMethodBody) => {
  const apiUrl = `${baseUrl}bmhp-examination-methods`
  const response = await axios.post(apiUrl, body, {
    cleanBody: true,
  })

  return response.data
}

export const updateBmhpMethod = async (body: UpdateBmhpMethodBody) => {
  const apiUrl = `${baseUrl}bmhp-examination-methods/${body.id}`
  const response = await axios.put(apiUrl, body, {
    cleanBody: true,
  })

  return response.data
}

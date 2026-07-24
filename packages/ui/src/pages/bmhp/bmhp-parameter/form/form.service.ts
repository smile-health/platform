import axios from '#lib/axios'

import {
  CreateBmhpParameterBody,
  UpdateBmhpParameterBody,
} from '../bmhp-parameter.types'

const baseUrl = 'main/'

export const createBmhpParameter = async (body: CreateBmhpParameterBody) => {
  const apiUrl = `${baseUrl}bmhp-parameters`
  const response = await axios.post(apiUrl, body, {
    cleanBody: true,
  })

  return response.data
}

export const updateBmhpParameter = async (body: UpdateBmhpParameterBody) => {
  const apiUrl = `${baseUrl}bmhp-parameters/${body.id}`
  const response = await axios.put(apiUrl, body, {
    cleanBody: true,
  })

  return response.data
}

import axios from '#lib/axios'

import {
  CreateBmhpExaminationTypeBody,
  UpdateBmhpExaminationTypeBody,
} from '../bmhp-examination-type.types'

const baseUrl = 'main/'

export const createBmhpExaminationType = async (
  body: CreateBmhpExaminationTypeBody
) => {
  const apiUrl = `${baseUrl}bmhp-examinations/types`
  const response = await axios.post(apiUrl, body, {
    cleanBody: true,
  })

  return response.data
}

export const updateBmhpExaminationType = async (
  body: UpdateBmhpExaminationTypeBody
) => {
  const apiUrl = `${baseUrl}bmhp-examinations/types/${body.id}`
  const response = await axios.put(apiUrl, body, {
    cleanBody: true,
  })

  return response.data
}

import { SERVICE_API } from '#constants/api'
import axios from '#lib/axios'

import { AnnualCommitmentFormPayload } from './annual-commitment-form.type'

const SERVICE = SERVICE_API

export const createAnnualCommitment = async (
  data: AnnualCommitmentFormPayload
) => {
  const result = await axios.post(`${SERVICE.MAIN}/annual-commitments`, data, {
    cleanParams: true,
  })

  return result?.data
}

export const updateAnnualCommitment = async (
  id: number,
  data: AnnualCommitmentFormPayload
) => {
  const result = await axios.put(
    `${SERVICE.MAIN}/annual-commitments/${id}`,
    data,
    {
      cleanParams: true,
    }
  )

  return result?.data
}

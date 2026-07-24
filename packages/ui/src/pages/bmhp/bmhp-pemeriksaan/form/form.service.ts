import axios from '#lib/axios'

import {
  CreateBmhpPemeriksaanBody,
  UpdateBmhpPemeriksaanBody,
} from '../bmhp-pemeriksaan.types'

const baseUrl = 'main/'

export const createBmhpPemeriksaan = async (
  body: CreateBmhpPemeriksaanBody
) => {
  const apiUrl = `${baseUrl}bmhp-examinations`
  const response = await axios.post(apiUrl, body, {
    cleanParams: true,
  })

  return response.data
}

export const updateBmhpPemeriksaan = async (
  body: UpdateBmhpPemeriksaanBody
) => {
  const apiUrl = `${baseUrl}bmhp-examinations/${body.id}`
  const response = await axios.put(apiUrl, body, {
    cleanParams: true,
  })

  return response.data
}

export async function loadSasaranOptions(year_id: number) {
  const response = await axios.get(baseUrl + 'bmhp-target-groups/plan', {
    params: { paginate: 100, program_plan_id: year_id },
  })
  return (response?.data?.data ?? []).map(
    (item: { target_group_id: number; name: string }) => ({
      value: item.target_group_id,
      label: item.name,
    })
  )
}

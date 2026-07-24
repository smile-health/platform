import axios from '#lib/axios'

export type GetBmhpPopulasiListParams = {
  province_id?: number
  program_plan_id?: number
  page?: number
  paginate?: number
  sort_by?: string
  sort_type?: string
}

export type TBmhpPopulasiPopulation = {
  id: number
  name: string
  population_number: number
}

export type TBmhpPopulasiEntity = {
  id?: number
  name?: string
  province: string
  regency?: string
}

export type TBmhpPopulasiData = {
  entity: TBmhpPopulasiEntity
  population: TBmhpPopulasiPopulation[]
  user_updated_at?: string
  user_updated_by?: {
    id: number
    username: string
    firstname: string
    lastname: string
    fullname: string
  }
}

export type GetBmhpPopulasiListResponse = {
  year_plan: string
  data: TBmhpPopulasiData[]
  item_per_page?: number
  list_pagination?: number[]
  page?: number
  total_item?: number
  total_page?: number
}

const baseUrl = 'main/'

export const listBmhpPopulasi = async (params: GetBmhpPopulasiListParams) => {
  const apiUrl = `${baseUrl}bmhp-planning-populations`

  const response = await axios.get(apiUrl, {
    params,
    cleanParams: true,
  })

  // We map the raw response directly to the custom object structure
  return response.data as unknown as GetBmhpPopulasiListResponse
}

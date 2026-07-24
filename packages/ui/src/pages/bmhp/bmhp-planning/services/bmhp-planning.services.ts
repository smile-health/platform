import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'

import {
  BmhpPlanningYearCreateForm,
  ListBmhpPlanningYearsParams,
  ListBmhpPlanningYearsResponse,
  TBmhpPlanningYear,
} from '../list/libs/bmhp-planning-list.type'

/**
 * All requests to the Program Plan API use this programId
 * to override the default x-program-id header.
 */
const DEFAULT_APPROACH_ID = 4

const baseUrl = 'main/'

/**
 * Fetch list of BMHP planning years from Program Plan API
 */
export const listBmhpPlanningYears = async (
  params: ListBmhpPlanningYearsParams
) => {
  const fetchYearList = await axios.get(
    `${baseUrl}annual-planning/program-plans`,
    {
      params,
      cleanParams: true,
    }
  )

  const resultData =
    fetchYearList?.data?.data?.map(
      (item: TBmhpPlanningYear, index: number) => ({
        ...item,
        si_no: index + 1 + ((params?.page ?? 1) - 1) * (params?.paginate ?? 10),
      })
    ) ?? []

  const result = {
    ...fetchYearList,
    data: {
      ...fetchYearList?.data,
      data: resultData,
    },
  }

  return handleAxiosResponse<ListBmhpPlanningYearsResponse>(result)
}

/**
 * Get year detail by ID from Program Plan API
 */
export const detailBmhpPlanningYear = async (
  id: number
): Promise<TBmhpPlanningYear> => {
  const fetchYearDetail = await axios.get(
    `${baseUrl}annual-planning/program-plans/${id}`
  )

  return fetchYearDetail?.data
}

/**
 * Create a new year via Program Plan API
 * Uses approach_id = 1 (VACCINATION) and status defaults to draft on backend
 */
export const createBmhpPlanningYear = async (
  data: BmhpPlanningYearCreateForm
) => {
  const response = await axios.post(
    `${baseUrl}annual-planning/program-plans`,
    {
      year: String(data.year),
      approach_id: DEFAULT_APPROACH_ID,
    },
    {
      cleanBody: true,
    }
  )
  return response?.data as TBmhpPlanningYear
}

/**
 * Fetch all existing years (for disabling in dropdown)
 */
export const markFinalBmhpPlanning = async (id: number) => {
  const response = await axios.put(
    `${baseUrl}annual-planning/program-plans/${id}`,
    null,
    {}
  )
  return handleAxiosResponse<TBmhpPlanningYear>(response)
}

/**
 * Fetch all existing years (for disabling in dropdown)
 */
export const getExistingYears = async (): Promise<number[]> => {
  const response = await axios.get(`${baseUrl}annual-planning/program-plans`, {
    params: {
      page: 1,
      paginate: 50,
    },
    cleanParams: true,
  })

  const data = response?.data?.data ?? []
  return data.map((item: TBmhpPlanningYear) => item.year)
}

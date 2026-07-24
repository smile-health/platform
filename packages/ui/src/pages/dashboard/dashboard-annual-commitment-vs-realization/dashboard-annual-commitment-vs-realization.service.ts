import axios from "#lib/axios"
import { AxiosResponse } from "axios"
import {
  AnnualCommitmentVsRealizationSummaryResponse,
  AnnualCommitmentVsRealizationChartResponse,
  AnnualCommitmentVsRealizationProvinceParams,
  ContractNumberResponse,
  ListAnnualCommitmentVsRealizationProvinceResponse,
} from "./dashboard-annual-commitment-vs-realization.type"
import { handleAxiosResponse } from "#utils/api"
import { parseDownload } from "#utils/download"

export const loadContract = async (
  keyword: string,
  _: unknown,
  additional: {
    page: number
    po_number?: string
    label?: string
    is_available?: number
    commitment_id?: string
    material_parent_id?: string
    year?: string
  }
) => {
  const params = {
    keyword,
    commitment_id: additional?.commitment_id,
    is_available: additional?.is_available,
    page: additional?.page,
    material_parent_id: additional?.material_parent_id,
    year: additional?.year,
    paginate: 10,
  }

  const response: AxiosResponse<ContractNumberResponse> = await axios.get('/main/annual-commitments', {
    params,
    cleanParams: true,
  })

  if (response?.status === 204) {
    return {
      options: [],
      hasMore: false,
      additional: {
        page: additional?.page,
      },
    }
  }
  const createOption = [
    {
      label: additional?.label as string,
      value: additional?.po_number as string,
    },
  ]

  const options = response?.data?.data?.map((item) => ({
    label: item?.contract.number,
    value: item?.contract.number,
  }))

  return {
    options:
      additional?.po_number && additional.page === 1
        ? [...createOption, ...options]
        : options,
    hasMore: Boolean(response?.data?.data?.length),
    additional: {
      ...additional,
      page: additional?.page + 1,
    },
  }
}

export async function exportAnnualCommitmentVsRealization(
  params: AnnualCommitmentVsRealizationProvinceParams
) {
  const response = await axios.get('/warehouse-report/dashboard-commitment-monitoring/xls', {
    responseType: 'blob',
    params,
    cleanParams: true,
  })

  parseDownload(response?.data, response?.headers?.filename)

  return response?.data
}

export async function getAnnualCommitmentVsRealizationSummary(
  params: AnnualCommitmentVsRealizationProvinceParams
): Promise<AnnualCommitmentVsRealizationSummaryResponse> {
  const response = await axios.get('/warehouse-report/dashboard-commitment-monitoring/summary', {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<AnnualCommitmentVsRealizationSummaryResponse>(response)
}

export async function getAnnualCommitmentVsRealizationRequirementAndRemaining(
  params: AnnualCommitmentVsRealizationProvinceParams
): Promise<AnnualCommitmentVsRealizationChartResponse> {
  const response = await axios.get('/warehouse-report/dashboard-commitment-monitoring/need-stocks', {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<AnnualCommitmentVsRealizationChartResponse>(response)
}

export async function getAnnualCommitmentVsRealizationNational(
  params: AnnualCommitmentVsRealizationProvinceParams
): Promise<AnnualCommitmentVsRealizationChartResponse> {
  const response = await axios.get('/warehouse-report/dashboard-commitment-monitoring/national', {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<AnnualCommitmentVsRealizationChartResponse>(response)
}

export async function getAnnualCommitmentVsRealizationTarget(
  params: AnnualCommitmentVsRealizationProvinceParams
): Promise<AnnualCommitmentVsRealizationChartResponse> {
  const response = await axios.get('/warehouse-report/dashboard-commitment-monitoring/realization-target', {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<AnnualCommitmentVsRealizationChartResponse>(response)
}

export async function listAnnualCommitmentVsRealizationProvince(
  params: AnnualCommitmentVsRealizationProvinceParams
): Promise<ListAnnualCommitmentVsRealizationProvinceResponse> {
  const response = await axios.get('/warehouse-report/dashboard-commitment-monitoring/province', {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<ListAnnualCommitmentVsRealizationProvinceResponse>(response)
}

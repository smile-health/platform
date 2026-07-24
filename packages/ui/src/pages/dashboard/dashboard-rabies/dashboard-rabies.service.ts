import axios from '#lib/axios'
import { parseDownload } from '#utils/download'

import {
  BaseDashboardRabiesParams,
  CareCascadeParams,
  CareCascadeResponse,
  DashboardRabiesEntityParams,
  DashboardRabiesEntityResponse,
  DashboardRabiesLocationParams,
  DashboardRabiesWithAdditionalParams,
  MonthlyPatientDoseParams,
  MonthlyPatientDoseResponse,
  MonthlyVaccineSequenceResponse,
  ProgramCoverageResponse,
  ProvinceResponses,
  RecipientVaccineResponse,
  RegencyResponses,
} from './dashboard-rabies.type'

export async function getProgramCoverage(params: BaseDashboardRabiesParams) {
  const response = await axios.get<ProgramCoverageResponse>(
    '/warehouse-report/rabies/program-coverage',
    {
      params,
      cleanParams: true,
    }
  )
  return response?.data
}

export async function getRecipientVaccine(params: BaseDashboardRabiesParams) {
  const response = await axios.get<RecipientVaccineResponse>(
    '/warehouse-report/rabies/recipient-vaccine',
    {
      params,
      cleanParams: true,
    }
  )
  return response?.data
}

export async function getCareCascade(params: CareCascadeParams) {
  const response = await axios.get<CareCascadeResponse>(
    '/warehouse-report/rabies/funnel-vaccine-sequence',
    {
      params,
      cleanParams: true,
    }
  )
  return response?.data
}

export async function getMonthlyPatientDose(params: MonthlyPatientDoseParams) {
  const response = await axios.get<MonthlyPatientDoseResponse>(
    '/warehouse-report/rabies/monthly-patient-injection',
    {
      params,
      cleanParams: true,
    }
  )
  return response?.data
}

export async function getMonthlyVaccineSequence(
  params: DashboardRabiesWithAdditionalParams
) {
  const response = await axios.get<MonthlyVaccineSequenceResponse>(
    '/warehouse-report/rabies/monthly-vaccine-sequence',
    {
      params,
      cleanParams: true,
    }
  )

  return response?.data
}

export async function getDashboardRabiesProvinces(
  params: DashboardRabiesLocationParams
) {
  const response = await axios.get<ProvinceResponses>(
    '/warehouse-report/rabies/provinces',
    {
      params,
      cleanParams: true,
    }
  )

  return response?.data
}

export async function getDashboardRabiesRegencies(
  params: DashboardRabiesLocationParams
) {
  const response = await axios.get<RegencyResponses>(
    '/warehouse-report/rabies/regencies',
    {
      params,
      cleanParams: true,
    }
  )

  return response?.data
}

export async function getDashboardRabiesEntities(
  params: DashboardRabiesEntityParams
) {
  const response = await axios.get<DashboardRabiesEntityResponse>(
    '/warehouse-report/rabies/entities',
    {
      params,
      cleanParams: true,
    }
  )

  return response?.data
}

export async function exportDashboardRabies(params: BaseDashboardRabiesParams) {
  const response = await axios.get('/warehouse-report/rabies/export', {
    responseType: 'blob',
    params,
    cleanParams: true,
  })

  parseDownload(response?.data, response?.headers?.filename)

  return response?.data
}

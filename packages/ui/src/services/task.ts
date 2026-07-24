import axios from '#lib/axios'
import {
  ExportTaskParams,
  ListTaskParams,
  ListTaskResponse,
  ResponseDetailCoverage,
  ResponseDetailTask,
  TaskFormValues,
} from '#types/task'
import { handleAxiosResponse } from '#utils/api'
import { parseDownload } from '#utils/download'

import { listAnnualPlanningTargetGroup } from '../pages/annual-planning-target-group/services/annual-planning-target-group.services'

export async function getListTask(
  programPlanId: number,
  params: ListTaskParams
): Promise<ListTaskResponse> {
  const response = await axios.get(
    `/main/annual-planning/program-plans/${programPlanId}/task`,
    {
      params,
      cleanParams: true,
    }
  )

  return handleAxiosResponse<ListTaskResponse>(response)
}

export async function exportTask(
  programPlanId: number,
  params: ExportTaskParams
): Promise<ListTaskResponse> {
  const response = await axios.get(
    `/main/annual-planning/program-plans/${programPlanId}/task/export`,
    {
      params,
      cleanParams: true,
      responseType: 'blob',
    }
  )

  parseDownload(response.data, response.headers?.filename)

  return response.data
}

export async function importTask(programPlanId: number, data: FormData) {
  const response = await axios.post(
    `/main/annual-planning/program-plans/${programPlanId}/task/import`,
    data
  )

  return response?.data
}

export async function downloadTemplateTask() {
  const response = await axios.get(
    `/main/annual-planning/program-plans/task/template`,
    {
      responseType: 'blob',
    }
  )
  parseDownload(
    response?.data,
    response?.headers?.filename ?? 'template-task.xlsx'
  )

  return response?.data
}

export async function getDetailCoverage(
  taskId: number
): Promise<ResponseDetailCoverage> {
  const response = await axios.get(
    `/main/annual-planning/program-plans/task/${taskId}/coverage`
  )

  return handleAxiosResponse<ResponseDetailCoverage>(response)
}

export async function deleteTask(taskId: number) {
  const response = await axios.delete(
    `/main/annual-planning/program-plans/task/${taskId}`
  )

  return response?.data
}

export async function loadGroupTarget(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    programPlanId: number
  }
) {
  const params = {
    page: additional.page,
    paginate: 10,
    keyword,
    programPlanId: additional.programPlanId,
  }

  const result = await listAnnualPlanningTargetGroup(params)

  if (result?.statusCode === 204) {
    return {
      options: [],
      hasMore: false,
      additional: {
        page: additional.page + 1,
        programPlanId: additional.programPlanId,
      },
    }
  }

  const options = result.data.map((item) => ({
    label: item.name as string,
    value: item.id as number,
  }))

  return {
    options,
    hasMore: result?.data?.length > 0,
    additional: {
      page: additional.page + 1,
      programPlanId: additional.programPlanId,
    },
  }
}

export async function createTask(programPlanId: number, data: TaskFormValues) {
  const payload = {
    program_plan_id: programPlanId,
    material_id: data.material.value,
    activity_id: data.activity.value,
    month_distribution: data.monthly_distribution.join(','),
    target_groups: data.amount_of_giving?.map((item) => ({
      target_group_id: item.group_target.value,
      number_of_dose: Number(item.number_of_doses),
      ip: Number(item.national_ip),
      coverages: item.target_coverage?.map((coverage) => ({
        province_id: coverage.province_id,
        coverage_number: coverage.coverage_number,
      })),
    })),
  }
  const response = await axios.post(
    `/main/annual-planning/program-plans/task`,
    payload
  )

  return response?.data
}

export async function getDetailTask(
  taskId: number
): Promise<ResponseDetailTask> {
  const response = await axios.get(
    `/main/annual-planning/program-plans/task/${taskId}`
  )

  return handleAxiosResponse<ResponseDetailTask>(response)
}

export async function editTask(taskId: number, data: TaskFormValues) {
  const payload = {
    month_distribution: data.monthly_distribution.join(','),
    target_groups: data.amount_of_giving?.map((item) => ({
      number_of_dose: Number(item.number_of_doses),
      ip: Number(item.national_ip),
      coverages: item.target_coverage?.map((coverage) => ({
        province_id: coverage.province_id,
        coverage_number: coverage.coverage_number,
      })),
    })),
  }
  const response = await axios.put(
    `/main/annual-planning/program-plans/task/${taskId}`,
    payload
  )

  return response?.data
}

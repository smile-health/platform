import { OptionType } from '#components/react-select'
import { formSchema } from '#pages/annual-planning-task/schema/taskSchema'
import * as yup from 'yup'

import { TCommonResponseList } from './common'

export type ListTaskResponse = TCommonResponseList & {
  data: Task[]
  statusCode: number
}

export type Task = {
  id: number
  code: string
  material: {
    name: string
  }
  activity: {
    id: number
    name: string
  }
  ip: string
  month_distribution: string[]
  target_group: {
    id: number
    name: string
  }
  number_of_dose: number
  coverage: {
    id: number
    province_count: number
  }
  user_updated_by: {
    fullname: string
  }
  user_updated_at: string
}

export type ListTaskParams = {
  paginate: number
  page: number
  material_id?: number
  activity_id?: number
}

export type ExportTaskParams = {
  material_id?: number
  activity_id?: number
}

export type ResponseDetailCoverage = TCommonResponseList & {
  data: Coverage[]
  statusCode: number
}

export type Coverage = {
  province_id: number
  province_name: string
  coverage_number: number
}

export type TaskFormValues = yup.InferType<ReturnType<typeof formSchema>>

export type AmountOfGivingFormValues = {
  amount_of_giving: AmountOfGiving[]
}

export type AmountOfGiving = {
  group_target: OptionType | null
  number_of_doses: string
  national_ip: string
  consumption_unit_per_distribution_unit?: number
}

export type AmountOfGivingForm = {
  group_target: {
    label: string
    value: number
  }
  number_of_doses: string
  national_ip: string
  target_coverage: {
    province_id: number
    province_name: string
    coverage_number: number
  }[]
}

export type CoverageForm = {
  id: number
  isActive: boolean
  province: {
    label: string
    value: number
  }
  target: number | null
}

export type ResponseDetailTask = {
  activity: {
    id: number
    name: string
  }
  code: string
  id: number
  ip: number
  material: {
    id: number
    name: string
  }
  month_distribution: string
  program_plan_id: number
  target_groups: ResponseTargetGroupItem[]
}

export type ResponseTargetGroupItem = {
  coverages: ResponseCoverageItem[]
  id: number
  name: string
  number_of_dose: number
}

export type ResponseCoverageItem = {
  coverage_number: number
  id: number
  province: {
    id: number
    name: string
  }
}

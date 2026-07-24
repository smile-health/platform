import { OptionType } from '#components/react-select'
import {
  CommonType,
  TCommonFilter,
  TCommonResponseList,
  TInfoUserCreated,
} from '#types/common'
import { TProgram } from '#types/program'
import { TFunction } from 'i18next'

export type DetailBudgetSourceResponse = {
  created_at: string
  created_by: number
  description: string | null
  id: number
  name: string
  updated_at: string
  status: number
  user_created_by: TInfoUserCreated
  user_updated_by: TInfoUserCreated
  programs: TProgram[]
  is_restricted: boolean | number
}

export type ListBudgetSourceParams = TCommonFilter & {
  keyword?: string
  sort_by?: string
  sort_type?: string
  status?: number
  program_ids?: number[]
}

export type ListBudgetSourceResponse = TCommonResponseList & {
  data: DetailBudgetSourceResponse[]
  statusCode?: number
}

export type ExportBudgetSourceParams = {
  keyword?: string
  program_ids?: OptionType[]
}

export type CreateBudgetSourceBody = {
  name?: string
  description?: string | null
  program_ids?: number[]
  is_restricted?: string | boolean | number
}

export type BudgetSourceTableProps = CommonType & {
  size: number
  page: number
}

export type BudgetSourceFormProps = {
  defaultValues?: CreateBudgetSourceBody
  isGlobal?: boolean
  disabledProgramIds?: number[]
}

export type BudgetSourceDetailWorkspaceProps = {
  data?: DetailBudgetSourceResponse
  isLoading?: boolean
  t: TFunction<['common', 'budgetSource']>
}

export type ParamData = {
  id: string
  status: number
}

export type BudgetSourceDetailInfoProps = CommonType & {
  data?: DetailBudgetSourceResponse
  isLoading?: boolean
  onUpdateStatus: (data:ParamData) => void
  isLoadingUpdateStatus?: boolean
}

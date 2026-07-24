import { OptionType } from '#components/react-select'
import { TCommonObject, TCommonResponseList } from '#types/common'
import { TFunction } from 'i18next'

import { TProgramPlanData } from '../../../program-plan/list/libs/program-plan-list.type'

export interface TProgramPlanRatio {
  data: TProgramPlanRatioData[]
  item_per_page: number
  list_pagination: number[]
  page: number
  total_item: number
  total_page: number
}

export interface TProgramPlanRatioData {
  si_no: number
  id: number
  from_material: TCommonObject
  from_subtype: TCommonObject
  from_material_qty: number
  to_material: TCommonObject
  to_subtype: TCommonObject
  to_material_qty: number
  created_by: TUserCreatedBy
  updated_by: TUserCreatedBy
  deleted_by: TUserCreatedBy | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface TUserCreatedBy {
  firstname: string
  fullname: string
  id: number
  lastname?: string | null
  username: string
}

export type TMainColumn = {
  t: TFunction<
    ['common', 'annualPlanningTargetGroup', 'programPlanMaterialRatio']
  >
  locale: string
  programPlanId: number
  detailProgramPlanData: TProgramPlanData | null
  setLink: (link: string) => string
  onClickDelete: (materialRatio: TRatioRow) => void
}

// Transaction List
export type ListProgramPlanRatioResponse = TCommonResponseList & {
  data: Array<TProgramPlanRatioData>
}

// Transaction Params
export type ListProgramPlanRatioParams = {
  page?: number
  paginate?: number
  material_ids?: OptionType[]
}

export type TRatioRow = {
  id: number
  no: number
  material_left_name: string
  material_left_type: string
  material_right_name: string
  material_right_type: string
  ratio: string
  updated_by: string
  updated_at: string
}

// Pagination info for Program Plan Ratio list table
export type ProgramPlanRatioPagination = {
  page: number
  itemPerPage: number
  totalItem: number
  totalPage: number
  listPagination: number[]
}

// Props contract for ProgramPlanRatioListTable component
export type ProgramPlanRatioListTableProps = {
  data: TRatioRow[]
  pagination?: ProgramPlanRatioPagination
  onChangePage?: (page: number) => void
  onChangePaginate?: (limit: number) => void
  onClickDelete: (materialRatio: TRatioRow) => void
}

import { createContext, ReactNode } from "react"
import { AnnualPlanningProcessForm, FormPopulationCorrectionForm, ListAnnualPlanningProcessProvinceResponse, UserTag } from "../annual-planning-process.types"
import { MinMaxStatusProvinceRegency } from "../annual-planning-process.constants"

type AnnualPlanningProcessCreateContextProps = {
  userTag: UserTag
  currentStep: number
  setCurrentStep: (step: number) => void
  parentForm: AnnualPlanningProcessForm
  updateForm: (
    type: keyof AnnualPlanningProcessForm,
    data: AnnualPlanningProcessForm[keyof AnnualPlanningProcessForm]
  ) => void
  isReview: boolean
  isRevision: boolean
  isDraft: boolean
  refetchUsageIndex?: () => void
}

const defaultValue: AnnualPlanningProcessCreateContextProps = {
  userTag: null,
  currentStep: 0,
  setCurrentStep: () => { },
  parentForm: {},
  updateForm: () => { },
  isReview: false,
  isRevision: false,
  isDraft: false,
  refetchUsageIndex: () => { },
}

export const AnnualPlanningProcessCreateContext = createContext<AnnualPlanningProcessCreateContextProps>(defaultValue)

type FormPopulationCorrectionContextProps = {
  data: Array<{ name: string;[key: string]: number | string }>
  calculateData: (population: FormPopulationCorrectionForm[]) => void
}

export const FormPopulationCorrectionContext = createContext<FormPopulationCorrectionContextProps>({
  data: [],
  calculateData: () => { },
})

type AnnualPlanningProcessListContextProps = {
  setPagination: ({ page }: { page: number }) => void
  activateMinMaxDistrict: {
    open: boolean
    ids: number[]
  }
  setActivateMinMaxDistrict: (activateMinMaxDistrict: { open: boolean; ids: number[] }) => void
  setActivateMinMaxProvince: (activateMinMaxProvince: boolean) => void
  handleActivateMinMaxDistrict: () => void
  datasourceProvince?: ListAnnualPlanningProcessProvinceResponse
  program_plan_year: any
  province_id: any
  provinceName?: string
  filter: {
    getValues: () => void
    reset: () => void
    renderField: () => ReactNode
    renderActiveFilter: () => ReactNode
    handleSubmit: () => void
  }
}

export const AnnualPlanningProcessListContext = createContext<AnnualPlanningProcessListContextProps>({
  setPagination: () => { },
  activateMinMaxDistrict: {
    open: false,
    ids: []
  },
  setActivateMinMaxDistrict: () => { },
  setActivateMinMaxProvince: () => { },
  handleActivateMinMaxDistrict: () => { },
  datasourceProvince: {
    list_pagination: [],
    total_item: 0,
    total_page: 0,
    page: 1,
    item_per_page: 10,
    data: {
      province_entity: {
        id: 0,
        name: '',
        min_max_status_province: MinMaxStatusProvinceRegency.INACTIVE,
        min_max_status_regency: MinMaxStatusProvinceRegency.INACTIVE,
        can_activated_province: false,
        can_activated_regency: false,
        activated_province_date: null,
        activated_regency_date: null
      },
      annual_needs: []
    }
  },
  program_plan_year: undefined,
  province_id: undefined,
  filter: {
    getValues: () => { },
    reset: () => { },
    renderField: () => [],
    renderActiveFilter: () => [],
    handleSubmit: () => { },
  }
})
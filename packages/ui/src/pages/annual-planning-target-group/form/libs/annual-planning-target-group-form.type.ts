import { TFunction } from 'i18next'
import { FieldError, FieldPath, FieldValues } from 'react-hook-form'

export type AnnualPlanningTargetGroupFormData = {
  title: string | null
  from_age: {
    year: string | null
    month: string | null
    day: string | null
  }
  to_age: {
    year: string | null
    month: string | null
    day: string | null
  }
  // program_ids: number[]
}

export type AnnualPlanningTargetGroupSubmitData = {
  title: string
  from_year: number
  from_month: number
  from_day: number
  to_year: number
  to_month: number
  to_day: number
}

export type AnnualPlanningTargetGroupProgramChildFormData = {
  target_group_child: {
    label: string
    value: number | null
  }
} | null

export type AnnualPlanningTargetGroupProgramFormData = {
  target_group: Array<AnnualPlanningTargetGroupProgramChildFormData>
}

export type AnnualPlanningTargetGroupProgramSubmitData = Array<number>

export type TUseSubmitAnnualPlanningTargetGroupReturnProps = {
  t: TFunction<['common', 'annualPlanningTargetGroup']>
  language: string
  setError: <TFieldName extends FieldPath<FieldValues>>(
    name: TFieldName,
    error: FieldError,
    options?: {
      shouldFocus?: boolean
    }
  ) => void
}

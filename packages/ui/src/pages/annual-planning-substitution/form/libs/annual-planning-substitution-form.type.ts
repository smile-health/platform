import { OptionType } from '#components/react-select'
import { TFunction } from 'i18next'
import { FieldError, FieldPath, FieldValues } from 'react-hook-form'

export type AnnualPlanningSubstitutionFormData = {
  material: (OptionType & { subtype_id?: number }) | null
  substitution_materials: {
    substitution_material_child?: OptionType & { subtype_id?: number }
  }[]
}

export type AnnualPlanningSubstitutionSubmitData = {
  material_id: number
  substitution_material_ids: number[]
}

export type TUseSubmitAnnualPlanningSubstitutionReturnProps = {
  t: TFunction<['common', 'annualPlanningSubstitution']>
  language: string
  setError: <TFieldName extends FieldPath<FieldValues>>(
    name: TFieldName,
    error: FieldError,
    options?: {
      shouldFocus?: boolean
    }
  ) => void
}

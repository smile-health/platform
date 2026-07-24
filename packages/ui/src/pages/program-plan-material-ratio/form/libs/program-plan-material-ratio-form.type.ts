import { OptionType } from '#components/react-select'
import { TFunction } from 'i18next'
import { FieldError, FieldPath, FieldValues } from 'react-hook-form'

export type ProgramPlanMaterialRatioFormData = {
  from_material: {
    subtype: OptionType | null
    material: OptionType | null
    amount: number | ''
  }
  to_material: {
    subtype: OptionType | null
    material: OptionType | null
    amount: number | ''
  }
}

export type ProgramPlanMaterialRatioSubmitData = {
  program_plan_id: number
  from_material_id: number
  from_material_qty: number
  from_subtype_id: number
  to_material_id: number
  to_material_qty: number
  to_subtype_id: number
}

export type TUseSubmitProgramPlanMaterialRatioReturnProps = {
  t: TFunction<['common', 'programPlanMaterialRatio']>
  language: string
  setError: <TFieldName extends FieldPath<FieldValues>>(
    name: TFieldName,
    error: FieldError,
    options?: {
      shouldFocus?: boolean
    }
  ) => void
}

import { OptionType } from '#components/react-select'
import { TFunction } from 'i18next'

export type ProgramPlanSubmitData = {
  year: number
  approach_id: number
}

export type CopyItem =
  | 'target_group'
  | 'task'
  | 'material_ratio'
  | 'material_substitution'

export type ProgramPlanSubmitForm = {
  target_year: OptionType
  use_data_from_prev_year: boolean
  source_id: OptionType | null
  copy_items: string[]
}

export type TUseSubmitProgramPlanReturnProps = {
  t: TFunction<['common', 'programPlan']>
}

import { UseFilter } from '#components/filter'
import { KfaLevelEnum } from '#constants/material'
import { loadMaterial } from '#services/material'

type Params = {
  programId: string | number
}

export const programPlanRatioFilterSchema = ({
  programId,
}: Params): UseFilter => {
  return [
    {
      id: 'program_plan_ratio_material',
      type: 'select-async-paginate',
      name: 'material',
      label: 'Material',
      className: 'ui-w-full',
      placeholder: 'Select material',
      isMulti: true,
      multiSelectCounterStyle: 'normal',
      required: true,
      loadOptions: loadMaterial,
      additional: {
        page: 1,
        program_id: programId,
        material_level_id: KfaLevelEnum.KFA_92,
      },
      defaultValue: null,
    },
  ]
}

export default {}

import { UseFilter } from '#components/filter'
import { TFunction } from 'i18next'

import { generatedYearOptions } from '../../form/libs/program-plan-form.common'

type Params = {
  t: TFunction<['common', 'programPlan']>
}

export const programPlanFilterSchema = ({ t }: Params): UseFilter => {
  return [
    {
      id: 'program_plan_list_year',
      type: 'select',
      name: 'year',
      label: t('programPlan:table.year_plan'),
      placeholder: t('programPlan:placeholder.select_year_plan'),
      isMulti: false,
      className: '',
      defaultValue: null,
      options: generatedYearOptions(),
    },
  ]
}

export default {}

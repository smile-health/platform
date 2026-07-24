import { UseFilter } from '#components/filter'
import { BOOLEAN } from '#constants/common'
import { TFunction } from 'i18next'

import { loadPlannedMaterialOptions } from '../../services/annual-planning-substitution.services'

type Params = {
  t: TFunction<['common', 'annualPlanningSubstitution']>
  planId: number
}

export const annualPlanningSubstitutionFilterSchema = ({
  t,
  planId,
}: Params): UseFilter => [
  {
    id: 'annual_planning_substitution_planned_material_search',
    type: 'select-async-paginate',
    name: 'material_id',
    isMulti: false,
    label: t('annualPlanningSubstitution:table.planned_material'),
    placeholder: t('annualPlanningSubstitution:select_planned_material'),
    className: '',
    defaultValue: null,
    loadOptions: loadPlannedMaterialOptions,
    additional: {
      page: 1,
      plan_id: planId,
      is_for_filter: BOOLEAN.TRUE,
      is_planned_only: BOOLEAN.TRUE,
    },
  },
]

export default {}

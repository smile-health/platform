import { UseFilter } from '#components/filter'
import { TFunction } from 'i18next'

type Params = {
  t: TFunction<['common', 'annualPlanningTargetGroup']>
}

export const annualPlanningTargetGroupFilterSchema = ({ t }: Params): UseFilter => {
  return [
    {
      id: 'annual_planning_target_group_list_search',
      type: 'text',
      name: 'keyword',
      label: t('common:search'),
      placeholder: t('annualPlanningTargetGroup:search_by_keyword'),
      defaultValue: '',
    },
  ]
}

export default {}

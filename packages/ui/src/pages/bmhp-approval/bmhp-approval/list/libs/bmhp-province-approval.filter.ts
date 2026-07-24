import { UseFilter } from '#components/filter'

import { listBmhpPlanningYears } from '../../services/bmhp-planning.services'
import { TBmhpPlanningYear } from '../libs/bmhp-approval-list.type'

const CURRENT_YEAR = new Date().getFullYear()

type TFilterSchema = {
  t: (key: string) => string
}

export const provinceApprovalFilterSchema = ({
  t,
}: TFilterSchema): UseFilter => [
  {
    id: 'pa_keyword',
    type: 'text',
    name: 'keyword',
    label: t('common:search'),
    placeholder: t('bmhpApproval:province_approval.filter.keyword_placeholder'),
    className: 'ui-flex-1 ui-w-full',
    defaultValue: '',
  },
  {
    id: 'pa_program_plan',
    type: 'select-async-paginate',
    name: 'program_plan_id',
    label: t('bmhpApproval:target_adjustment.filter.year_label'),
    placeholder: t('bmhpApproval:target_adjustment.filter.year_placeholder'),
    className: 'ui-flex-1 ui-w-full',
    defaultValue: null,
    required: true,
    loadOptions: async (
      search: string,
      _: unknown,
      additional: { page: number }
    ) => {
      const result = await listBmhpPlanningYears({
        page: additional?.page || 1,
        paginate: 100,
        keyword: search || undefined,
        is_final: true,
      })
      const options =
        result?.data?.map((year: TBmhpPlanningYear) => ({
          value: year.id,
          label: String(year.year),
        })) || []

      // On first load without a search term, pre-select the current year
      if (!search && additional?.page === 1) {
        const currentYearOption = options.find(
          (opt: { value: number; label: string }) =>
            opt.label === String(CURRENT_YEAR)
        )
        if (currentYearOption) {
          ;(additional as any).__defaultOption = currentYearOption
        }
      }

      return {
        options,
        hasMore: (result?.data?.length || 0) >= 100,
        additional: { page: (additional?.page || 1) + 1 },
      }
    },
    additional: { page: 1 },
  },
]

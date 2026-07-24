import { UseFilter } from '#components/filter'
import { loadProvinces } from '#services/location'
import { TFunction } from 'i18next'

import { listBmhpPlanningYears } from '../../bmhp-approval/services/bmhp-planning.services'

type TFilterSchema = {
  t: TFunction<['bmhpApproval', 'common']>
}

export const bmhpApprovalMinistryFilterSchema = ({
  t,
}: TFilterSchema): UseFilter => [
  {
    id: 'ministry_program_plan',
    type: 'select-async-paginate',
    name: 'program_plan_id',
    label: t('bmhpApproval:label.title'),
    placeholder: t('bmhpApproval:ministry.filter.program_plan_placeholder'),
    className: 'ui-mb-4',
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
      return {
        options:
          result?.data?.map((year) => ({
            value: year.id,
            label: String(year.year),
          })) || [],
        hasMore: (result?.data?.length || 0) >= 100,
        additional: { page: (additional?.page || 1) + 1 },
      }
    },
    additional: { page: 1 },
  },
  {
    id: 'ministry_province',
    type: 'select-async-paginate',
    name: 'province',
    label: t('bmhpApproval:ministry.filter.province'),
    placeholder: t('bmhpApproval:ministry.filter.province_placeholder'),
    className: 'ui-mb-4',
    defaultValue: null,
    loadOptions: loadProvinces,
    additional: { page: 1 },
  },
  {
    id: 'ministry_status',
    type: 'select',
    name: 'status',
    label: t('bmhpApproval:ministry.filter.status'),
    placeholder: t('bmhpApproval:ministry.filter.status_placeholder'),
    className: 'ui-mb-4',
    defaultValue: null,
    isMulti: false,
    options: [
      {
        value: 1,
        label: t('bmhpApproval:ministry.status.submitted', { defaultValue: 'Dikirim' }),
      },
      {
        value: 0,
        label: t('bmhpApproval:ministry.status.not_submitted', { defaultValue: 'Belum dikirim' }),
      },
    ],
  },
]

import { UseFilter } from '#components/filter'
import { loadRegencies } from '#services/location'

import { listBmhpPemeriksaan } from '../../../../../bmhp/bmhp-pemeriksaan/list/master.service'
import { listBmhpPlanningYears } from '../../../services/bmhp-planning.services'

type TFilterSchema = {
  t: (key: string) => string
  provinceId?: string | number
}

export const targetAdjustmentFilterSchema = ({
  t,
  provinceId,
}: TFilterSchema): UseFilter => [
  {
    id: 'ta_keyword',
    type: 'text',
    name: 'keyword',
    label: t('search'),
    placeholder: t('bmhpApproval:target_adjustment.filter.keyword_placeholder'),
    className: 'ui-mb-4',
    defaultValue: '',
  },
  {
    id: 'ta_program_plan',
    type: 'select-async-paginate',
    name: 'program_plan_id',
    label: t('bmhpApproval:target_adjustment.filter.year_label'),
    placeholder: t('bmhpApproval:target_adjustment.filter.year_placeholder'),
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
    id: 'ta_examination',
    type: 'select-async-paginate',
    name: 'examination',
    isMulti: true,
    label: t('bmhpApproval:target_adjustment.filter.examination_label'),
    placeholder: t(
      'bmhpApproval:target_adjustment.filter.examination_placeholder'
    ),
    className: 'ui-mb-4',
    defaultValue: null,
    loadOptions: async (
      search: string,
      _: unknown,
      additional: { page: number }
    ) => {
      const result = await listBmhpPemeriksaan({
        page: additional?.page || 1,
        paginate: 50,
        keyword: search || undefined,
        is_active: 1,
      })
      return {
        options:
          result?.data?.map((item) => ({
            value: item.id,
            label: item.name,
          })) || [],
        hasMore: (result?.data?.length || 0) >= 50,
        additional: { page: (additional?.page || 1) + 1 },
      }
    },
    additional: { page: 1 },
  },
  {
    id: 'ta_regency',
    type: 'select-async-paginate',
    name: 'regency',
    label: t('form.city.label'),
    placeholder: t('form.city.placeholder'),
    className: 'ui-mb-4',
    defaultValue: null,
    required: true,
    loadOptions: async (
      search: string,
      _: unknown,
      additional: { page: number; parent_id?: number }
    ) => {
      return loadRegencies(search, _, {
        page: additional.page,
        parent_id: additional.parent_id || 0,
      })
    },
    additional: {
      page: 1,
      parent_id: provinceId || 0,
    },
  },
]

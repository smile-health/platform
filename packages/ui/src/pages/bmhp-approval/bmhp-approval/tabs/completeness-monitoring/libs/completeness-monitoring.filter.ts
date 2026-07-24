import { UseFilter } from '#components/filter'
import { TFunction } from 'i18next'

import { listBmhpPemeriksaan } from '../../../../../bmhp/bmhp-pemeriksaan/list/master.service'
import { loadMaterialNeedsEntities } from '../../need-calculation-result/services/need-calculation-result.service'

type TFilterSchema = {
  regencyId?: string
  programPlanId?: number
  t: TFunction<['bmhpApproval', 'common']>
}

export const completenessMonitoringFilterSchema = ({
  regencyId,
  programPlanId,
  t,
}: TFilterSchema): UseFilter => [
  {
    id: 'completeness_examination_filter',
    type: 'select-async-paginate',
    name: 'examination_ids',
    label: t('bmhpApproval:completeness.filter_examination'),
    placeholder: t('bmhpApproval:completeness.filter_examination'),
    className: 'ui-mb-4',
    defaultValue: null,
    isMulti: true,
    loadOptions: async (
      search: string,
      _: unknown,
      additional: { page: number }
    ) => {
      const result = await listBmhpPemeriksaan({
        paginate: 50,
        keyword: search || undefined,
        ...additional,
      })
      return {
        options:
          result?.data?.map((item) => ({
            value: item.id,
            label: item.name,
          })) ?? [],
        hasMore: (result?.data?.length ?? 0) >= 50,
        additional: { page: (additional?.page || 1) + 1 },
      }
    },
    additional: { page: 1, is_active: 1, program_plan_id: programPlanId },
  },
  {
    id: 'completeness_entity_filter',
    type: 'select-async-paginate',
    name: 'entity_ids',
    label: t('bmhpApproval:completeness.filter_faskes'),
    placeholder: t('bmhpApproval:completeness.filter_faskes'),
    className: 'ui-mb-4',
    defaultValue: null,
    isMulti: true,
    loadOptions: async (
      search: string,
      _: unknown,
      additional: { page: number }
    ) => {
      return loadMaterialNeedsEntities(search, _, {
        regency_ids: regencyId,
        ...additional,
      }) //core/master/regencies
    },
    additional: { page: 1, entity_tag_ids: 9 },
  },
  {
    id: 'completeness_status_filter',
    type: 'switch',
    name: 'show_not_submitted',
    label: t('bmhpApproval:completeness.filter_show_not_submitted'),
    className: 'ui-mb-4',
    defaultValue: 0,
    callBack: ({ setValue, value }) => {
      // Toggle between 0 (OFF) and 1 (ON)
      setValue('show_not_submitted', value === 1 ? 0 : 1)
    },
  },
]

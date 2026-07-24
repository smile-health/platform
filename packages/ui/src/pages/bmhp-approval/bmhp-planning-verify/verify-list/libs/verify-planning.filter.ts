import { UseFilter } from '#components/filter'
import { loadRegencies } from '#services/location'
import { TFunction } from 'i18next'

import { listBmhpPemeriksaan } from '../../../../bmhp/bmhp-pemeriksaan/list/master.service'
import { listBmhpPlanningYears } from '../../services/bmhp-planning.services'

type TFilterSchema = {
  t: TFunction
  provinceId?: string | number
}

/**
 * Filter schema for verify planning page
 * Includes: Program Plan (Year), Examination, and Regency
 * Regency is scoped to the logged-in user's province via provinceId.
 */
export const verifyPlanningFilterSchema = ({
  t,
  provinceId,
}: TFilterSchema): UseFilter => [
  {
    id: 'verify_planning_keyword',
    type: 'text',
    name: 'keyword',
    label: t('search'),
    placeholder: t('search_by', 'Cari berdasarkan nama entitas...'),
    className: 'ui-mb-4',
    defaultValue: '',
  },
  {
    id: 'verify_planning_program_plan',
    type: 'select-async-paginate',
    name: 'program_plan_id',
    label: 'Tahun',
    placeholder: 'Pilih Tahun',
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
        additional: {
          page: (additional?.page || 1) + 1,
        },
      }
    },
    additional: {
      page: 1,
    },
  },
  {
    id: 'verify_planning_examination',
    type: 'select-async-paginate',
    name: 'examination',
    label: 'Pemeriksaan',
    isMulti: true,
    placeholder: 'Pilih Pemeriksaan',
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
        additional: {
          page: (additional?.page || 1) + 1,
        },
      }
    },
    additional: {
      page: 1,
    },
  },
  // {
  //   id: 'verify_planning_province',
  //   type: 'select-async-paginate',
  //   name: 'province',
  //   label: t('form.province.label'),
  //   placeholder: t('form.province.placeholder'),
  //   className: 'ui-mb-4',
  //   defaultValue: null,
  //   required: true,
  //   clearOnChangeFields: ['regency'],
  //   loadOptions: loadProvinces,
  //   additional: {
  //     page: 1,
  //   },
  // },
  {
    id: 'verify_planning_regency',
    type: 'select-async-paginate',
    name: 'regency',
    label: t('form.city.label'),
    placeholder: t('form.city.placeholder'),
    className: 'ui-mb-4',
    defaultValue: null,
    required: true,
    // disabled: ({ getReactSelectValue }) => !getReactSelectValue('province'),
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

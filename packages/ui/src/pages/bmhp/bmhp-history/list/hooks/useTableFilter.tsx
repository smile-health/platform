import { UseFilter, useFilter } from '#components/filter'
import { loadEntities } from '#services/entity'
import { loadProvinces, loadRegencies } from '#services/location'
import { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

import { listBmhpPemeriksaan } from '../../../bmhp-pemeriksaan/list/master.service'
import { generatedYearOptions } from '../../../bmhp-planning/libs/bmhp-planning.common'

const statusLoadOption = () => {
  // DRAFT, SUBMITTED, APPROVED, REJECTED
  return [
    { value: 'DRAFT', label: 'Draft' },
    { value: 'SUBMITTED', label: 'Submitted' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
  ]
}

export function masterTableFilter(t: TFunction<['common', 'masterBmhp']>) {
  return [
    {
      id: 'year',
      type: 'select',
      name: 'year',
      label: t('masterBmhp:label.year'),
      placeholder: t('masterBmhp:placeholder.year'),
      className: 'ui-mb-4',
      loadOptions: async () => generatedYearOptions(),
      defaultValue: null,
    },
    {
      type: 'select-async-paginate',
      name: 'examination_id',
      label: t('masterBmhp:label.examination'),
      placeholder: t('masterBmhp:placeholder.examination'),
      className: 'ui-mb-4',
      defaultValue: null,
      onChange: (value: unknown) => value,
      loadOptions: async (
        search: string,
        _: unknown,
        additional: { page: number }
      ) => {
        const paramsFilter = {
          page: additional?.page || 1,
          paginate: 100,
          keyword: search || '',
        }

        const result = await listBmhpPemeriksaan(paramsFilter)
        return {
          options: result.data.map((x) => ({
            value: x.id,
            label: x.name,
          })),
          hasMore: result.data.length >= 100,
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
      id: 'status',
      type: 'select',
      name: 'status',
      label: t('masterBmhp:label.status'),
      placeholder: t('masterBmhp:placeholder.status'),
      className: 'ui-mb-4',
      loadOptions: async () => statusLoadOption(),
      defaultValue: null,
    },
    {
      id: 'province',
      type: 'select-async-paginate',
      name: 'province',
      label: t('common:form.province.label'),
      placeholder: t('common:form.province.placeholder'),
      className: 'ui-mb-4',
      defaultValue: null,
      clearOnChangeFields: ['regency', 'puskesmas'],
      loadOptions: loadProvinces,
      additional: {
        page: 1,
      },
    },
    {
      id: 'regency',
      type: 'select-async-paginate',
      name: 'regency',
      label: t('common:form.city.label'),
      placeholder: t('common:form.city.placeholder'),
      className: 'ui-mb-4',
      defaultValue: null,
      clearOnChangeFields: ['puskesmas'],
      disabled: ({ getReactSelectValue }) => !getReactSelectValue('province'),
      loadOptions: async (
        search: string,
        _: unknown,
        additional: { page: number; parent_id: string | number }
      ) => loadRegencies(search, _, additional),
      additional: ({ getReactSelectValue }) => ({
        page: 1,
        parent_id: getReactSelectValue('province') ?? '',
      }),
    },
    {
      id: 'puskesmas',
      type: 'select-async-paginate',
      name: 'puskesmas',
      label: t('common:form.primary_health_care.label'),
      placeholder: t('common:form.primary_health_care.placeholder'),
      className: 'ui-mb-4',
      defaultValue: null,
      disabled: ({ getReactSelectValue }) => !getReactSelectValue('regency'),
      loadOptions: loadEntities,
      additional: ({ getReactSelectValue }) => ({
        page: 1,
        province_ids: String(getReactSelectValue('province') ?? ''),
        regency_ids: String(getReactSelectValue('regency') ?? ''),
        isGlobal: true,
      }),
    },
  ] satisfies UseFilter
}

export const useTableFilter = () => {
  const { t } = useTranslation(['common', 'masterBmhp'])
  const filter = useFilter(masterTableFilter(t))

  return { filter }
}

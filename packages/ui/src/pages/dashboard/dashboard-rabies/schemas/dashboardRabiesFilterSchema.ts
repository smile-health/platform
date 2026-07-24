import { UseFilter } from '#components/filter'
import { BOOLEAN } from '#constants/common'
import { ENTITY_TAG, ENTITY_TYPE } from '#constants/entity'
import { loadEntities, loadEntityTags } from '#services/entity'
import { loadProvinces, loadRegencies } from '#services/location'
import { hasPermission } from '#shared/permission/index'
import { getUserStorage } from '#utils/storage/user'
import dayjs from 'dayjs'
import { TFunction } from 'i18next'
import { filterOfUser } from '../../dashboard.helper'
import { RequestloginResponse } from '#types/auth'

export default function dashboardRabiesFilterSchema(
  t: TFunction<'dashboardRabies'>,
  lang?: string
) {
  const firstJanuaryThisYear = dayjs().startOf('year').format('YYYY-MM-DD')
  const isPermittedToFilter = hasPermission('dashboard-rabies-main-filter')
  const user = getUserStorage()

  const useInitialProvince = Boolean(user?.entity?.province)
  const useInitialRegency = Boolean(user?.entity?.regency)
  const isDisableProvince = isPermittedToFilter && useInitialProvince
  const isDisableRegency = isPermittedToFilter && useInitialRegency
  const { defaultProvince, defaultRegency } = filterOfUser(
        user as RequestloginResponse
      )

  return [
    {
      id: 'period',
      type: 'date-range-picker',
      name: 'period',
      label: t('form.date_range.label'),
      clearable: false,
      withPreset: true,
      multicalendar: true,
      defaultValue: {
        start: firstJanuaryThisYear,
        end: dayjs().format('YYYY-MM-DD'),
      },
    },
    {
      id: 'select-entity-tag',
      type: 'select-async-paginate',
      name: 'entity_tags',
      label: t('form.entity_tag.label'),
      placeholder: t('form.entity_tag.placeholder'),
      loadOptions: loadEntityTags,
      additional: { page: 1, lang },
      isMulti: true,
      defaultValue: null,
    },
    {
      id: 'select-province',
      type: 'select-async-paginate',
      name: 'provinces',
      label: t('form.province.label'),
      placeholder: t('form.province.placeholder'),
      loadOptions: loadProvinces,
      disabled: isDisableProvince,
      clearOnChangeFields: ['regencies', 'entities'],
      isMulti: true,
      additional: { page: 1 },
      defaultValue: defaultProvince,
    },
    {
      id: 'select-regency',
      type: 'select-async-paginate',
      name: 'regencies',
      label: t('form.regency.label'),
      placeholder: t('form.regency.placeholder'),
      disabled: ({ getValue }) =>
        !getValue('provinces') ||
        getValue('provinces')?.length === 0 ||
        isDisableRegency,
      loadOptions: loadRegencies,
      isMulti: true,
      clearOnChangeFields: ['entities'],
      additional: ({ getReactSelectValue }) => ({
        parent_id: getReactSelectValue('provinces'),
        page: 1,
      }),
      defaultValue: defaultRegency,
    },
    {
      id: 'select-entity',
      type: 'select-async-paginate',
      name: 'entities',
      label: t('form.primary_health_care.label'),
      placeholder: t('form.primary_health_care.placeholder'),
      loadOptions: loadEntities,
      isMulti: true,
      disabled: ({ getValue }) =>
        !getValue('regencies') || getValue('regencies')?.length === 0,
      additional: ({ getReactSelectValue }) => ({
        page: 1,
        is_vendor: BOOLEAN.TRUE,
        type_ids: ENTITY_TYPE.FASKES,
        entity_tag_ids: ENTITY_TAG.PUSKESMAS,
        province_ids: getReactSelectValue('provinces'),
        regency_ids: getReactSelectValue('regencies'),
      }),
      defaultValue: null,
    },
  ] satisfies UseFilter
}

import { UseFilter } from '#components/filter'
import { OptionType } from '#components/react-select'
import { BOOLEAN } from '#constants/common'
import { ProgramEnum } from '#constants/program'
import { loadActivityOptions } from '#services/activity'
import { loadEntities, loadEntityTags } from '#services/entity'
import { loadProvinces, loadRegencies } from '#services/location'
import { loadMaterial, loadMaterialType } from '#services/material'
import { hasPermission } from '#shared/permission/index'
import { getProgramStorage } from '#utils/storage/program'
import { getUserStorage } from '#utils/storage/user'
import dayjs from 'dayjs'
import { TFunction } from 'i18next'

import { getDefaultImmunizationActivities } from '../../../dashboard/dashboard.constant'

export default function userActivityFilterSchema(
  t: TFunction<'userActivity'>,
  tDashboard: TFunction<'dashboard'>,
  lang?: string,
  isShowCustomerActivity = false
) {
  const isManager = hasPermission('report-manager-location-filter')
  const user = getUserStorage()
  const program = getProgramStorage()

  const useInitialProvince = Boolean(user?.entity?.province)
  const useInitialRegency = Boolean(user?.entity?.regency)
  const isDisableProvince = isManager && useInitialProvince
  const isDisableRegency = isManager && useInitialRegency
  const provinceInitialOption = {
    label: user?.entity?.province?.name ?? '',
    value: user?.entity?.province?.id,
  }
  const regencyInitialOption = {
    label: user?.entity?.regency?.name ?? '',
    value: user?.entity?.regency?.id,
  }

  const defaultActivities =
    program?.key === ProgramEnum.Immunization
      ? getDefaultImmunizationActivities(tDashboard)[0]
      : null

  return [
    {
      id: 'periode-date',
      type: 'month-year-picker',
      name: 'periode',
      label: t('form.period.label'),
      placeholder: t('form.period.placeholder'),
      defaultValue: {
        start: dayjs().startOf('month').format('YYYY-MM-DD'),
        end: dayjs().endOf('month').format('YYYY-MM-DD'),
      },
    },
    {
      id: 'select-activity',
      type: 'select-async-paginate',
      name: 'activity',
      label: t('form.activity.label'),
      placeholder: t('form.activity.placeholder'),
      loadOptions: loadActivityOptions,
      additional: { page: 1 },
      defaultValue: defaultActivities,
    },
    {
      id: 'select-material-type',
      type: 'select-async-paginate',
      name: 'material_type',
      label: t('form.material.type.label'),
      placeholder: t('form.material.type.placeholder'),
      loadOptions: loadMaterialType,
      additional: {
        page: 1,
      },
      defaultValue: null,
    },
    {
      id: 'select-material-name',
      type: 'select-async-paginate',
      name: 'material',
      label: t('form.material.name.label'),
      placeholder: t('form.material.name.placeholder'),
      loadOptions: loadMaterial,
      additional: ({ getReactSelectValue }) => ({
        page: 1,
        status: 1,
        activity_id: getReactSelectValue('activity'),
        material_type_ids: getReactSelectValue('material_type'),
        material_level_id: '3',
        program_id: program?.id,
      }),
      defaultValue: null,
    },
    {
      id: 'select-province',
      type: 'select-async-paginate',
      name: 'province',
      label: t('form.province.label'),
      placeholder: t('form.province.placeholder'),
      loadOptions: loadProvinces,
      disabled: isDisableProvince,
      clearOnChangeFields: ['regency', 'entity'],
      additional: { page: 1 },
      defaultValue: useInitialProvince ? provinceInitialOption : null,
    },
    {
      id: 'select-regency',
      type: 'select-async-paginate',
      name: 'regency',
      label: t('form.regency.label'),
      placeholder: t('form.regency.placeholder'),
      disabled: ({ getValue }) => !getValue('province') || isDisableRegency,
      loadOptions: loadRegencies,
      clearOnChangeFields: ['entity'],
      additional: ({ getReactSelectValue }) => ({
        parent_id: getReactSelectValue('province'),
        page: 1,
      }),
      defaultValue: useInitialRegency ? regencyInitialOption : null,
    },
    {
      id: 'select-primary-health-care',
      type: 'select-async-paginate',
      name: 'entity',
      label: t('form.health_facilities.label'),
      placeholder: t('form.health_facilities.placeholder'),
      loadOptions: loadEntities,
      clearOnChangeFields: ['entity_tags'],
      disabled: ({ getValue }) => {
        const entityTags = getValue('entity_tags') as OptionType[]
        return entityTags?.length > 0
      },
      additional: ({ getReactSelectValue }) => ({
        page: 1,
        is_vendor: 1,
        type_ids: 3,
        province_ids: getReactSelectValue('province'),
        regency_ids: getReactSelectValue('regency'),
      }),
      defaultValue: null,
    },
    {
      id: 'select-entity-tag',
      type: 'select-async-paginate',
      name: 'entity_tags',
      label: t('form.entity_tag.label'),
      placeholder: t('form.entity_tag.placeholder'),
      loadOptions: loadEntityTags,
      additional: { page: 1, lang },
      clearOnChangeFields: ['entity'],
      disabled: ({ getValue }) => {
        const entity = getValue('entity') as OptionType
        return !!entity?.value
      },
      isMulti: true,
      defaultValue: null,
    },
    {
      id: 'customer-activity',
      type: 'switch',
      name: 'is_customer_activity',
      label: t('form.show_customer_activity.label'),
      size: 'lg',
      hidden: !isShowCustomerActivity,
      yesLabel: '',
      noLabel: '',

      labelInside: {
        on: t('yes'),
        off: t('no'),
      },
      callBack: ({ setValue, value }) => {
        setValue(
          'is_customer_activity',
          value === BOOLEAN.FALSE ? BOOLEAN.TRUE : BOOLEAN.FALSE
        )

        setValue(
          'customer_tags',
          value === BOOLEAN.TRUE
            ? null
            : [
                {
                  label: t('community_health_post'),
                  value: 13,
                },
              ]
        )
      },
    },
    {
      id: 'select-customer-tag',
      type: 'select-async-paginate',
      name: 'customer_tags',
      label: t('form.customer_tag.label'),
      placeholder: t('form.customer_tag.placeholder'),
      loadOptions: loadEntityTags,
      additional: { page: 1, lang },
      hidden: !isShowCustomerActivity,
      disabled: ({ getValue }) => {
        const isCustomerActivity = getValue('is_customer_activity')
        return isCustomerActivity ? isCustomerActivity === BOOLEAN.FALSE : true
      },
      isMulti: true,
      defaultValue: null,
    },
  ] satisfies UseFilter
}

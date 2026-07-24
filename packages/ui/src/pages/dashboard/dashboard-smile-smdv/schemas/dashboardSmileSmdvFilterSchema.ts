import { UseFilter } from '#components/filter'
import { ProgramEnum } from '#constants/program'
import { loadActivityOptions } from '#services/activity'
import { loadEntities, loadEntityTags } from '#services/entity'
import { loadProvinces, loadRegencies } from '#services/location'
import { loadMaterial, loadMaterialType } from '#services/material'
import { getProgramStorage } from '#utils/storage/program'
import dayjs from 'dayjs'
import { TFunction } from 'i18next'

import { MATERIAL_LEVEL } from '../../../material/utils/material.constants'
import { getDefaultImmunizationActivities } from '../../dashboard.constant'
import {
  DefaultDashboardSelection,
  getOrderStatusList,
} from '../dashboard-smile-smdv.constant'

export default function dashboardSmileSmdvFilterSchema(
  t: TFunction<['dashboardSmileSmdv']>,
  tDashboard: TFunction<['dashboard']>,
  tOrder: TFunction<['common', 'order', 'orderList']>,
  lang?: string,
  defaultDashboard?: DefaultDashboardSelection,
  activeProgramId?: number
) {
  const program = getProgramStorage()
  const defaultActivities =
    program?.key === ProgramEnum.Immunization
      ? getDefaultImmunizationActivities(tDashboard)[0]
      : null

  return [
    {
      id: 'date-range-period',
      type: 'date-range-picker',
      name: 'period',
      label: t('form.period.label'),
      withPreset: true,
      multicalendar: true,
      defaultValue: {
        start: dayjs().startOf('year').format('YYYY-MM-DD'),
        end: dayjs().format('YYYY-MM-DD'),
      },
    },
    {
      id: 'select-material-type',
      type: 'select-async-paginate',
      name: 'material_type_id',
      label: t('form.material_type.label'),
      placeholder: t('form.material_type.placeholder'),
      loadOptions: loadMaterialType,
      clearOnChangeFields:
        defaultDashboard === DefaultDashboardSelection.SMDV_VS_SMILE
          ? ['biofarma_material_id']
          : ['material_id'],
      additional: { page: 1 },
      defaultValue: null,
    },
    {
      id: 'select-material-smile',
      type: 'select-async-paginate',
      name: 'material_ids',
      label: t('form.material_name.smile.label'),
      placeholder: t('form.material_name.smile.placeholder'),
      loadOptions: loadMaterial,
      additional: ({ getReactSelectValue }) => ({
        page: 1,
        status: 2,
        material_type_ids: getReactSelectValue('material_type_id'),
        program_id: activeProgramId,
        material_level_id: MATERIAL_LEVEL.TRADEMARK,
      }),
      isMulti: true,
      defaultValue: null,
      clearOnChangeFields: ['biofarma_material_name'],
    },
    {
      id: 'select-province',
      type: 'select-async-paginate',
      name: 'province_ids',
      label: t('form.province.label'),
      placeholder: t('form.province.placeholder'),
      loadOptions: loadProvinces,
      isMulti: true,
      clearOnChangeFields: ['regency_ids'],
      additional: { page: 1 },
      defaultValue: null,
    },
    {
      id: 'select-regency',
      type: 'select-async-paginate',
      name: 'regency_ids',
      isMulti: true,
      label: t('form.regency.label'),
      placeholder: t('form.regency.placeholder'),
      disabled: ({ getReactSelectValue }) =>
        !getReactSelectValue('province_ids'),
      loadOptions: loadRegencies,
      clearOnChangeFields: ['entity'],
      additional: ({ getReactSelectValue }) => ({
        parent_id: getReactSelectValue('province_ids'),
        page: 1,
      }),
      defaultValue: null,
    },
    {
      id: 'select-entity-tag',
      type: 'select-async-paginate',
      name: 'entity_tag_ids',
      label: t('form.entity_tag.label'),
      placeholder: t('form.entity_tag.placeholder'),
      loadOptions: loadEntityTags,
      isMulti: true,
      additional: { page: 1, lang },
      defaultValue: null,
    },
    {
      id: 'select-entity',
      type: 'select-async-paginate',
      name: 'entity_ids',
      label: t('form.entity.label'),
      placeholder: t('form.entity.placeholder'),
      loadOptions: loadEntities,
      isMulti: true,
      additional: ({ getReactSelectValue }) => ({
        page: 1,
        is_vendor: 1,
        type_ids: 3,
        province_ids: getReactSelectValue('province_ids'),
        regency_ids: getReactSelectValue('regency_ids'),
        entity_tag_ids: getReactSelectValue('entity_tag_ids'),
      }),
      defaultValue: null,
    },
    {
      id: 'select-activity',
      type: 'select-async-paginate',
      name: 'activity_id',
      label: t('form.activity.label'),
      placeholder: t('form.activity.placeholder'),
      loadOptions: loadActivityOptions,
      additional: () => ({
        page: 1,
      }),
      defaultValue: defaultActivities,
    },
    {
      id: 'select-order-status',
      type: 'select',
      name: 'order_status',
      label: t('form.order_status.label'),
      placeholder: t('form.order_status.placeholder'),
      options: getOrderStatusList(tOrder),
      defaultValue: null,
    },
  ] satisfies UseFilter
}

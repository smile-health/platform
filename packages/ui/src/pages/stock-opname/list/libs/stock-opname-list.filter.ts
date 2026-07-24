import { parseDate } from '@internationalized/date'
import { FilterFormSchema, UseFilter } from '#components/filter'
import { BOOLEAN } from '#constants/common'
import { ENTITY_TYPE } from '#constants/entity'
import { ProgramEnum } from '#constants/program'
import { loadActivityOptions } from '#services/activity'
import { loadEntities, loadEntityTags } from '#services/entity'
import { loadProvinces, loadRegencies } from '#services/location'
import {
  getMaterialLevels,
  loadMaterial,
  loadMaterialType,
} from '#services/material'
import { RequestloginResponse } from '#types/auth'
import { TProgram } from '#types/program'
import { getUserStorage } from '#utils/storage/user'
import dayjs from 'dayjs'
import { TFunction } from 'i18next'

import { getDefaultImmunizationActivities } from '../../../dashboard/dashboard.constant'
import { listPeriodOfStockTaking } from '../../../period-of-stock-taking/services/period-of-stock-taking.services'
import { filterOfUser } from './stock-opname-list.common'
import { MATERIAL_LEVEL } from './stock-opname-list.constants'

type Params = {
  t: TFunction<['common', 'stockOpname']>
  tDashboard: TFunction<'dashboard'>
  lang: string
  program?: TProgram
}

export const stockOpnameFilterSchema = ({
  t,
  tDashboard,
  lang,
  program,
}: Params): UseFilter => {
  const userEntity = getUserStorage()
  const { defaultProvince, defaultRegency } = filterOfUser(
    userEntity as RequestloginResponse
  )
  const defaultActivities =
    program?.key === ProgramEnum.Immunization
      ? getDefaultImmunizationActivities(tDashboard)[0]
      : null

  return [
    {
      id: 'stock__opname__list__period',
      type: 'select',
      name: 'period_id',
      isMulti: false,
      required: true,
      label: t('stockOpname:form.stock_taking_period.label'),
      placeholder: t('stockOpname:form.stock_taking_period.placeholder'),
      clearOnChangeFields: ['material_id'],
      loadOptions: async () => {
        const response = await listPeriodOfStockTaking({
          page: 1,
        })

        return (
          response?.data?.map((item) => ({
            label: item.name as string,
            value: item.id,
          })) ?? []
        )
      },
      defaultValue: null,
    },
    {
      id: 'stock__opname__list__activity',
      type: 'select-async-paginate',
      name: 'activity_id',
      isMulti: false,
      label: t('stockOpname:form.activity.label'),
      placeholder: t('stockOpname:form.activity.placeholder'),
      className: '',
      defaultValue: defaultActivities,
      clearOnChangeFields: ['material_id'],
      loadOptions: loadActivityOptions,
      additional: { page: 1, lang },
    },
    {
      id: 'stock__opname__list__material_type',
      type: 'select-async-paginate',
      name: 'material_type_id',
      isMulti: false,
      label: t('stockOpname:form.material_type.label'),
      placeholder: t('stockOpname:form.material_type.placeholder'),
      className: '',
      defaultValue: null,
      clearOnChangeFields: ['material_id'],
      loadOptions: loadMaterialType,
      additional: { page: 1, lang },
    },
    {
      id: 'stock__opname__list__kfa_level',
      type: 'select',
      name: 'material_level_id',
      isMulti: false,
      isClearable: false,
      hidden: !program?.config?.material?.is_hierarchy_enabled,
      required: program?.config?.material?.is_hierarchy_enabled,
      label: t('stockOpname:form.material_kfa_level.label'),
      placeholder: t('stockOpname:form.material_kfa_level.placeholder'),
      clearOnChangeFields: ['material_id'],
      loadOptions: async () => {
        const response = await getMaterialLevels({
          page: 1,
          paginate: 50,
          enable_only: BOOLEAN.TRUE,
        })

        return response?.data?.map((item) => ({
          label: item?.name,
          value: item?.id,
        }))
      },
      defaultValue: {
        value: MATERIAL_LEVEL.TEMPLATE,
        label: t('stockOpname:others.active_substance_and_strength'),
      },
    },
    {
      id: 'stock__opname__list__material',
      type: 'select-async-paginate',
      name: 'material_id',
      isMulti: false,
      label: t('stockOpname:form.material.label'),
      placeholder: t('stockOpname:form.material.placeholder'),
      className: '',
      defaultValue: null,
      loadOptions: loadMaterial,
      additional: ({ getReactSelectValue }: { getReactSelectValue: any }) => {
        return {
          page: 1,
          program_id: program?.id,
          is_with_activities: true,
          material_type_ids:
            getReactSelectValue('material_type_id')?.toString() ?? null,
          activity_id: getReactSelectValue('activity_id') ?? null,
          material_level_id: program?.config?.material?.is_hierarchy_enabled
            ? (getReactSelectValue('material_level_id') ?? null)
            : null,
          lang,
        }
      },
    },

    {
      id: 'stock__opname__list__batch_code',
      type: 'text',
      name: 'batch_code',
      label: t('stockOpname:form.batch.label'),
      placeholder: t('stockOpname:form.batch.placeholder'),
      className: '',
      defaultValue: '',
    },
    {
      id: 'stock__opname__list__entity_tag',
      type: 'select-async-paginate',
      name: 'entity_tag_id',
      label: t('stockOpname:form.entity_tag.label'),
      placeholder: t('common:all'),
      className: '',
      isMulti: false,
      defaultValue: null,
      loadOptions: loadEntityTags,
      additional: { page: 1, lang },
    },

    {
      id: 'stock__opname__list__expired_date_range',
      type: 'date-range-picker',
      name: 'expired_date_range',
      multicalendar: true,
      label: t('stockOpname:form.expired_date.label'),
      className: '',
      defaultValue: null,
    },

    {
      id: 'stock__opname__list__province_id',
      type: 'select-async-paginate',
      name: 'province_id',
      isMulti: false,
      label: t('common:form.province.label'),
      placeholder: t('common:form.province.placeholder'),
      loadOptions: loadProvinces,
      disabled: !!defaultProvince,
      clearOnChangeFields: ['regency_id', 'entity_id'],
      additional: { page: 1 },
      defaultValue: defaultProvince,
    } as FilterFormSchema,
    {
      id: 'stock__opname__list__regency_id',
      type: 'select-async-paginate',
      name: 'regency_id',
      isMulti: false,
      label: t('common:form.city.label'),
      placeholder: t('common:form.city.placeholder'),
      loadOptions: loadRegencies,
      disabled: ({ getReactSelectValue }) =>
        !getReactSelectValue('province_id') || !!defaultRegency,
      clearOnChangeFields: ['entity_id'],
      additional: ({ getReactSelectValue }: { getReactSelectValue: any }) => ({
        page: 1,
        ...(getReactSelectValue('province_id') && {
          parent_id: getReactSelectValue('province_id'),
        }),
      }),
      defaultValue: defaultRegency,
    },
    {
      id: 'stock__opname__list__entity_id',
      type: 'select-async-paginate',
      name: 'entity_id',
      isMulti: false,
      label: t('common:form.primary_health_care.label'),
      placeholder: t('common:form.primary_health_care.placeholder'),
      loadOptions: loadEntities,
      additional: ({ getReactSelectValue }: { getReactSelectValue: any }) => ({
        page: 1,
        province_ids: getReactSelectValue('province_id')?.toString() ?? null,
        regency_ids: getReactSelectValue('regency_id')?.toString() ?? null,
        type_ids: ENTITY_TYPE.FASKES.toString(),
        is_vendor: BOOLEAN.TRUE,
      }),
      defaultValue: null,
    },
    {
      id: 'stock__opname__list__created_at',
      type: 'date-range-picker',
      name: 'created_at_range',
      label: t('stockOpname:form.created_at.label'),
      className: '',
      multicalendar: true,
      maxValue: parseDate(
        dayjs(new Date()).add(1, 'day').format('YYYY-MM-DD')
      ).toString(),
      defaultValue: null,
    },
    {
      id: 'stock__opname__list__only_have_qty',
      type: 'switch',
      name: 'only_have_qty',
      label: t('stockOpname:form.show_stock_zero.label'),
      className: '',
      yesLabel: '',
      noLabel: '',
      size: 'lg',
      labelInside: {
        on: t('common:yes'),
        off: t('common:no'),
      },
      callBack: ({ setValue, value }) => {
        setValue(
          'only_have_qty',
          value === BOOLEAN.FALSE ? BOOLEAN.TRUE : BOOLEAN.FALSE
        )
      },
    },
  ]
}

export default {}

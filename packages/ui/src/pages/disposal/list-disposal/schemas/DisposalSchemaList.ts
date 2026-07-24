import { FilterFormSchema, UseFilter } from '#components/filter'
import { OptionType } from '#components/react-select'
import { ENTITY_TYPE } from '#constants/entity'
import { KfaLevelEnum } from '#constants/material'
import { ProgramEnum } from '#constants/program'
import { loadActivityOptions } from '#services/activity'
import { loadBatch } from '#services/batch'
import { loadEntities, loadEntityTags } from '#services/entity'
import { loadProvinces, loadRegencies } from '#services/location'
import { loadMaterialType } from '#services/material'
import { getProgramStorage } from '#utils/storage/program'
import { TFunction } from 'i18next'

import { getDefaultImmunizationActivities } from '../../../dashboard/dashboard.constant'
import { loadMaterial } from '../../disposal.services'

type Params = {
  t: TFunction<['common', 'disposalList']>
  tDashboard: TFunction<'dashboard'>
  isHierarchical: boolean
  optionUserEntity: OptionType[]
  isAdmin: boolean
  entityType: number
  initialFilter: {
    province: { value: number; label: string } | null
    regency: { value: number; label: string } | null
  }
}

export const createFilterSchema = ({
  t,
  tDashboard,
  isHierarchical,
  optionUserEntity,
  isAdmin,
  entityType,
  initialFilter,
}: Params): UseFilter => {
  const program = getProgramStorage()
  const defaultActivities =
    program?.key === ProgramEnum.Immunization
      ? getDefaultImmunizationActivities(tDashboard)[0]
      : null

  return [
    {
      id: 'select-activity',
      type: 'select-async-paginate',
      name: 'activity_id',
      label: t('disposalList:filter.label.activity'),
      placeholder: t('disposalList:filter.placeholder.activity'),
      className: '',
      defaultValue: defaultActivities,
      loadOptions: loadActivityOptions,
      additional: { page: 1 },
    },
    {
      id: 'select-material-type',
      type: 'select-async-paginate',
      name: 'material_type_id',
      label: t('disposalList:filter.label.material_type'),
      placeholder: t('disposalList:filter.placeholder.material_type'),
      className: '',
      defaultValue: null,
      loadOptions: loadMaterialType,
      additional: { page: 1 },
    },
    {
      id: 'select-material',
      type: 'select-async-paginate',
      name: 'material_id',
      label: isHierarchical
        ? t('disposalList:filter.label.material_hirearchy')
        : 'Material',
      placeholder: t('disposalList:filter.placeholder.material'),
      className: '',
      defaultValue: null,
      loadOptions: loadMaterial,
      clearOnChangeFields: ['batch_ids'],
      additional: () => ({
        page: 1,
        material_level_id: isHierarchical ? '2' : '3',
      }),
    },
    {
      id: 'select-batch',
      type: 'select-async-paginate',
      name: 'batch_ids',
      isMulti: true,
      label: 'Batch',
      placeholder: t('disposalList:filter.placeholder.batch'),
      className: '',
      defaultValue: null,
      loadOptions: loadBatch,
      additional: ({ getReactSelectValue }: { getReactSelectValue: any }) => ({
        page: 1,
        ...(getReactSelectValue('material_id') && {
          material_id: getReactSelectValue('material_id'),
          material_level_id: isHierarchical
            ? KfaLevelEnum.KFA_92
            : KfaLevelEnum.KFA_93,
        }),
      }),
    },
    {
      id: 'date-range-picker',
      type: 'date-range-picker',
      withPreset: true,
      multicalendar: true,
      name: 'expired_date',
      label: t('disposalList:filter.label.expired_date'),
      className: '',
      defaultValue: null,
    },
    {
      id: 'select-entity-user',
      type: 'select',
      name: 'entity_user_id',
      label: t('disposalList:filter.label.entity'),
      placeholder: t('disposalList:filter.placeholder.entity'),
      className: '',
      defaultValue: null,
      options: optionUserEntity,
      clearOnChangeFields: ['entity_id', 'primary_vendor_id'],
    },
    {
      id: 'select-entity-tag',
      type: 'select-async-paginate',
      name: 'entity_tag_id',
      label: t('disposalList:filter.label.entity_tag'),
      placeholder: t('disposalList:filter.placeholder.entity_tag'),
      className: '',
      defaultValue: null,
      loadOptions: loadEntityTags,
      additional: { page: 1 },
    },
    ...(isAdmin
      ? [
          {
            id: 'select-primary-vendor',
            type: 'select-async-paginate',
            name: 'primary_vendor_id',
            label: t('disposalList:filter.label.primary_vendor'),
            placeholder: t('disposalList:filter.placeholder.primary_vendor'),
            className: '',
            defaultValue: null,
            loadOptions: loadEntities,
            clearOnChangeFields: ['entity_id', 'entity_user_id'],
            additional: () => ({
              page: 1,
              type_ids: ENTITY_TYPE.PRIMARY_VENDOR,
            }),
          } as FilterFormSchema,
        ]
      : []),
    {
      id: 'select-province',
      type: 'select-async-paginate',
      name: 'province_id',
      label: t('disposalList:filter.label.province'),
      placeholder: t('disposalList:filter.placeholder.province'),
      disabled: () => entityType >= ENTITY_TYPE.PROVINSI && !isAdmin,
      loadOptions: loadProvinces,
      clearOnChangeFields: ['regency_id', 'entity_id'],
      additional: { page: 1 },
      defaultValue: initialFilter.province,
    },
    {
      id: 'select-regency',
      type: 'select-async-paginate',
      name: 'regency_id',
      label: t('disposalList:filter.label.city'),
      placeholder: t('disposalList:filter.placeholder.city'),
      loadOptions: loadRegencies,
      disabled: ({ getReactSelectValue }) =>
        !getReactSelectValue('province_id') ||
        (entityType >= ENTITY_TYPE.KOTA && !isAdmin),
      clearOnChangeFields: ['entity_id'],
      additional: ({ getReactSelectValue }: { getReactSelectValue: any }) => ({
        page: 1,
        ...(getReactSelectValue('province_id') && {
          parent_id: getReactSelectValue('province_id'),
        }),
      }),
      defaultValue: initialFilter.regency,
    },
    {
      id: 'select-health-center',
      type: 'select-async-paginate',
      name: 'entity_id',
      label: t('disposalList:filter.label.primary_health_care'),
      placeholder: t('disposalList:filter.placeholder.primary_health_care'),
      className: '',
      defaultValue: null,
      loadOptions: loadEntities,
      additional: ({ getReactSelectValue }: { getReactSelectValue: any }) => ({
        page: 1,
        is_vendor: 1,
        type: ENTITY_TYPE.FASKES,
        ...(getReactSelectValue('province_id') && {
          province_id: getReactSelectValue('province_id'),
        }),
        ...(getReactSelectValue('regency_id') && {
          regency_id: getReactSelectValue('regency_id'),
        }),
      }),
      clearOnChangeFields: ['primary_vendor_id', 'entity_user_id'],
    },
  ]
}

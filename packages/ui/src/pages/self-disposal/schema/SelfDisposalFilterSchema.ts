import { FilterFormSchema, UseFilter } from '#components/filter'
import { OptionType } from '#components/react-select'
import { ENTITY_TYPE } from '#constants/entity'
import { loadActivityOptions } from '#services/activity'
import { loadEntities, loadEntityTags } from '#services/entity'
import { loadProvinces, loadRegencies } from '#services/location'
import { loadMaterialType } from '#services/material'
import { hasPermission } from '#shared/permission/index'
import { getUserStorage } from '#utils/storage/user'
import { TFunction } from 'i18next'

import { ORDER_STATUS } from '../self-disposal.constant'
import { loadMaterial, loadMethodV2, loadReason } from '../self-disposal.service'
import { TRANSACTION_TYPE_TYPE } from '#constants/transaction'
import { KfaLevelEnum } from '#constants/material'


type InititalFilter = {
  province: { value: number; label: string } | null
  regency: { value: number; label: string } | null
}

type SelfDisposalFilterSchemaParams = {
  t: TFunction<'selfDisposal'>
  isHierarchical?: boolean
}
export default function selfDisposalFilterSchema({ t, isHierarchical }: SelfDisposalFilterSchemaParams) {
  const listOrderStatus: Array<OptionType> = [
    {
      value: ORDER_STATUS.shipped,
      label: t('order_status.shipped'),
    },
    {
      value: ORDER_STATUS.fulfilled,
      label: t('order_status.fulfilled'),
    },
    {
      value: ORDER_STATUS.cancelled,
      label: t('order_status.cancelled'),
    },
    {
      value: ORDER_STATUS.not_received,
      label: t('order_status.not_yet_received'),
    },
  ]

  const user = getUserStorage()
  //@ts-ignore
  const entityType = user.entity.type


  const isAdmin = hasPermission('disposal-self-view')

  let initialFilter: InititalFilter = { province: null, regency: null }

  if (!isAdmin && entityType && user) {
    if (entityType >= ENTITY_TYPE.PROVINSI && user.entity.province) {
      initialFilter.province = {
        value: Number(user.entity.province?.id),
        label: user.entity.province?.name,
      }
    }
    if (entityType >= ENTITY_TYPE.KOTA && user.entity.regency) {
      initialFilter.regency = {
        value: Number(user.entity.regency?.id),
        label: user.entity.regency?.name,
      }
    }
  }

  return [
    {
      id: 'self-disposal-filter-activity-id',
      type: 'select-async-paginate',
      name: 'activity_id',
      label: t('filter.activity'),
      placeholder: t('placeholder.activity'),
      loadOptions: loadActivityOptions,
      additional: { page: 1 },
      defaultValue: null,
    },
    {
      id: 'select-material-type',
      type: 'select-async-paginate',
      name: 'material_type_id',
      label: t('filter.material_type'),
      placeholder: t('placeholder.material_type'),
      className: '',
      defaultValue: null,
      loadOptions: loadMaterialType,
      additional: { page: 1 },
    },
    {
      id: 'select-material',
      type: 'select-async-paginate',
      name: 'material_id',
      isMulti: true,
      label: 'Material',
      placeholder: t('placeholder.material'),
      className: '',
      defaultValue: null,
      loadOptions: loadMaterial,
      additional: {
        page: 1,
        material_level_id: KfaLevelEnum.KFA_93,
      },
    },
    {
      id: 'date-range-picker',
      type: 'date-range-picker',
      name: 'date_range',
      withPreset: true,
      multicalendar: true,
      label: t('filter.created_at'),
      className: '',
      defaultValue: null,
    },
    {
      id: 'self-disposal-filter-entity-tags',
      type: 'select-async-paginate',
      name: 'entity_tag_id',
      label: t('filter.entity_tag'),
      placeholder: t('placeholder.entity_tag'),
      loadOptions: loadEntityTags,
      additional: { page: 1 },
      defaultValue: null,
    },
    ...(isAdmin
      ? [
        {
          id: 'select-primary-vendor',
          type: 'select-async-paginate',
          name: 'primary_vendor_id',
          label: t('filter.primary_vendor'),
          placeholder: t('placeholder.primary_vendor'),
          className: '',
          defaultValue: null,
          loadOptions: loadEntities,
          clearOnChangeFields: ['primary_health_care'],
          additional: () => ({
            page: 1,
            type_ids: ENTITY_TYPE.PRIMARY_VENDOR,
          }),
        } as FilterFormSchema,
      ]
      : []),

    {
      id: 'self-disposal-filter-province',
      type: 'select-async-paginate',
      name: 'province_id',
      isMulti: false,
      label: t('filter.province'),
      placeholder: t('placeholder.province'),
      className: '',
      loadOptions: loadProvinces,
      additional: () => ({
        page: 1,
      }),
      clearOnChangeFields: ['regency_id', 'primary_health_care'],
      defaultValue: initialFilter.province,
      disabled: entityType >= ENTITY_TYPE.PROVINSI && !isAdmin,
    },

    {
      id: 'self-disposal-filter-regency',
      type: 'select-async-paginate',
      name: 'regency_id',
      label: t('filter.city'),
      placeholder: t('placeholder.city'),
      className: '',
      defaultValue: initialFilter.regency,
      loadOptions: loadRegencies,
      disabled: ({ getReactSelectValue }) =>
        !getReactSelectValue('province_id') ||
        (entityType >= ENTITY_TYPE.KOTA && !isAdmin),
      clearOnChangeFields: ['primary_health_care'],
      additional: ({ getReactSelectValue }: { getReactSelectValue: any }) => ({
        page: 1,
        ...(getReactSelectValue('province_id') && {
          parent_id: getReactSelectValue('province_id'),
        }),
      }),
    },
    {
      id: 'select-health-center',
      type: 'select-async-paginate',
      name: 'primary_health_care',
      label: t('filter.primary_health_care'),
      placeholder: t('placeholder.primary_health_care'),
      className: '',
      defaultValue: null,
      loadOptions: loadEntities,
      additional: ({ getReactSelectValue }: { getReactSelectValue: any }) => ({
        page: 1,
        type_ids: ENTITY_TYPE.FASKES,
        is_vendor: 1,
        ...(getReactSelectValue('province_id') && {
          province_ids: getReactSelectValue('province_id'),
        }),
        ...(getReactSelectValue('regency_id') && {
          regency_ids: getReactSelectValue('regency_id'),
        }),
      }),
      clearOnChangeFields: ['primary_vendor_id'],
    },
    {
      id: 'self-disposal-filter-flow',
      type: 'select-async-paginate',
      name: 'disposal_method_id',
      label: t('filter.flow'),
      placeholder: t('placeholder.flow'),
      defaultValue: null,
      className: '',
      loadOptions: loadMethodV2,
      additional: { page: 1 }
    },
  ] satisfies UseFilter
}

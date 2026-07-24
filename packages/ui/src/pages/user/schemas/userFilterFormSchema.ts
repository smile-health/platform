import { FilterFormSchema, UseFilter } from '#components/filter'
import {
  noProgram,
  ProgramEnum,
  ProgramWasteManagement,
  WORKSPACE,
} from '#constants/program'
import { loadCoreEntities, loadEntities } from '#services/entity'
import { loadProvinces, loadRegencies } from '#services/location'
import { listPrograms } from '#services/program'
import { loadUserRoles } from '#services/user'
import { hasPermission } from '#shared/permission/index'
import { TFunction } from 'i18next'

export default function userFilterFormSchema(
  t: TFunction<['common', 'user']>,
  isGlobal = false
) {
  return [
    {
      id: 'input-search',
      type: 'text',
      name: 'keyword',
      label: t('user:form.name.label'),
      placeholder: t('user:form.name.placeholder'),
      defaultValue: '',
      maxLength: 255,
    },
    {
      id: 'select-role',
      type: 'select-async-paginate',
      name: 'role',
      label: t('user:form.role.label'),
      placeholder: t('user:form.role.placeholder'),
      loadOptions: loadUserRoles,
      isSearchable: false,
      defaultValue: null,
      additional: {
        page: 1,
      },
    },
    ...(hasPermission('program-global-view')
      ? [
          {
            type: 'select',
            name: 'program_ids',
            id: 'select-program',
            isMulti: true,
            hidden: !isGlobal,
            label: t('form.program.title'),
            placeholder: t('form.program.placeholder.select'),
            defaultValue: null,
            loadOptions: async () => {
              const response = await listPrograms({
                page: 1,
                paginate: 100,
              })

              const result =
                response?.data?.map((item) => ({
                  value: item?.id,
                  label: item?.name,
                })) || []

              const wasteManagementOption = {
                value: ProgramEnum.WasteManagement,
                label: WORKSPACE[ProgramEnum.WasteManagement].name,
              }

              return [noProgram(t), wasteManagementOption, ...result]
            },
          } as FilterFormSchema,
        ]
      : ([] as FilterFormSchema[])),
    ...(!isGlobal
      ? [
          {
            type: 'radio',
            name: 'status',
            label: 'Status',
            options: [
              {
                id: 'radio-status-active',
                label: t('common:status.active'),
                value: '1',
              },
              {
                id: 'radio-status-inactive',
                label: t('common:status.inactive'),
                value: '0',
              },
            ],
            defaultValue: '1',
          } as FilterFormSchema,
        ]
      : ([] as FilterFormSchema[])),
    {
      id: 'select-primary-vendor',
      type: 'select-async-paginate',
      name: 'primary_vendor',
      label: t('user:form.primary_vendor.label'),
      placeholder: t('user:form.primary_vendor.placeholder'),
      loadOptions: isGlobal ? loadCoreEntities : loadEntities,
      clearOnChangeFields: ['province', 'regency', 'primary_health_care'],
      additional: { page: 1, type_ids: 5 },
      defaultValue: null,
    },
    {
      id: 'select-province',
      type: 'select-async-paginate',
      name: 'province',
      isMulti: true,
      label: t('common:form.province.label'),
      placeholder: t('form.province.placeholder'),
      loadOptions: loadProvinces,
      clearOnChangeFields: ['primary-vendor', 'regency', 'primary_health_care'],
      additional: { page: 1 },
      defaultValue: null,
    },
    {
      id: 'select-regency',
      type: 'select-async-paginate',
      name: 'regency',
      isMulti: true,
      label: t('common:form.city.label'),
      placeholder: t('form.city.placeholder'),
      disabled: ({ getValue }) => !getValue('province'),
      loadOptions: loadRegencies,
      clearOnChangeFields: ['primary_vendor', 'primary_health_care'],
      additional: ({ getReactSelectValue }) => ({
        parent_id: getReactSelectValue('province'),
        page: 1,
      }),
      defaultValue: null,
    },
    {
      id: 'select-primary-health-care',
      type: 'select-async-paginate',
      name: 'primary_health_care',
      label: t('common:form.primary_health_care.label'),
      placeholder: t('common:form.primary_health_care.placeholder'),
      loadOptions: isGlobal ? loadCoreEntities : loadEntities,
      clearOnChangeFields: ['primary_vendor'],
      additional: ({ getReactSelectValue }) => ({
        page: 1,
        ...(!isGlobal ? { is_vendor: 1 } : {}),
        type_ids: 3,
        province_ids: getReactSelectValue('province'),
        regency_ids: getReactSelectValue('regency'),
      }),
      defaultValue: null,
    },
    {
      id: 'datepicker',
      type: 'date-range-picker',
      name: 'date_range',
      label: t('user:column.last.login'),
      defaultValue: null,
    },
  ] satisfies UseFilter
}

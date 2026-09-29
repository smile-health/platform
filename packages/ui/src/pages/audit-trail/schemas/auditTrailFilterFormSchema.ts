import { FilterFormSchema, UseFilter } from '#components/filter'
import { listPrograms } from '#services/program'
import { listUsers } from '#services/user'
import { hasPermission } from '#shared/permission/index'
import { TFunction } from 'i18next'

import {
  AUDIT_TRAIL_ACTIONS,
  AUDIT_TRAIL_MODULE_OPTIONS,
  AUDIT_TRAIL_SERVICES,
  toOptions,
} from '../audit-trail.constants'

export default function auditTrailFilterFormSchema(
  t: TFunction<['common', 'auditTrail']>
) {
  return [
    {
      id: 'select-service',
      type: 'select',
      name: 'service',
      label: t('auditTrail:form.service.label'),
      placeholder: t('auditTrail:form.service.placeholder'),
      options: toOptions(AUDIT_TRAIL_SERVICES).map((o) => ({
        ...o,
        label: o.value.toUpperCase(),
      })),
      isClearable: true,
      defaultValue: null,
    } as FilterFormSchema,
    {
      id: 'select-module',
      type: 'select',
      name: 'module',
      label: t('auditTrail:form.module.label'),
      placeholder: t('auditTrail:form.module.placeholder'),
      options: AUDIT_TRAIL_MODULE_OPTIONS,
      isClearable: true,
      defaultValue: null,
    } as FilterFormSchema,
    {
      id: 'select-action',
      type: 'select',
      name: 'action',
      label: t('auditTrail:form.action.label'),
      placeholder: t('auditTrail:form.action.placeholder'),
      options: toOptions(AUDIT_TRAIL_ACTIONS),
      isClearable: true,
      defaultValue: null,
    } as FilterFormSchema,
    {
      id: 'select-actor',
      type: 'select-async-paginate',
      name: 'actor_id',
      label: t('auditTrail:form.actor.label'),
      placeholder: t('auditTrail:form.actor.placeholder'),
      defaultValue: null,
      additional: { page: 1 },
      loadOptions: async (
        keyword: string,
        _: unknown,
        additional: { page: number }
      ) => {
        const result = await listUsers({
          page: additional?.page ?? 1,
          paginate: 25,
          keyword,
        })

        const options =
          result?.data?.map((item) => ({
            label: item?.username,
            value: item?.id,
          })) || []

        return {
          options,
          hasMore: false,
          additional: { page: (additional?.page ?? 1) + 1 },
        }
      },
    },
    ...(hasPermission('program-global-view')
      ? [
          {
            id: 'select-program',
            type: 'select-async-paginate',
            name: 'program_id',
            label: t('auditTrail:form.program.label'),
            placeholder: t('auditTrail:form.program.placeholder'),
            defaultValue: null,
            additional: { page: 1 },
            loadOptions: async () => {
              const response = await listPrograms({ page: 1, paginate: 100 })

              // BE `program_id` is a positive integer, so "no program" and the
              // waste-management workspace can't be sent.
              const options =
                response?.data?.map((item) => ({
                  value: item?.id,
                  label: item?.name,
                })) || []

              return {
                options,
                hasMore: false,
                additional: { page: 1 },
              }
            },
          } as FilterFormSchema,
        ]
      : ([] as FilterFormSchema[])),
    {
      id: 'datepicker',
      type: 'date-range-picker',
      name: 'date_range',
      label: t('auditTrail:form.date_range.label'),
      defaultValue: null,
    } as FilterFormSchema,
  ] satisfies UseFilter
}

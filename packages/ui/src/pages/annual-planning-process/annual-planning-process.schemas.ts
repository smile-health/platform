import { TFunction } from "i18next";
import * as yup from 'yup'

import { UseFilter } from "#components/filter";
import { OptionType } from "#components/react-select";

import { loadProvinces } from "#services/location";
import { loadProgramPlan } from "./annual-planning-process.services";
import { optionsStatus } from "./annual-planning-process.constants";

type CreateFilterSchema = {
  t: TFunction<['annualPlanningProcess', 'common']>
  defaultValueProvince: OptionType | null
  isSuperadmin?: boolean
}
export const createFilterSchema = ({
  t,
  defaultValueProvince,
  isSuperadmin,
}: CreateFilterSchema): UseFilter => [
    {
      id: 'select-program-plan',
      type: 'select-async-paginate',
      name: 'program_plan_year',
      label: t('annualPlanningProcess:list.filter.program_plan.label'),
      placeholder: t('annualPlanningProcess:list.filter.program_plan.placeholder'),
      loadOptions: loadProgramPlan,
      additional: { page: 1, key_value: 'year' },
      defaultValue: null,
      className: 'ui-w-full',
      required: true,
    },
    {
      id: 'select-province',
      type: 'select-async-paginate',
      name: 'province_id',
      label: t('common:form.province.label'),
      placeholder: t('common:form.province.placeholder'),
      loadOptions: loadProvinces,
      additional: { page: 1 },
      defaultValue: defaultValueProvince,
      className: 'ui-w-full',
      disabled: !isSuperadmin,
      required: true,
    },
    {
      id: 'select-status',
      type: 'select',
      name: 'status',
      label: 'Status',
      placeholder: t('annualPlanningProcess:list.filter.status.placeholder'),
      options: optionsStatus(t),
      className: 'ui-w-full',
      defaultValue: null,
    }
  ]

export const formSchemaArea = (t: TFunction<['annualPlanningProcess', 'common']>) => yup.object({
  province: yup
    .object({
      value: yup.number(),
      label: yup.string(),
    })
    .notRequired(),
  regency: yup
    .object({
      value: yup.number(),
      label: yup.string(),
    })
    .notRequired(),
  program_plan: yup
    .object({
      value: yup.number(),
      label: yup.string(),
    })
    .required(t('common:validation.required'))
    .test("not-empty", t('common:validation.required'), value => {
      return value && Object.keys(value).length > 0;
    }),
})

export const formSchemaPopulationCorrection = (t: TFunction<['annualPlanningProcess', 'common']>) => yup.object({
  data: yup.array().of(
    yup.object({
      data: yup.array().of(
        yup.object({
          change_qty: yup.number().nullable().min(0, t('common:validation.required')),
        })
      )
    })
  ).test(
    'at-least-one-change-qty',
    t('common:validation.required'),
    (data) => {
      if (!data || data.length === 0) return false
      return data.some((x) => {
        if (x.data?.some(y => typeof y.change_qty === 'number')) {
          return true
        }

        return false
      })
    }
  ),
})

export const formSchemaPopulationTarget = (t: TFunction<['annualPlanningProcess', 'common']>) => yup.object({
  data: yup.array().of(
    yup.object({
      change_qty: yup.number().nullable().min(0, t('common:validation.required')),
      qty: yup.number().nullable().notRequired(),
      percentage: yup.number().nullable().notRequired(),
    })
  ).test(
    'at-least-one-change-qty',
    t('common:validation.required'),
    (data) => {
      if (!data || data.length === 0) return false
      return data.some((x) => {
        if (typeof x.change_qty === 'number') {
          return true
        }

        return false
      })
    }
  ),
})

export const formSchemaDefineDistrictIP = (t: TFunction<['annualPlanningProcess', 'common']>, isMustAll?: boolean) => yup.object({
  data: yup.array().of(
    yup.object({
      sku: yup.number().nullable().notRequired(),
      district_ip: yup.number()
        .transform((value) =>
          isNaN(value) ? null : value
        )
        .nullable()
        .min(0, t('common:validation.required'))
        .test(
          'max-sku',
          t('annualPlanningProcess:create.form.district_ip.validation.district_ip'),
          (value, context) => {
            const { sku } = context.parent
            if (typeof value === 'number' && typeof sku === 'number') {
              return value <= sku
            }
            return true
          }
        ),
      status: yup.number().nullable()
    })
  ).required(t('common:validation.required')).test(
    'at-least-one-district-ip',
    t('common:validation.required'),
    (data) => {
      if (!data || data.length === 0) return false
      if (isMustAll) {
        return data.every((x) => typeof x.district_ip === 'number' || typeof x.status === 'number')
      }

      return data.some((x) => typeof x.district_ip === 'number')
    }
  ),
})

export const formSchemaFilterCalculationResult = yup.object({
  activity: yup
    .object({
      value: yup.number().required(),
      label: yup.string().required(),
    })
    .nullable().notRequired(),
  material: yup
    .object({
      value: yup.number().required(),
      label: yup.string().required(),
      material_subtype: yup.number().required(),
    })
    .nullable().notRequired(),
  entity: yup
    .object({
      value: yup.number().required(),
      label: yup.string().required(),
    })
    .nullable().notRequired(),
})

export const formSchemaReviewPopulationCorrection = yup.object({
  data: yup.array().of(
    yup.object({
      data: yup.array().of(
        yup.object({
          status: yup.number().notRequired(),
        })
      )
    })
  )
})

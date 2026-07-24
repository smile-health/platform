import { TFunction } from 'i18next'
import * as Yup from 'yup'

import { MAX_STRING_LENGTH } from '../monitoring-device-inventory.constants'

export const monitoringDeviceInventoryFormSchema = (
  t: TFunction<['common', 'monitoringDeviceInventoryForm']>
) => {
  return Yup.object().shape({
    asset_type_id: Yup.object()
      .nullable()
      .required(t('common:validation.required')),
    asset_model_id: Yup.object()
      .nullable()
      .required(t('common:validation.required')),
    manufacture_id: Yup.object()
      .nullable()
      .required(t('common:validation.required')),
    asset_vendor_id: Yup.object()
      .nullable()
      .required(t('common:validation.required')),
    asset_communication_provider: Yup.object()
      .nullable()
      .required(t('common:validation.required')),
    serial_number: Yup.string()
      .required(t('common:validation.required'))
      .max(
        MAX_STRING_LENGTH,
        t('common:validation.char.max', { char: MAX_STRING_LENGTH })
      ),
    production_year: Yup.object()
      .nullable()
      .required(t('common:validation.required'))
      .test(
        'production-year-less-than-budget-year',
        t(
          'monitoringDeviceInventoryForm:field.production_year.validation.production_year_must_be_less_than_budget_year'
        ),
        function (value: any) {
          const { budget_year } = this.parent
          if (!value || !budget_year) return true
          return Number(value.value) <= Number(budget_year.value)
        }
      ),
    asset_rtmd_status_id: Yup.object()
      .nullable()
      .required(t('common:validation.required')),
    entity_id: Yup.object()
      .nullable()
      .required(t('common:validation.required')),
    contact_person_user_1_name: Yup.string().required(
      t('common:validation.required')
    ),
    contact_person_user_1_number: Yup.string().required(
      t('common:validation.required')
    ),
    contact_person_user_2_name: Yup.string().notRequired(),
    contact_person_user_2_number: Yup.string().notRequired(),
    contact_person_user_3_name: Yup.string().notRequired(),
    contact_person_user_3_number: Yup.string().notRequired(),
    budget_year: Yup.object()
      .nullable()
      .required(t('common:validation.required'))
      .test(
        'budget-year-greater-than-production-year',
        t(
          'monitoringDeviceInventoryForm:field.budget_year.validation.budget_year_must_be_greater_than_production_year'
        ),
        function (value: any) {
          const { production_year } = this.parent
          if (!value || !production_year) return true
          return Number(value.value) >= Number(production_year.value)
        }
      ),
    budget_source_id: Yup.object()
      .nullable()
      .required(t('common:validation.required')),
  })
}

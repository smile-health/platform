import { TFunction } from 'i18next'
import * as Yup from 'yup'

import { OWNERSHIP_STATUS } from '../../StorageTemperatureMonitoringDetail/libs/storage-temperature-monitoring-detail.constant'

export const monitoringDeviceInventoryFormValidation = (
  t: TFunction<['common', 'monitoringDeviceInventory']>
) =>
  Yup.object().shape({
    asset_type: Yup.object()
      .shape({
        value: Yup.mixed().nullable(),
        label: Yup.string(),
      })
      .nullable()
      .test({
        name: 'is-required',
        test: function (value) {
          const { path, createError } = this
          if (value?.value !== 'other' && !value) {
            return createError({
              path,
              message: t('common:validation.required'),
            })
          }
          return true
        },
      }),
    electricity: Yup.object()
      .shape({
        value: Yup.number(),
        label: Yup.string(),
      })
      .nullable()
      .notRequired(),
    manufacture: Yup.object()
      .shape({
        value: Yup.mixed().nullable(),
        label: Yup.string(),
      })
      .required(t('common:validation.required')),
    asset_model: Yup.object()
      .shape({
        value: Yup.mixed().nullable(),
        label: Yup.string(),
      })
      .required(t('common:validation.required')),
    serial_number: Yup.string().required(t('common:validation.required')),
    ownership_status: Yup.number().required(),
    production_year: Yup.object()
      .shape({
        value: Yup.number(),
        label: Yup.string(),
      })
      .test({
        name: 'must_be_lower_or_same_as_budget_year',
        test: function (value) {
          const { path, parent, createError } = this
          if (Number(value?.value) > parent?.budget_year?.value) {
            return createError({
              path,
              message: t(
                'monitoringDeviceInventory:form.validation.must_be_lower_or_same',
                {
                  field_1: t(
                    'monitoringDeviceInventory:columns.production_year'
                  ),
                  field_2: t('monitoringDeviceInventory:columns.budget_year'),
                }
              ),
            })
          }
          return true
        },
      })
      .required(t('common:validation.required')),
    entity: Yup.object()
      .shape({
        value: Yup.number(),
        label: Yup.string(),
      })
      .required(t('common:validation.required')),
    maintainer: Yup.array()
      .of(
        Yup.object().shape({
          value: Yup.number(),
          label: Yup.string(),
        })
      )
      .nullable(),
    budget_year: Yup.object()
      .shape({
        value: Yup.number(),
        label: Yup.string(),
      })
      .test({
        name: 'must_be_higher_or_same_as_production_year',
        test: function (value) {
          const { path, parent, createError } = this
          if (Number(value?.value) < parent?.production_year?.value) {
            return createError({
              path,
              message: t(
                'monitoringDeviceInventory:form.validation.must_be_higher_or_same',
                {
                  field_1: t('monitoringDeviceInventory:columns.budget_year'),
                  field_2: t(
                    'monitoringDeviceInventory:columns.production_year'
                  ),
                }
              ),
            })
          }
          return true
        },
      })
      .required(t('common:validation.required')),
    budget_source: Yup.object()
      .shape({
        value: Yup.mixed().nullable(),
        label: Yup.string(),
      })
      .nullable()
      .test({
        name: 'is-required',
        test: function (value) {
          const { path, createError } = this
          if (value?.value !== 'other' && !value) {
            return createError({
              path,
              message: t('common:validation.required'),
            })
          }
          return true
        },
      }),
    asset_status: Yup.object()
      .shape({
        value: Yup.number(),
        label: Yup.string(),
      })
      .required(t('common:validation.required')),
    borrowed_from: Yup.object()
      .shape({
        value: Yup.mixed(),
        label: Yup.string(),
      })
      .nullable()
      .test({
        name: 'is-borrowed-from',
        test: function (value) {
          const { path, createError, parent } = this
          if (
            parent?.ownership_status !== OWNERSHIP_STATUS.BORROWED &&
            !value
          ) {
            return true
          }
          if (!value) {
            return createError({
              path,
              message: t('common:validation.required'),
            })
          }
          return true
        },
      }),
    ownership_qty: Yup.number().required(t('common:validation.required')),
    other_gross_capacity: Yup.string()
      .nullable()
      .test({
        name: 'is-required',
        test: function (value) {
          const { path, createError, parent } = this
          if (parent?.asset_model?.value === 'other' && !value) {
            return createError({
              path,
              message: t('common:validation.required'),
            })
          }
          return true
        },
      })
      .test({
        name: 'cannot-less-than-nett',
        test: function (value) {
          const { path, createError, parent } = this
          if (
            !!parent?.nett_capacity &&
            Number(value) < Number(parent?.nett_capacity)
          ) {
            return createError({
              path,
              message: t(
                'monitoringDeviceInventory:other_inputs.cannot_less_than',
                {
                  min: t(
                    'monitoringDeviceInventory:other_inputs.netto_capacity'
                  ),
                }
              ),
            })
          }
          return true
        },
      }),
    other_net_capacity: Yup.string()
      .nullable()
      .test({
        name: 'is-required',
        test: function (value) {
          const { path, createError, parent } = this
          if (parent?.asset_model?.value === 'other' && !value) {
            return createError({
              path,
              message: t('common:validation.required'),
            })
          }
          return true
        },
      })
      .test({
        name: 'cannot-more-than-gross',
        test: function (value) {
          const { path, createError, parent } = this
          if (
            !!parent?.gross_capacity &&
            Number(value) > Number(parent?.gross_capacity)
          ) {
            return createError({
              path,
              message: t(
                'monitoringDeviceInventory:other_inputs.cannot_more_than',
                {
                  max: t(
                    'monitoringDeviceInventory:other_inputs.gross_capacity'
                  ),
                }
              ),
            })
          }
          return true
        },
      }),
    other_max_temperature: Yup.mixed()
      .nullable()
      .test({
        name: 'is-required',
        test: function (value) {
          const { path, createError, parent } = this
          if (
            parent?.asset_type?.value === 'other' &&
            (isNaN(Number(value)) || value === undefined)
          ) {
            return createError({
              path,
              message: t('common:validation.required'),
            })
          }
          return true
        },
      })
      .test({
        name: 'cannot-less-than-min',
        test: function (value) {
          const { path, createError, parent } = this
          if (Number(value) < Number(parent?.other_min_temperature)) {
            return createError({
              path,
              message: t(
                'monitoringDeviceInventory:other_inputs.cannot_less_than',
                {
                  min: t(
                    'monitoringDeviceInventory:other_inputs.minimum_temperature'
                  ),
                }
              ),
            })
          }
          return true
        },
      }),
    other_min_temperature: Yup.mixed()
      .nullable()
      .test({
        name: 'is-required',
        test: function (value) {
          const { path, createError, parent } = this
          if (
            parent?.asset_type?.value === 'other' &&
            (isNaN(Number(value)) || value === undefined)
          ) {
            return createError({
              path,
              message: t('common:validation.required'),
            })
          }
          return true
        },
      })
      .test({
        name: 'cannot-more-than-max',
        test: function (value) {
          const { path, createError, parent } = this
          if (Number(value) > Number(parent?.other_max_temperature)) {
            return createError({
              path,
              message: t(
                'monitoringDeviceInventory:other_inputs.cannot_more_than',
                {
                  max: t(
                    'monitoringDeviceInventory:other_inputs.maximum_temperature'
                  ),
                }
              ),
            })
          }
          return true
        },
      }),
    other_asset_type_name: Yup.string()
      .nullable()
      .test({
        name: 'is-required',
        test: function (value) {
          const { path, createError, parent } = this
          if (parent?.asset_type?.value === 'other' && !value) {
            return createError({
              path,
              message: t('common:validation.required'),
            })
          }
          return true
        },
      }),
    other_asset_model_name: Yup.string()
      .nullable()
      .test({
        name: 'is-required',
        test: function (value) {
          const { path, createError, parent } = this
          if (parent?.asset_model?.value === 'other' && !value) {
            return createError({
              path,
              message: t('common:validation.required'),
            })
          }
          return true
        },
      }),
    other_manufacture_name: Yup.string()
      .nullable()
      .test({
        name: 'is-required',
        test: function (value) {
          const { path, createError, parent } = this
          if (parent?.manufacture?.value === 'other' && !value) {
            return createError({
              path,
              message: t('common:validation.required'),
            })
          }
          return true
        },
      }),
    warranty_start_date: Yup.string()
      .nullable()
      .test({
        name: 'is-required',
        test: function (value) {
          const { path, createError, parent } = this
          if (
            !value &&
            (parent?.warranty_end_date || parent?.warranty_vendor)
          ) {
            return createError({
              path,
              message: t(
                'monitoringDeviceInventory:form.validation.group_validation'
              ),
            })
          }
          return true
        },
      }),
    warranty_end_date: Yup.string()
      .nullable()
      .test({
        name: 'is-required',
        test: function (value) {
          const { path, createError, parent } = this
          if (
            !value &&
            (parent?.warranty_start_date || parent?.warranty_vendor)
          ) {
            return createError({
              path,
              message: t(
                'monitoringDeviceInventory:form.validation.group_validation'
              ),
            })
          }
          return true
        },
      }),
    warranty_vendor: Yup.object()
      .shape({
        value: Yup.number(),
        label: Yup.string(),
      })
      .nullable()
      .test({
        name: 'is-required',
        test: function (value) {
          const { path, createError, parent } = this
          if (
            !value &&
            (parent?.warranty_start_date || parent?.warranty_end_date)
          ) {
            return createError({
              path,
              message: t(
                'monitoringDeviceInventory:form.validation.group_validation'
              ),
            })
          }
          return true
        },
      }),
    calibration_last_date: Yup.string()
      .nullable()
      .test({
        name: 'is-required',
        test: function (value) {
          const { path, createError, parent } = this
          if (
            !value &&
            (parent?.calibration_schedule || parent?.calibration_vendor)
          ) {
            return createError({
              path,
              message: t(
                'monitoringDeviceInventory:form.validation.group_validation'
              ),
            })
          }
          return true
        },
      }),
    calibration_schedule: Yup.object()
      .shape({
        value: Yup.number(),
        label: Yup.string(),
      })
      .nullable()
      .test({
        name: 'is-required',
        test: function (value) {
          const { path, createError, parent } = this
          if (
            !value &&
            (parent?.calibration_last_date || parent?.calibration_vendor)
          ) {
            return createError({
              path,
              message: t(
                'monitoringDeviceInventory:form.validation.group_validation'
              ),
            })
          }
          return true
        },
      }),
    calibration_vendor: Yup.object()
      .shape({
        value: Yup.number(),
        label: Yup.string(),
      })
      .nullable()
      .test({
        name: 'is-required',
        test: function (value) {
          const { path, createError, parent } = this
          if (
            !value &&
            (parent?.calibration_last_date || parent?.calibration_schedule)
          ) {
            return createError({
              path,
              message: t(
                'monitoringDeviceInventory:form.validation.group_validation'
              ),
            })
          }
          return true
        },
      }),
    maintenance_last_date: Yup.string()
      .nullable()
      .test({
        name: 'is-required',
        test: function (value) {
          const { path, createError, parent } = this
          if (
            !value &&
            (parent?.maintenance_schedule || parent?.maintenance_vendor)
          ) {
            return createError({
              path,
              message: t(
                'monitoringDeviceInventory:form.validation.group_validation'
              ),
            })
          }
          return true
        },
      }),
    maintenance_schedule: Yup.object()
      .shape({
        value: Yup.number(),
        label: Yup.string(),
      })
      .nullable()
      .test({
        name: 'is-required',
        test: function (value) {
          const { path, createError, parent } = this
          if (
            !value &&
            (parent?.maintenance_last_date || parent?.maintenance_vendor)
          ) {
            return createError({
              path,
              message: t(
                'monitoringDeviceInventory:form.validation.group_validation'
              ),
            })
          }
          return true
        },
      }),
    maintenance_vendor: Yup.object()
      .shape({
        value: Yup.number(),
        label: Yup.string(),
      })
      .nullable()
      .test({
        name: 'is-required',
        test: function (value) {
          const { path, createError, parent } = this
          if (
            !value &&
            (parent?.maintenance_last_date || parent?.maintenance_schedule)
          ) {
            return createError({
              path,
              message: t(
                'monitoringDeviceInventory:form.validation.group_validation'
              ),
            })
          }
          return true
        },
      }),
    contact_person_user_1_number: Yup.string().required(
      t('common:validation.required')
    ),
    contact_person_user_2_number: Yup.string().nullable(),
    contact_person_user_3_number: Yup.string().nullable(),
    contact_person_user_1_name: Yup.string().required(
      t('common:validation.required')
    ),
    contact_person_user_2_name: Yup.string().nullable(),
    contact_person_user_3_name: Yup.string().nullable(),
    other_budget_source_name: Yup.string()
      .nullable()
      .test({
        name: 'is-required',
        test: function (value) {
          const { path, createError, parent } = this
          if (parent?.budget_source?.value === 'other' && !value) {
            return createError({
              path,
              message: t('common:validation.required'),
            })
          }
          return true
        },
      }),
    other_borrowed_from_entity_name: Yup.string()
      .nullable()
      .test({
        name: 'is-required',
        test: function (value) {
          const { path, createError, parent } = this
          if (parent?.borrowed_from?.value === 'other' && !value) {
            return createError({
              path,
              message: t('common:validation.required'),
            })
          }
          return true
        },
      }),
  })

export const assetRelationLoggerValidation = (
  t: TFunction<['common', 'monitoringDeviceInventory']>
) =>
  Yup.object().shape({
    asset_name: Yup.object()
      .shape({
        value: Yup.string(),
        label: Yup.string(),
      })
      .required(t('common:validation.required')),
    sensor: Yup.string()
      .required(t('common:validation.required'))
      .test({
        name: 'only-can-be-filled-1-to-10',
        test: function (value) {
          const { path, createError } = this
          if (Number(value) < 1 || Number(value) > 10) {
            return createError({
              path,
              message: t('monitoringDeviceInventory:relation.sensor_1_10'),
            })
          }
          return true
        },
      }),
  })

export default {}

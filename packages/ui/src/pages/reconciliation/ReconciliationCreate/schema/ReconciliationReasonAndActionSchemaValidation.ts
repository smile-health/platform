import { TFunction } from 'i18next'
import * as Yup from 'yup'

export const schemaValidationReasonAndAction = (
  t: TFunction<'reconciliation'>
) =>
  Yup.object().shape({
    data: Yup.array()
      .of(
        Yup.object().shape({
          action: Yup.object()
            .shape({
              value: Yup.mixed().nullable(),
              label: Yup.mixed().nullable(),
            })
            .required(t('create.validation.required')),
          reason: Yup.object()
            .shape({
              value: Yup.mixed().nullable(),
              label: Yup.mixed().nullable(),
            })
            .required(t('create.validation.required')),
        })
      )
      .test(
        'unique-combo',
        '',
        function (items) {
          if (!items) return true

          const combos = items.map(
            (item) => `${item.action?.value}-${item.reason?.value}`
          )
          for (let i = 0; i < combos.length; i++) {
            for (let j = i + 1; j < combos.length; j++) {
              if (combos[i] === combos[j]) {
                return this.createError({
                  path: `data[${j}].action`,
                  message: t('create.validation.error_combination'),
                })
              }
            }
          }

          return true
        }
      ),
  })

import { TFunction } from 'i18next'
import * as yup from 'yup'

export const annualCommitmentFormSchema = (
  t: TFunction<['common', 'annualCommitmentForm']>
) =>
  yup.object().shape({
    contract_number: yup
      .object()
      .shape({
        label: yup.string(),
        value: yup.mixed(),
      })
      .nullable()
      .required(t('common:validation.required')),
    year: yup
      .object()
      .shape({
        label: yup.string(),
        value: yup.mixed(),
      })
      .nullable()
      .required(t('common:validation.required')),
    contract_start_date: yup
      .date()
      .nullable()
      .required(t('common:validation.required')),
    contract_end_date: yup
      .date()
      .nullable()
      .required(t('common:validation.required')),
    supplier: yup
      .object()
      .shape({
        label: yup.string(),
        value: yup.mixed(),
      })
      .nullable()
      .required(t('common:validation.required')),
    description: yup.string().nullable(),
    centralAllocations: yup
      .array()
      .of(
        yup.object().shape({
          material: yup.object().nullable(),
          provinceReceiver: yup
            .object()
            .nullable()
            .test(
              'provinceReceiver-required',
              t('common:validation.required'),
              function (prov: any) {
                const item = this.parent
                const hasVial = item?.numberVial != null && item?.numberVial > 0
                if (hasVial && !prov) {
                  return this.createError({
                    path: this.path,
                    message: t('common:validation.required'),
                  })
                }
                return true
              }
            )
            .test(
              'unique-provinceReceiver-per-material',
              t('annualCommitmentForm:validation.provinces'),
              function (prov: any) {
                const from = this.from
                const centralAllocationsData =
                  from?.[2]?.value?.centralAllocations

                const item = this.parent

                if (!Array.isArray(centralAllocationsData) || !item) return true

                const matKey = item?.material?.value ?? item?.material?.id
                const provKey = prov?.value

                if (matKey == null || provKey == null) return true

                let count = 0
                for (const other of centralAllocationsData) {
                  const otherMat = other?.material?.value ?? other?.material?.id
                  const otherProv =
                    other?.provinceReceiver?.value ??
                    other?.provinceReceiver?.id
                  if (otherMat === matKey && otherProv === provKey) {
                    count++
                    if (count > 1) {
                      return this.createError({
                        path: this.path,
                        message: t('annualCommitmentForm:validation.provinces'),
                      })
                    }
                  }
                }
                return true
              }
            ),
          numberVial: yup
            .number()
            .nullable()
            .test('numberVial-input-value', function (numVial: number) {
              const { createError } = this
              const item = this.parent
              const hasMaterial = item?.material != null
              const hasProvince = item?.provinceReceiver != null

              // If material or province is selected, numberVial is required
              if ((hasMaterial || hasProvince) && numVial == null)
                return createError({
                  path: this.path,
                  message: t('common:validation.required'),
                })

              if (numVial != null && numVial <= 0)
                return createError({
                  path: this.path,
                  message: t('common:validation.min', { value: 1 }),
                })

              return true
            }),
          numberDose: yup.number(),
        })
      )
      .test(
        'at-least-one-allocation',
        t('annualCommitmentForm:validation.atLeastOneRequired'),
        function (centralAllocations: any) {
          const bufferItems = this.parent?.bufferItems

          const hasCentralAllocation = centralAllocations?.length > 0
          const hasBuffer = bufferItems?.length > 0

          if (!hasCentralAllocation && !hasBuffer) {
            return this.createError({
              path: this.path,
              message: t('annualCommitmentForm:validation.atLeastOneRequired'),
            })
          }

          return true
        }
      ),
    bufferItems: yup.array().of(
      yup.object().shape({
        material: yup.object().nullable(),
        numberVial: yup
          .number()
          .nullable()
          .test('numberVial-input-value', function (numVial: number) {
            const { createError } = this
            const item = this.parent
            const hasMaterial = item?.material != null

            if (hasMaterial && numVial == null) {
              return createError({
                path: this.path,
                message: t('common:validation.required'),
              })
            }

            if (numVial != null && numVial <= 0) {
              return createError({
                path: this.path,
                message: t('common:validation.min', { value: 1 }),
              })
            }

            return true
          }),
        numberDose: yup.number(),
      })
    ),
  })

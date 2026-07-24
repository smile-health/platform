import type { TFunction } from 'i18next'
import * as yup from 'yup'

export const masterPemeriksaanFormSchema = (t: TFunction<['common']>) =>
  yup.object({
    name: yup
      .string()
      .required(t('common:validation.required'))
      .min(3, t('common:validation.char.min', { char: 3 })),
    description: yup.string().notRequired(),
    is_active: yup.boolean().required(t('common:validation.required')),
    materials: yup
      .array()
      .of(
        yup.object({
          template_id: yup.number().required(t('common:validation.required')),
          sasaran_ids: yup
            .array()
            .transform((value) =>
              Array.isArray(value)
                ? value.map((v) =>
                    typeof v === 'object' && v?.value ? Number(v.value) : v
                  )
                : value
            )
            .of(yup.number())
            .min(1, t('common:validation.required'))
            .required(t('common:validation.required')),
        })
      )
      .min(1, t('common:validation.required'))
      .required(t('common:validation.required')),
    jenis_pemeriksaan_id: yup
      .number()
      .required(t('common:validation.required'))
      .nullable(),
    parameter_ids: yup
      .array()
      .transform((value) =>
        Array.isArray(value)
          ? value.map((v) =>
              typeof v === 'object' && v?.value ? Number(v.value) : v
            )
          : value
      )
      .of(yup.number())
      .min(1, t('common:validation.required'))
      .required(t('common:validation.required')),
    metode_ids: yup
      .array()
      .transform((value) =>
        Array.isArray(value)
          ? value.map((v) =>
              typeof v === 'object' && v?.value ? Number(v.value) : v
            )
          : value
      )
      .of(yup.number())
      .min(1, t('common:validation.required'))
      .required(t('common:validation.required')),
  })

export type MasterPemeriksaanFormType = yup.InferType<
  ReturnType<typeof masterPemeriksaanFormSchema>
>

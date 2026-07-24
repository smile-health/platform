// pages/bmhp-variant/form.tsx
import React from 'react'
import { toast } from '#components/toast'
import useSmileRouter from '#hooks/useSmileRouter'
import { UseFormBuilderSchema } from '#pages/bmhp/hooks/useFormBuilder'
import MasterFormPage from '#pages/bmhp/master/form/MasterFormPage'
import { getCoreMaterials } from '#services/material'
import { ErrorResponse } from '#types/common'
import { isAxiosError } from 'axios'
import { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import * as Yup from 'yup'

import { CreateBmhpVariantBody, VariantItem } from '../bmhp-method.types'
import { getBmhpVariantDetail } from '../detail'
import { createBmhpVariant, updateBmhpVariant } from './form.service'
import VariantInput from './VariantInput'

const BMHPVariantValidationSchema = (t: TFunction<['common', 'masterBmhp']>) =>
  Yup.object({
    bmhp_material_id: Yup.object()
      .shape({
        value: Yup.number().required(
          t('masterBmhp:validation.material.required')
        ),
        label: Yup.string().required(
          t('masterBmhp:validation.material.required')
        ),
      })
      .nullable()
      .required(t('masterBmhp:validation.material.required')),
    is_variant: Yup.string()
      .required(t('masterBmhp:validation.is_variant.required'))
      .oneOf(['true', 'false'], t('masterBmhp:validation.is_variant.invalid')),
    variants: Yup.array()
      .min(1, t('masterBmhp:validation.variant.min'))
      .required(t('masterBmhp:validation.variant.required'))
      .of(
        Yup.object().shape({
          name: Yup.string(),
          test_qty: Yup.number()
            .required(t('masterBmhp:validation.variant.test_qty.required'))
            .min(1, t('masterBmhp:validation.variant.test_qty.min')),
          unit_id: Yup.number().required(
            t('masterBmhp:validation.variant.unit.required')
          ),
        })
      ),
  })

interface BMHPVariantForm {
  bmhp_material_id: { value: number; label: string } | null
  is_variant: string // 'true' or 'false'
  variants: VariantItem[]
}

const fields = (
  t: TFunction<['common', 'masterBmhp']>
): UseFormBuilderSchema => {
  return [
    {
      type: 'select-async-paginate',
      name: 'bmhp_material_id',
      label: t('masterBmhp:label.material'),
      placeholder: t('masterBmhp:placeholder.material'),
      required: true,
      className: 'ui-mb-4',
      onChange: (value: unknown) => value,
      loadOptions: async (
        search: string,
        _: unknown,
        additional: { page: number }
      ) => {
        const paramsFilter = {
          page: additional?.page || 1,
          paginate: 100,
          keyword: search || '',
          material_level_ids: 2,
          material_type_ids: 4,
        }

        const result = await getCoreMaterials(paramsFilter)
        return {
          options: result.data.map((x) => ({
            value: x.id,
            label: x.name,
            material_level_ids: x.material_level_id,
          })),
          hasMore: result.data.length >= 100,
          additional: {
            page: (additional?.page || 1) + 1,
          },
        }
      },
      additional: {
        page: 1,
      },
    },
    {
      type: 'radio',
      name: 'is_variant',
      label: t('masterBmhp:label.is_variant'),
      required: true,
      className: 'ui-mb-4',
      options: [
        { label: t('common:yes'), value: 'true' },
        { label: t('common:no'), value: 'false' },
      ],
    },
    {
      type: 'component',
      name: 'variants',
      required: true,
      component: <VariantInput />,
    },
  ]
}

const BMHPVariantFormPage = () => {
  const { t } = useTranslation(['common', 'masterBmhp'])
  const router = useSmileRouter()
  const { year_id } = router.query

  const handleSubmit = async (data: BMHPVariantForm, id?: string) => {
    const newdata: CreateBmhpVariantBody = {
      material_id:
        typeof data.bmhp_material_id === 'object'
          ? (data.bmhp_material_id?.value ?? 0)
          : (data.bmhp_material_id ?? 0),
      is_variant: data.is_variant === 'true' ? 0 : 1,
      variants: data.variants,
      program_plan_id: Number(year_id),
    }

    try {
      if (id) {
        await updateBmhpVariant({ id, ...newdata })
        toast.success({
          title: t('common:message.success.update', {
            type: t('masterBmhp:title.bmhp_variant'),
          }),
        })
      } else {
        await createBmhpVariant(newdata)
        toast.success({
          title: t('common:message.success.add', {
            type: t('masterBmhp:title.bmhp_variant'),
          }),
        })
      }
      router.push(`/v5/bmhp-planning/${year_id}/variant/`)
    } catch (error) {
      if (isAxiosError(error)) {
        toast.danger({
          description:
            (error?.response?.data as ErrorResponse).message ??
            t(
              id
                ? 'common:message.failed.update'
                : 'common:message.failed.create',
              {
                type: t('masterBmhp:title.bmhp_variant'),
              }
            ),
        })
      }
    }
  }

  const fetchData = async (id: string): Promise<BMHPVariantForm> => {
    const data = await getBmhpVariantDetail(id)

    return {
      bmhp_material_id: data.material_name
        ? { value: data.material_id, label: data.material_name }
        : null,
      is_variant: data.is_variant === 0 ? 'true' : 'false',
      variants:
        data.variants?.map((v) => ({
          material_id: v.material_variant_id,
          name: v.name,
          test_qty: v.test_qty,
          unit_id: v.unit_id,
          unit_name: v.unit_name,
        })) || [],
    }
  }

  return (
    <MasterFormPage<BMHPVariantForm>
      title={t('masterBmhp:title.bmhp_variant')}
      validation={BMHPVariantValidationSchema(t)}
      initialValues={{
        bmhp_material_id: null,
        is_variant: '' as any,
        variants: [],
      }}
      fields={fields(t)}
      onSubmit={handleSubmit}
      fetchData={fetchData}
    />
  )
}

export default BMHPVariantFormPage

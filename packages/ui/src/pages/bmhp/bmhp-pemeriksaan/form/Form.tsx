// pages/bmhp-pemeriksaan/form.tsx
import React from 'react'
import { toast } from '#components/toast'
import useSmileRouter from '#hooks/useSmileRouter'
import { UseFormBuilderSchema } from '#pages/bmhp/hooks/useFormBuilder'
import MasterFormPage from '#pages/bmhp/master/form/MasterFormPage'
import { ErrorResponse } from '#types/common'
import { isAxiosError } from 'axios'
import { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import * as Yup from 'yup'

import { loadBmhpExaminationTypeOptions } from '../../bmhp-examination-type/list/master.service'
import { loadBmhpMethodOptions } from '../../bmhp-method/list/master.service'
import { loadBmhpParameterOptions } from '../../bmhp-parameter/list/master.service'
import { CreateBmhpPemeriksaanBody } from '../bmhp-pemeriksaan.types'
import { getBmhpPemeriksaanDetail } from '../detail'
import { MASTER_PEMERIKSAAN_PERMISSION } from '../utils/constants'
import { createBmhpPemeriksaan, updateBmhpPemeriksaan } from './form.service'
import MaterialSelector from './MaterialSelector'

const BMHPPemeriksaanValidationSchema = (
  t: TFunction<['common', 'masterBmhp']>
) =>
  Yup.object({
    name: Yup.string().required(t('masterBmhp:validation.name.required')),
    description: Yup.string().optional().nullable(),
    examination_type_id: Yup.object()
      .shape({
        value: Yup.number().required(),
        label: Yup.string().required(),
      })
      .nullable()
      .required(t('masterBmhp:validation.examination_type.required')),
    parameter_ids: Yup.array()
      .min(1, t('masterBmhp:validation.parameter.min'))
      .required(t('masterBmhp:validation.parameter.required')),
    method_ids: Yup.array()
      .min(1, t('masterBmhp:validation.method.min'))
      .required(t('masterBmhp:validation.method.required')),
    // is_active: Yup.string().required(
    //   t('masterBmhp:validation.is_active.required')
    // ),
    materials: Yup.array()
      .min(1, t('masterBmhp:validation.material.min'))
      .required(t('masterBmhp:validation.material.required'))
      .of(
        Yup.object().shape({
          template_id: Yup.number().required(),
          sasaran_ids: Yup.array()
            .min(1, t('masterBmhp:validation.material_target_group.min'))
            .required(
              t('masterBmhp:validation.material_target_group.required')
            ),
        })
      ),
  })

interface BMHPPemeriksaanForm {
  name: string
  description: string
  is_active: string
  examination_type_id: { value: number; label: string } | null
  parameter_ids: Array<{ value: number; label: string }>
  method_ids: Array<{ value: number; label: string }>
  materials: Array<{
    template_id: number
    sasaran_ids: number[]
  }>
}

const fields = (
  t: TFunction<['common', 'masterBmhp']>,
  year_id: string
): UseFormBuilderSchema => [
  {
    type: 'text',
    name: 'name',
    label: t('masterBmhp:label.name'),
    placeholder: t('masterBmhp:placeholder.name'),
    required: true,
    className: 'ui-mb-4',
  },
  {
    type: 'select-async-paginate',
    name: 'examination_type_id',
    label: t('masterBmhp:label.examination_type'),
    placeholder: t('masterBmhp:placeholder.name'),
    required: true,
    className: 'ui-mb-4',
    onChange: (value: unknown) => value,
    loadOptions: async (search: string) => {
      const options = await loadBmhpExaminationTypeOptions(Number(year_id))
      const filteredOptions = options.filter((opt) =>
        opt.label.toLowerCase().includes(search.toLowerCase())
      )
      return {
        options: filteredOptions,
        hasMore: false,
      }
    },
  },
  {
    type: 'select-async-paginate',
    name: 'parameter_ids',
    label: t('masterBmhp:label.parameter'),
    placeholder: 'Select parameters',
    required: true,
    className: 'ui-mb-4',
    isMulti: true,
    loadOptions: async (search: string) => {
      const options = await loadBmhpParameterOptions(Number(year_id))
      const filteredOptions = options.filter((opt) =>
        opt.label.toLowerCase().includes(search.toLowerCase())
      )
      return {
        options: filteredOptions,
        hasMore: false,
      }
    },
  },
  {
    type: 'select-async-paginate',
    name: 'method_ids',
    label: t('masterBmhp:label.method'),
    placeholder: 'Select methods',
    required: true,
    className: 'ui-mb-4',
    isMulti: true,
    loadOptions: async (search: string) => {
      const options = await loadBmhpMethodOptions(Number(year_id))
      const filteredOptions = options.filter((opt) =>
        opt.label.toLowerCase().includes(search.toLowerCase())
      )
      return {
        options: filteredOptions,
        hasMore: false,
      }
    },
  },
  {
    type: 'component',
    name: 'materials',
    required: true,
    component: <MaterialSelector year_id={Number(year_id)} />,
  },
  {
    type: 'textarea',
    name: 'description',
    label: t('masterBmhp:label.description'),
    placeholder: t('masterBmhp:placeholder.description'),
    required: false,
    className: 'ui-mb-4',
    rows: 4,
  },
  // {
  //   type: 'radio',
  //   name: 'is_active',
  //   label: t('masterBmhp:label.status'),
  //   required: true,
  //   className: 'ui-mb-4',
  //   options: [
  //     { label: t('masterBmhp:common.active'), value: '1' },
  //     { label: t('masterBmhp:common.inactive'), value: '0' },
  //   ],
  // },
]

const BMHPPemeriksaanFormPage = () => {
  const { t } = useTranslation(['common', 'masterBmhp'])
  const router = useSmileRouter()
  const { year_id } = router.query

  const handleSubmit = async (data: BMHPPemeriksaanForm, id?: string) => {
    const newdata: CreateBmhpPemeriksaanBody = {
      name: data.name,
      description: data.description,
      is_active: true,
      // is_active: data.is_active === '1',
      examination_type_id:
        typeof data.examination_type_id === 'object'
          ? (data.examination_type_id?.value ?? 0)
          : (data.examination_type_id ?? 0),
      parameters: (data.parameter_ids || []).map((p, index) => ({
        id: p.value,
        sort_order: index + 1,
      })),
      method_ids: (data.method_ids || []).map((m) => m.value),
      materials: (data.materials || []).map((mat) => ({
        material_id: mat.template_id,
        target_group_ids: mat.sasaran_ids,
      })),
      program_plan_id: Number(year_id),
    }

    try {
      if (id) {
        await updateBmhpPemeriksaan({ id, ...newdata })
        toast.success({
          title: t('common:message.success.update', {
            type: t('masterBmhp:title.bmhp_pemeriksaan'),
          }),
        })
      } else {
        await createBmhpPemeriksaan(newdata)
        toast.success({
          title: t('common:message.success.add', {
            type: t('masterBmhp:title.bmhp_pemeriksaan'),
          }),
        })
      }
      router.push(`/v5/bmhp-planning/${year_id}/master-pemeriksaan/`)
    } catch (error) {
      console.error('Error submitting form:', error)
      if (isAxiosError(error)) {
        toast.danger({
          description:
            (error?.response?.data as ErrorResponse).message ??
            t(
              id
                ? 'common:message.failed.update'
                : 'common:message.failed.create',
              {
                type: t('masterBmhp:title.bmhp_pemeriksaan'),
              }
            ),
        })
      }
    }
  }

  const fetchData = async (id: string): Promise<BMHPPemeriksaanForm> => {
    const data = await getBmhpPemeriksaanDetail(id)

    return {
      name: data.name,
      description: data.description,
      is_active: data.is_active ? '1' : '0',
      examination_type_id: data.examination_type_name
        ? { value: data.examination_type_id, label: data.examination_type_name }
        : null,
      parameter_ids: (data.parameters || []).map((p) => ({
        value: p.id,
        label: p.name,
      })),
      method_ids: (data.methods || []).map((m) => ({
        value: m.id,
        label: m.name,
      })),
      materials: (data.materials || []).map((mat) => ({
        template_id: mat.material_id,
        sasaran_ids: mat.target_group_ids || [],
      })),
    } as BMHPPemeriksaanForm
  }

  return (
    <MasterFormPage<BMHPPemeriksaanForm>
      permission={MASTER_PEMERIKSAAN_PERMISSION.VIEW}
      title={t('masterBmhp:title.bmhp_pemeriksaan')}
      validation={BMHPPemeriksaanValidationSchema(t)}
      initialValues={{
        name: '',
        description: '',
        is_active: '',
        examination_type_id: null,
        parameter_ids: [],
        method_ids: [],
        materials: [],
      }}
      fields={fields(t, year_id as string)}
      onSubmit={handleSubmit}
      fetchData={fetchData}
    />
  )
}

export default BMHPPemeriksaanFormPage

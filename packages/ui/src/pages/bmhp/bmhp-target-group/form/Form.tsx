// pages/bmhp-material/form.tsx
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

import { CreateBmhpTargetGroupBody } from '../bmhp-material.types'
import { getBmhpMaterialDetail } from '../detail'
import { createBmhpTargetGroup, updateBmhpTargetGroup } from './form.service'

const BMHPMaterialValidationSchema = Yup.object({
  code: Yup.string().required('Code is required'),
  name: Yup.string().required('Name is required'),
  age_range: Yup.string().required('Age Range is required'),
  description: Yup.string().optional(),
  is_active: Yup.string().min(1, 'Please select if it is a reagent'),
})

export interface FormValue {
  code: string
  name: string
  age_range: string
  description: string
  is_active: string
}

const fields = (
  t: TFunction<['common', 'masterBmhp']>
): UseFormBuilderSchema => {
  return [
    {
      type: 'text',
      name: 'code',
      label: t('masterBmhp:label.code'),
      placeholder: t('masterBmhp:placeholder.code'),
      required: true,
      id: 'input-code',
      className: 'ui-mb-4',
    },
    {
      type: 'text',
      name: 'name',
      label: t('masterBmhp:label.name'),
      placeholder: t('masterBmhp:placeholder.name'),
      required: true,
      id: 'input-name',
      className: 'ui-mb-4',
    },
    {
      type: 'text',
      name: 'age_range',
      label: t('masterBmhp:label.age_range'),
      placeholder: t('masterBmhp:placeholder.age_range'),
      required: true,
      id: 'input-age_range',
      className: 'ui-mb-4',
    },
    {
      type: 'textarea',
      name: 'description',
      label: t('masterBmhp:label.description'),
      placeholder: t('masterBmhp:placeholder.description'),
      required: false,
      id: 'input-description',
      className: 'ui-mb-4',
      rows: 4,
    },
    {
      type: 'radio',
      name: 'is_active',
      label: t('masterBmhp:common.active'),
      required: true,
      className: 'ui-mb-4',
      options: [
        { label: t('masterBmhp:common.active'), value: '1' },
        { label: t('masterBmhp:common.inactive'), value: '0' },
      ],
    },
  ]
}

const BMHPMaterialFormPage = () => {
  const { t } = useTranslation(['common', 'masterBmhp'])
  const router = useSmileRouter()

  const handleSubmit = async (data: FormValue, id?: string) => {
    try {
      const newdata: CreateBmhpTargetGroupBody = {
        ...data,
        is_active: data.is_active === '1' ? true : false,
      }
      if (id) {
        await updateBmhpTargetGroup({ id, ...newdata })
      } else {
        await createBmhpTargetGroup(newdata)
      }
      toast.success({
        title: t('common:message.success.add', {
          type: t('masterBmhp:title.bmhp_material_target_group'),
        }),
      })
      router.push('/v5/bmhp/bmhp-target-groups')
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
                type: t('masterBmhp:title.bmhp_material_target_group'),
              }
            ),
        })
      }
    }
  }

  const fetchData = async (id: string): Promise<FormValue> => {
    const data = await getBmhpMaterialDetail(id)
    console.log('data', data)

    return {
      code: data?.code ?? '',
      name: data?.name ?? '',
      age_range: data?.age_range ?? '',
      description: data?.description ?? '',
      is_active: data?.is_active === 1 ? '1' : '0',
    } as FormValue
  }

  return (
    <MasterFormPage<FormValue>
      permission="master-bmhp-view"
      title={t('masterBmhp:title.bmhp_material_target_group')}
      validation={BMHPMaterialValidationSchema}
      initialValues={{
        code: '',
        name: '',
        age_range: '',
        description: '',
        is_active: '',
      }}
      fields={fields(t)}
      onSubmit={handleSubmit}
      fetchData={fetchData}
    />
  )
}

export default BMHPMaterialFormPage

// pages/bmhp-examination-type/form.tsx
import React from 'react'
import { toast } from '#components/toast'
import useSmileRouter from '#hooks/useSmileRouter'
import { UseFormBuilderSchema } from '#pages/bmhp/hooks/useFormBuilder'
import MasterFormPage from '#pages/bmhp/master/form/MasterFormPage'
import { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import * as Yup from 'yup'

import { CreateBmhpExaminationTypeBody } from '../bmhp-examination-type.types'
import { getBmhpExaminationTypeDetail } from '../detail'
import { MASTER_EXAMINATION_TYPE_PERMISSION } from '../utils/constants'
import {
  createBmhpExaminationType,
  updateBmhpExaminationType,
} from './form.service'

const BMHPExaminationTypeValidationSchema = (
  t: TFunction<['common', 'masterBmhp']>
) =>
  Yup.object({
    name: Yup.string().required(t('masterBmhp:validation.name.required')),
    description: Yup.string().optional().nullable(),
  })

interface BMHPExaminationTypeForm {
  name: string
  description: string
}

const fields = (
  t: TFunction<['common', 'masterBmhp']>
): UseFormBuilderSchema => {
  return [
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
      type: 'textarea',
      name: 'description',
      label: t('masterBmhp:label.description'),
      placeholder: t('masterBmhp:placeholder.description'),
      required: false,
      id: 'input-description',
      className: 'ui-mb-4',
      rows: 4,
    },
  ]
}

const BMHPExaminationTypeFormPage = () => {
  const router = useSmileRouter()
  const { year_id } = router.query
  const { t } = useTranslation(['common', 'masterBmhp'])

  const handleSubmit = async (data: BMHPExaminationTypeForm, id?: string) => {
    const newdata: CreateBmhpExaminationTypeBody = {
      name: data.name,
      description: data.description,
      program_plan_id: Number(year_id),
    }

    try {
      if (id) {
        await updateBmhpExaminationType({ id, ...newdata })
        toast.success({
          title: t('common:message.success.update', {
            type: t('masterBmhp:title.bmhp_examination_type'),
          }),
        })
      } else {
        await createBmhpExaminationType(newdata)
        toast.success({
          title: t('common:message.success.add', {
            type: t('masterBmhp:title.bmhp_examination_type'),
          }),
        })
      }
      router.push(`/v5/bmhp-planning/${year_id}/jenis-pemeriksaan/`)
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.danger({
        title: id
          ? t('common:message.failed.update', {
              type: t('masterBmhp:title.bmhp_examination_type'),
            })
          : t('common:message.failed.create', {
              type: t('masterBmhp:title.bmhp_examination_type'),
            }),
      })
    }
  }

  const fetchData = async (id: string): Promise<BMHPExaminationTypeForm> => {
    const data = await getBmhpExaminationTypeDetail(id)

    return {
      name: data.name,
      description: data.description,
    } as BMHPExaminationTypeForm
  }

  return (
    <MasterFormPage<BMHPExaminationTypeForm>
      permission={MASTER_EXAMINATION_TYPE_PERMISSION.VIEW as any}
      title={t('masterBmhp:title.bmhp_examination_type')}
      validation={BMHPExaminationTypeValidationSchema(t)}
      initialValues={{
        name: '',
        description: '',
      }}
      fields={fields(t)}
      onSubmit={handleSubmit}
      fetchData={fetchData}
    />
  )
}

export default BMHPExaminationTypeFormPage

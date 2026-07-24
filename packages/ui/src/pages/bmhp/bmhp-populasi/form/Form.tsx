// pages/bmhp-method/form.tsx
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

import { CreateBmhpMethodBody } from '../bmhp-method.types'
import { getBmhpMethodDetail } from '../detail'
import { createBmhpMethod, updateBmhpMethod } from './form.service'

const BMHPMethodValidationSchema = (t: TFunction<['common', 'masterBmhp']>) =>
  Yup.object({
    name: Yup.string().required(t('masterBmhp:validation.name.required')),
    description: Yup.string().optional().nullable(),
  })

interface BMHPMethodForm {
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

const BMHPMethodFormPage = () => {
  const { t } = useTranslation(['common', 'masterBmhp'])
  const router = useSmileRouter()
  const { year_id } = router.query

  const handleSubmit = async (data: BMHPMethodForm, id?: string) => {
    const newdata: CreateBmhpMethodBody = {
      name: data.name,
      description: data.description,
      program_plan_id: Number(year_id),
    }

    try {
      if (id) {
        await updateBmhpMethod({ id, ...newdata })
        toast.success({
          title: t('common:message.success.update', {
            type: t('masterBmhp:title.bmhp_method'),
          }),
        })
      } else {
        await createBmhpMethod(newdata)
        toast.success({
          title: t('common:message.success.add', {
            type: t('masterBmhp:title.bmhp_method'),
          }),
        })
      }
      router.push(`/v5/bmhp-planning/${year_id}/method/`)
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
                type: t('masterBmhp:title.bmhp_method'),
              }
            ),
        })
      }
    }
  }

  const fetchData = async (id: string): Promise<BMHPMethodForm> => {
    const data = await getBmhpMethodDetail(id)

    return {
      name: data.name,
      description: data.description,
    } as BMHPMethodForm
  }

  return (
    <MasterFormPage<BMHPMethodForm>
      permission="master-method-view"
      title={t('masterBmhp:title.bmhp_method')}
      validation={BMHPMethodValidationSchema(t)}
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

export default BMHPMethodFormPage

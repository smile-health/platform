import { toast } from '#components/toast'
import useSmileRouter from '#hooks/useSmileRouter'
import { UseFormBuilderSchema } from '#pages/bmhp/hooks/useFormBuilder'
import MasterFormPage from '#pages/bmhp/master/form/MasterFormPage'
import { ErrorResponse } from '#types/common'
import { isAxiosError } from 'axios'
import { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import * as Yup from 'yup'

import { CreateBmhpParameterBody } from '../bmhp-parameter.types'
import { getBmhpParameterDetail } from '../detail'
import { createBmhpParameter, updateBmhpParameter } from './form.service'

const BMHPParameterValidationSchema = (
  t: TFunction<['common', 'masterBmhp']>
) =>
  Yup.object({
    name: Yup.string().required(t('masterBmhp:validation.name.required')),
    description: Yup.string().optional().nullable(),
  })

interface BMHPParameterForm {
  name: string
  unit: string
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
    },
    {
      type: 'textarea',
      name: 'description',
      label: t('masterBmhp:label.description'),
      placeholder: t('masterBmhp:placeholder.description'),
      required: false,
      rows: 4,
    },
  ]
}

const BMHPParameterFormPage = () => {
  const { t } = useTranslation(['common', 'masterBmhp'])
  const router = useSmileRouter()
  const { year_id } = router.query
  const basePath = `/v5/bmhp-planning/${year_id}/parameter`

  const handleSubmit = async (
    data: BMHPParameterForm,
    id?: string | undefined
  ) => {
    const isEditMode = Boolean(id)

    try {
      const body: CreateBmhpParameterBody = {
        name: data.name,
        description: data.description,
        program_plan_id: Number(year_id),
      }

      if (isEditMode && id) {
        await updateBmhpParameter({
          ...body,
          id,
        })

        toast.success({
          title: t('common:message.success.update', {
            type: t('masterBmhp:title.bmhp_parameter'),
          }),
        })
      } else {
        await createBmhpParameter(body)

        toast.success({
          title: t('common:message.success.create', {
            type: t('masterBmhp:title.bmhp_parameter'),
          }),
        })
      }

      router.push(basePath)
    } catch (error) {
      if (isAxiosError(error)) {
        toast.danger({
          description:
            (error?.response?.data as ErrorResponse).message ??
            t(
              isEditMode
                ? 'common:message.failed.update'
                : 'common:message.failed.create',
              { type: t('masterBmhp:title.bmhp_parameter') }
            ),
        })
      }
    }
  }

  const fetchData = async (id: string) => {
    const response = await getBmhpParameterDetail(id)
    const data = response

    return {
      name: data.name,
      unit: data.unit,
      description: data.description,
    } as BMHPParameterForm
  }

  return (
    <MasterFormPage<BMHPParameterForm>
      permission="master-parameter-view"
      title={t('masterBmhp:title.bmhp_parameter')}
      validation={BMHPParameterValidationSchema(t)}
      initialValues={{
        name: '',
        unit: '',
        description: '',
      }}
      fields={fields(t)}
      onSubmit={handleSubmit}
      fetchData={fetchData}
    />
  )
}

export default BMHPParameterFormPage

import { useRouter } from 'next/navigation'
import { yupResolver } from '@hookform/resolvers/yup'
import { Button } from '#components/button'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { TFormData, useEntityForm } from '../hooks/useEntityForm'
import { formSchema } from '../schema/EntitySchemaForm'
import EntityFormInformation from './Form/EntityFormInformation'
import EntityFormLocation from './Form/EntityFormLocation'
import EntityFormProgram from './Form/EntityFormProgram'
import EntityFormSentinelLab from './Form/EntityFormSentinelLab'

interface Props {
  isGlobal?: boolean
}

const EntityForm: React.FC<Props> = ({ isGlobal }) => {
  const router = useRouter()
  const { t } = useTranslation('common')
  const methodsForm = useForm<TFormData>({
    resolver: yupResolver(formSchema),
    defaultValues: { is_ayosehat: '0', is_puskesmas: '0' },
  })
  const { handleSubmit, watch } = methodsForm

  const entityTagId = watch('entity_tag_id')
  const isLabTag = entityTagId === 29

  const { materialTagList, onSubmitForm, isPending, isSuccessEntity, detail } =
    useEntityForm({ methodsForm, isGlobal })

  return (
    <FormProvider {...methodsForm}>
      <form
        onSubmit={handleSubmit(onSubmitForm)}
        className="ui-mt-6 ui-space-y-6 ui-max-w-form ui-mx-auto"
      >
        <EntityFormInformation
          materialTagList={materialTagList}
          isGlobal={isGlobal}
        />

        {isLabTag && <EntityFormSentinelLab />}

        <EntityFormLocation />

        <EntityFormProgram
          programs={detail?.programs.map((x) => x.id) || []}
          beneficiaries={detail?.beneficiaries?.map((x) => x.id) || []}
        />

        <div className="ui-flex ui-justify-end">
          <div className="ui-grid ui-grid-cols-2 ui-w-[300px] ui-gap-2">
            <Button
              id="btn-back-entity"
              type="button"
              variant="outline"
              onClick={() => router.back()}
              loading={isPending}
            >
              {t('back')}
            </Button>
            <Button
              id="btn-submit-entity"
              type="submit"
              loading={isPending}
              disabled={isSuccessEntity}
            >
              {t('save')}
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}

export default EntityForm

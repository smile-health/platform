import Link from 'next/link'
import { Button } from '#components/button'
import { FormProvider } from 'react-hook-form'

import { ModelAssetFormProps } from '../asset-model.type'
import { useModelAssetCreateEdit } from '../hooks/useModelAssetCreateEdit'
import ModelAssetFormEdit from './ModelAssetFormEdit'

const ModelAssetForm: React.FC<ModelAssetFormProps> = ({
  data,
  defaultValues,
}) => {
  const {
    t,
    methods,
    backUrl,
    onSubmit,
    isEdit,
    setSearchName,
    isNameDuplicate,
    temperatureThresholds,
  } = useModelAssetCreateEdit({
    defaultValues,
  })

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={onSubmit}
        className="ui-mt-6 ui-space-y-6 ui-max-w-form ui-mx-auto"
      >
        <ModelAssetFormEdit
          defaultValues={defaultValues}
          data={data}
          isEdit={isEdit}
          temperatureThresholds={temperatureThresholds as number[]}
          setSearchName={setSearchName}
          isNameDuplicate={isNameDuplicate}
        />

        <div className="ui-flex ui-justify-end">
          <div className="ui-grid ui-grid-cols-2 ui-w-[300px] ui-gap-2">
            <Button
              asChild
              id="btn-back-entity"
              type="button"
              variant="outline"
            >
              <Link href={backUrl()}>{t('back')}</Link>
            </Button>
            <Button id="btn-submit-entity" type="submit">
              {t('save')}
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}

export default ModelAssetForm

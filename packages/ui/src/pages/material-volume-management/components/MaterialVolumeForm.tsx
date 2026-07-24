import Link from 'next/link'
import { Button } from '#components/button'
import { MaterialVolumeFormProps } from '#types/material-volume'
import { FormProvider } from 'react-hook-form'

import { useMaterialVolumeCreateEdit } from '../hooks/useMaterialVolumeCreateEdit'
import MaterialVolumeFormBoxDimension from './MaterialVolumeFormBoxDimension'
import MaterialVolumeFormDetail from './MaterialVolumeFormDetail'

const MaterialVolumeForm: React.FC<MaterialVolumeFormProps> = ({
  defaultValues,
  isGlobal,
}) => {
  const { t, methods, backUrl, onSubmit } = useMaterialVolumeCreateEdit({
    defaultValues,
    isGlobal,
  })

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={onSubmit}
        className="ui-mt-6 ui-space-y-6 ui-max-w-form ui-mx-auto"
      >
        <MaterialVolumeFormDetail />
        <MaterialVolumeFormBoxDimension />

        <div className="ui-flex ui-justify-end">
          <div className="ui-grid ui-grid-cols-2 ui-w-[300px] ui-gap-2">
            <Button
              asChild
              id="btn-back-material-volume"
              type="button"
              variant="outline"
            >
              <Link href={backUrl()}>{t('back')}</Link>
            </Button>
            <Button id="btn-submit-material-volume" type="submit">
              {t('save')}
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}

export default MaterialVolumeForm

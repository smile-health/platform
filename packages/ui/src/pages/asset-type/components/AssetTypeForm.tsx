import Link from 'next/link'
import { Button } from '#components/button'
import { FormProvider } from 'react-hook-form'

import { AssetTypeFormProps } from '../asset-type.type'
import { useAssetTypeCreateEdit } from '../hooks/useAssetTypeCreateEdit'
import AssetTypeFormDetail from './AssetTypeFormDetail'
import AssetTypeFormUtilization from './AssetTypeFormUtilization'

const AssetTypeForm: React.FC<AssetTypeFormProps> = ({ defaultValues }) => {
  const { t, methods, backUrl, onSubmit, isEdit } = useAssetTypeCreateEdit({
    defaultValues,
  })

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={onSubmit}
        className="ui-mt-6 ui-space-y-6 ui-max-w-form ui-mx-auto"
      >
        <AssetTypeFormDetail />
        <AssetTypeFormUtilization
          defaultValues={defaultValues}
          isEdit={isEdit}
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

export default AssetTypeForm

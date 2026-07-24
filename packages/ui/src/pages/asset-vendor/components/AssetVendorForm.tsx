import Link from 'next/link'
import { Button } from '#components/button'
import { FormProvider } from 'react-hook-form'

import { AssetVendorFormProps } from '../asset-vendor.type'
import { useAssetVendorCreateEdit } from '../hooks/useAssetVendorCreateEdit'
import AssetVendorFormDetail from './AssetVendorFormDetail'

const AssetVendorForm: React.FC<AssetVendorFormProps> = ({
  defaultValues,
  isGlobal,
}) => {
  const { t, methods, backUrl, onSubmit } = useAssetVendorCreateEdit({
    defaultValues,
    isGlobal,
  })

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={onSubmit}
        className="ui-mt-6 ui-space-y-6 ui-max-w-form ui-mx-auto"
      >
        <AssetVendorFormDetail />

        <div className="ui-flex ui-justify-end">
          <div className="ui-grid ui-grid-cols-2 ui-w-[300px] ui-gap-2">
            <Button
              asChild
              id="btn-back-asset-vendor"
              type="button"
              variant="outline"
            >
              <Link href={backUrl()}>{t('back')}</Link>
            </Button>
            <Button id="btn-submit-asset-vendor" type="submit">
              {t('save')}
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}

export default AssetVendorForm

import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { ReactSelectAsync } from '#components/react-select'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { loadAssetElectricity } from '../../services/asset-inventory.services'

type AssetInventoryElectricitySectionProps = {
  errors: any
}

export const AssetInventoryElectricitySection = ({
  errors,
}: AssetInventoryElectricitySectionProps) => {
  const { t } = useTranslation(['common', 'assetInventory'])
  const { control } = useFormContext()

  return (
    <div className="ui-w-full ui-grid ui-grid-cols-1 ui-gap-4 ui-border ui-rounded-md ui-p-6 ui-mb-6">
      <div className="ui-font-bold ui-text-primary ui-text-dark-blue">
        {t('assetInventory:form.title.electricity')}
      </div>
      <FormControl className="ui-w-full">
        <FormLabel htmlFor="electricity">
          {t('assetInventory:columns.electricity')}
        </FormLabel>
        <Controller
          name="electricity"
          control={control}
          render={({ field }) => (
            <ReactSelectAsync
              {...field}
              key={`asset_electricity__${field.value?.value}`}
              id="electricity"
              isClearable
              loadOptions={loadAssetElectricity}
              placeholder={t('assetInventory:type_to_search')}
              additional={{
                page: 1,
              }}
            />
          )}
        />
        {errors?.asset_electricity_available?.message && (
          <FormErrorMessage>
            {errors?.asset_electricity_available?.message}
          </FormErrorMessage>
        )}
      </FormControl>
    </div>
  )
}

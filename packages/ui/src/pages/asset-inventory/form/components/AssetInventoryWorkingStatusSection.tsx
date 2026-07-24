import { Badge } from '#components/badge'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { ReactSelectAsync } from '#components/react-select'
import { loadStatusAsset } from '#services/status-asset'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useAssetInventoryForm } from '../hooks/useAssetInventoryForm'
import { WorkingStatusEnum } from '../libs/asset-inventory-constant'

type AssetInventoryWorkingStatusSectionProps = {
  errors: any
}

export const AssetInventoryWorkingStatusSection = ({
  errors,
}: AssetInventoryWorkingStatusSectionProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'assetInventory'])
  const { workingStatus } = useAssetInventoryForm({ data: null })
  const { control, watch } = useFormContext()

  return (
    <div className="ui-w-full ui-grid ui-grid-cols-1 ui-gap-4 ui-border ui-rounded-md ui-p-6 ui-mb-6">
      <div className="ui-w-full ui-grid ui-grid-cols-2 ui-gap-4">
        <div className="ui-font-bold ui-text-primary ui-text-dark-blue">
          {t('assetInventory:form.title.working_status')}
        </div>
        <div className="ui-ml-auto">
          {watch('asset_status')?.value && (
            <Badge
              key={language}
              variant="light"
              rounded="xl"
              className="ui-p-2"
              color={
                workingStatus?.[
                  Number(watch('asset_status')?.value) as WorkingStatusEnum
                ]?.color
              }
            >
              {watch('asset_status')?.label}
            </Badge>
          )}
        </div>
      </div>
      <FormControl className="ui-w-full">
        <FormLabel htmlFor="asset_status" required>
          {t('assetInventory:columns.asset_status')}
        </FormLabel>
        <Controller
          name="asset_status"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <ReactSelectAsync
              {...field}
              key={`asset_status__${field.value?.value}_${language}`}
              id="asset_status"
              isClearable
              loadOptions={loadStatusAsset}
              placeholder={t('assetInventory:type_to_search')}
              additional={{
                page: 1,
              }}
              error={!!error?.message}
            />
          )}
        />
        {errors?.asset_status?.message && (
          <FormErrorMessage>{errors?.asset_status?.message}</FormErrorMessage>
        )}
      </FormControl>
    </div>
  )
}

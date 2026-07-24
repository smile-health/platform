import { useMemo, useState } from 'react'
import { InformationCircleIcon } from '@heroicons/react/24/outline'
import { useQuery } from '@tanstack/react-query'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { Input } from '#components/input'
import { OptionType, ReactSelectAsync } from '#components/react-select'
import { BOOLEAN } from '#constants/common'
import AssetInventoryDetailThresholdTable from '#pages/asset-inventory/detail/components/AssetInventoryDetailThresholdTable'
import { loadAssetModelWithData } from '#services/asset-model'
import { loadAssetTypeWithData } from '#services/asset-type'
import { loadManufacturers } from '#services/manufacturer'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { getCoreModelAsset } from '../../../model-asset-management/model-asset.service'
import { ASSET_TYPE } from '../../list/libs/asset-inventory-list.constants'
import AssetInventoryAssetModelMoreForm from './AssetInventoryAssetModelMoreForm'
import AssetInventoryExpandCollapseTable from './AssetInventoryExpandCollapseTable'
import AssetInventoryManufactureMoreForm from './AssetInventoryManufactureMoreForm'

type AssetInventorySpeciticationSectionProps = {
  anotherOption: OptionType[]
  errors: any
  isEditPage: boolean
}

export const AssetInventorySpecificationSection = ({
  anotherOption,
  errors,
}: AssetInventorySpeciticationSectionProps) => {
  const { t } = useTranslation(['assetInventory'])
  const { control, setValue, trigger, watch } = useFormContext()
  const [assetTypeId, setAssetTypeId] = useState<number | undefined>(undefined)

  const { data: datasource, isLoading } = useQuery({
    queryKey: ['asset-model', assetTypeId],
    queryFn: () =>
      getCoreModelAsset(
        {
          asset_type_ids: Number(assetTypeId),
          page: 1,
          paginate: 100,
        },
        true
      ),
    enabled: Boolean(assetTypeId),
  })

  const { asset_type, asset_model } = watch()

  const assetTypeHasTemperatureThresholds = useMemo(() => {
    const hasThresholds = asset_type?.data?.temperature_thresholds?.length
      ? Boolean(asset_type?.data?.temperature_thresholds?.length)
      : Boolean(asset_type?.temperature_thresholds?.length)
    return hasThresholds
  }, [asset_type])

  const assetTypeHasHumidityThresholds = useMemo(() => {
    const hasThresholds = asset_type?.data?.humidity_thresholds?.length
      ? Boolean(asset_type?.data?.humidity_thresholds?.length)
      : Boolean(asset_type?.humidity_thresholds?.length)
    return hasThresholds
  }, [asset_type])

  const assetModelHasCapacity = useMemo(() => {
    const hasCapacity = asset_model?.data?.capacities?.length
      ? Boolean(asset_model?.data?.capacities?.length)
      : Boolean(asset_model?.capacities?.length)
    return hasCapacity
  }, [asset_model])

  return (
    <div className="ui-w-full ui-grid ui-grid-cols-1 ui-gap-4 ui-border ui-rounded-md ui-p-6 ui-mb-6">
      <div className="ui-font-bold ui-text-primary ui-text-dark-blue">
        {t('assetInventory:form.title.asset_specifications')}
      </div>

      <FormControl className="ui-w-full">
        <FormLabel htmlFor="asset_type" required>
          {t('assetInventory:columns.asset_type.label')}
        </FormLabel>
        <Controller
          name="asset_type"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <ReactSelectAsync
              {...field}
              key={`asset_type__${field.value?.value}`}
              id="asset_type"
              isClearable
              disabled={false}
              loadOptions={loadAssetTypeWithData}
              onChange={(selected) => {
                setAssetTypeId(Number(selected?.value))
                field.onChange(selected)
                const isOwnershipType = [
                  ASSET_TYPE.VACCINE_CARRIER,
                  ASSET_TYPE.FREEZE_INDICATOR,
                ].includes(Number(selected?.value))
                setValue(
                  'is_electricity',
                  Boolean(selected?.is_electricity ?? 0)
                )
                setValue('is_ownership_type', isOwnershipType)
                setValue('asset_electricity_available', null)
                setValue('manufacture', null)
                trigger('asset_electricity_available')
                setValue('asset_model', null)
              }}
              placeholder={t('assetInventory:type_to_search')}
              additional={{
                page: 1,
              }}
              error={!!error?.message}
            />
          )}
        />
        {errors?.asset_type?.message && (
          <FormErrorMessage>{errors?.asset_type?.message}</FormErrorMessage>
        )}
        {datasource?.data?.length === 0 && (
          <p className="ui-text-sm ui-leading-[20px] !ui-mb-4 !ui-text-[#737373]">
            {t('assetInventory:form.information.other_option.no_model')}
          </p>
        )}
        {assetTypeHasTemperatureThresholds && (
          <AssetInventoryExpandCollapseTable
            title={t('assetInventory:detail.temperature_threshold')}
          >
            <AssetInventoryDetailThresholdTable
              tableHead={[
                t('assetInventory:temperature_logger.minimum'),
                t('assetInventory:temperature_logger.maximum'),
              ]}
              type="temperature_threshold"
              data={
                asset_type?.data?.temperature_thresholds?.length
                  ? asset_type?.data?.temperature_thresholds
                  : asset_type?.temperature_thresholds
              }
            />
          </AssetInventoryExpandCollapseTable>
        )}
        {assetTypeHasHumidityThresholds && (
          <AssetInventoryExpandCollapseTable
            title={t('assetInventory:detail.humidity_threshold')}
          >
            <AssetInventoryDetailThresholdTable
              tableHead={[
                t('assetInventory:humidity_logger.minimum'),
                t('assetInventory:humidity_logger.maximum'),
              ]}
              type="humidity_threshold"
              data={
                asset_type?.data?.humidity_thresholds?.length
                  ? asset_type?.data?.humidity_thresholds
                  : asset_type?.humidity_thresholds
              }
            />
          </AssetInventoryExpandCollapseTable>
        )}
      </FormControl>

      <FormControl className="ui-w-full">
        <FormLabel htmlFor="asset_model" required>
          {t('assetInventory:columns.asset_model')}
        </FormLabel>
        <Controller
          name="asset_model"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <ReactSelectAsync
              {...field}
              key={`asset_model__${watch('asset_type')?.value}__${field.value?.value}`}
              id="asset_model"
              isClearable
              disabled={
                !watch('asset_type') ||
                watch('asset_type')?.value === 'other' ||
                isLoading
              }
              loadOptions={loadAssetModelWithData}
              placeholder={t('assetInventory:type_to_search')}
              onChange={(
                selected: OptionType & {
                  data: {
                    manufacture_id: number
                    manufacture_name: string
                  }
                }
              ) => {
                field.onChange(selected)
                setValue('asset_model', selected)
                setValue(
                  'manufacture',
                  selected?.data?.manufacture_id
                    ? {
                        label: selected?.data?.manufacture_name,
                        value: selected?.data?.manufacture_id,
                      }
                    : undefined
                )
                trigger('manufacture')
              }}
              additional={{
                page: 1,
                only_logger:
                  watch('asset_type')?.value ===
                  ASSET_TYPE.REMOTE_TEMPERATURE_MONITORING
                    ? BOOLEAN.TRUE
                    : BOOLEAN.FALSE,
                ...(!isNaN(watch('asset_type')?.value) && {
                  asset_type_ids: watch('asset_type')?.value,
                }),
                manufacture_id: watch('manufacture')?.value ?? null,
              }}
              error={!!error?.message}
            />
          )}
        />
        {errors?.asset_model?.message && (
          <FormErrorMessage>{errors?.asset_model?.message}</FormErrorMessage>
        )}
        {assetModelHasCapacity && (
          <AssetInventoryExpandCollapseTable
            title={t('assetInventory:capacity.button')}
          >
            <AssetInventoryDetailThresholdTable
              tableHead={[
                t('assetInventory:capacity.netto_capacity'),
                t('assetInventory:capacity.gross_capacity'),
              ]}
              type="capacity"
              data={
                asset_model?.data?.capacities?.length
                  ? asset_model?.data?.capacities
                  : asset_model?.capacities
              }
            />
          </AssetInventoryExpandCollapseTable>
        )}
      </FormControl>
      {watch('asset_model')?.value === 'other' && (
        <AssetInventoryAssetModelMoreForm />
      )}
      {watch('asset_type')?.value !== 'other' &&
        watch('manufacture')?.value === 'other' && (
          <FormControl className="ui-w-full" />
        )}
      <FormControl className="ui-w-full">
        <FormLabel htmlFor="manufacture" required>
          {t('assetInventory:columns.manufacture.label')}
        </FormLabel>
        <Controller
          name="manufacture"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <ReactSelectAsync
              {...field}
              key={`manufacture__${watch('asset_model')?.value}__${field.value?.value}`}
              id="manufacture"
              isClearable
              disabled
              loadOptions={loadManufacturers}
              onChange={(selected) => {
                field.onChange(selected)
              }}
              placeholder={t('assetInventory:type_to_search')}
              additional={{
                page: 1,
                another_option: anotherOption,
              }}
              error={!!error?.message}
            />
          )}
        />
        {errors?.manufacture?.message && (
          <FormErrorMessage>{errors?.manufacture?.message}</FormErrorMessage>
        )}
      </FormControl>
      {watch('manufacture')?.value === 'other' && (
        <AssetInventoryManufactureMoreForm />
      )}
      <FormControl className="ui-w-full">
        <FormLabel htmlFor="serial_number" required>
          {t('assetInventory:columns.serial_number')}
        </FormLabel>
        <div className="ui-border ui-rounded ui-border-grey-200 ui-py-3 ui-px-4 ui-bg-[#F1F5F9]">
          <div className="ui-flex ui-flex-row ui-items-center ui-mb-1">
            <InformationCircleIcon className="ui-h-5 ui-w-5 ui-text-grey-500 ui-inline-block ui-mr-1 ui-font-bold" />
            <p className="ui-text-xs ui-font-bold">
              {t('form.information.serial_number.title')}
            </p>
          </div>
          <p className="ui-text-xs ui-text-grey-500">
            {t('form.information.serial_number.description')}
          </p>
        </div>
        <Controller
          name="serial_number"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              id="serial_number"
              placeholder={t('assetInventory:columns.serial_number')}
              error={!!error?.message}
            />
          )}
        />
        {errors?.serial_number?.message && (
          <FormErrorMessage>{errors?.serial_number?.message}</FormErrorMessage>
        )}
      </FormControl>
    </div>
  )
}

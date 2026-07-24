import { useCallback, useEffect } from 'react'
import { Row } from '@tanstack/react-table'
import { DataTable } from '#components/data-table'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import Warning from '#components/icons/Warning'
import { Controller, UseFormSetValue } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { ThresholdType } from '../asset-type.constants'
import { AssetTypeThresholds, CreateAssetTypeBody } from '../asset-type.type'
import useAssetTypeThresholdTableForm from '../hooks/useAssetTypeThresholdTableForm'

export default function AssetTypeThresholdSelection({
  defaultValues,
  isEdit,
  isAdjustable,
  type,
  isWarehouse,
  setValue,
}: Readonly<{
  defaultValues?: CreateAssetTypeBody
  isEdit: boolean
  isAdjustable: boolean
  type: ThresholdType.TEMPERATURE | ThresholdType.HUMIDITY
  isWarehouse?: boolean
  setValue?: UseFormSetValue<CreateAssetTypeBody>
  isWarehouseChecked?: boolean
}>) {
  const { t } = useTranslation('assetType')

  const {
    selectedTresholds: selectedTemperatureTresholds,
    loadingTresholds: loadingTemperatureTresholds,
    savedTresholds: savedTemperatureTresholds,
    handleCheck: handleTemperatureCheck,
    tresholdData: temperatureTresholdData,
    control,
    schema: temperatureSchema,
  } = useAssetTypeThresholdTableForm({
    defaultValues,
    isEdit,
    isAdjustable,
    type: ThresholdType.TEMPERATURE,
  })

  const {
    selectedTresholds: selectedHumidityTresholds,
    loadingTresholds: loadingHumidityTresholds,
    savedTresholds: savedHumidityTresholds,
    handleCheck: handleHumidityCheck,
    tresholdData: humidityTresholdData,
    schema: humiditySchema,
  } = useAssetTypeThresholdTableForm({
    defaultValues,
    isEdit,
    isAdjustable,
    type: ThresholdType.HUMIDITY,
  })

  const handleTemperatureRowClick = useCallback(
    (row: Row<AssetTypeThresholds>) => {
      const currentId = Number(row.id)
      const isSelected = selectedTemperatureTresholds?.some(
        (item) => item.id === currentId
      )
      const isSaved = savedTemperatureTresholds?.some(
        (item) => item.id === currentId
      )

      if (isSelected && isSaved) return

      handleTemperatureCheck(row?.original)
    },
    [
      selectedTemperatureTresholds,
      savedTemperatureTresholds,
      handleTemperatureCheck,
    ]
  )

  const handleHumidityRowClick = useCallback(
    (row: Row<AssetTypeThresholds>) => {
      const currentId = Number(row.id)
      const isSelected = selectedHumidityTresholds?.some(
        (item) => item.id === currentId
      )
      const isSaved = savedHumidityTresholds?.some(
        (item) => item.id === currentId
      )

      if (isSelected && isSaved) return

      handleHumidityCheck(row?.original)
    },
    [selectedHumidityTresholds, savedHumidityTresholds, handleHumidityCheck]
  )

  const renderTemperatureTable = () => (
    <Controller
      control={control}
      name="temperature_thresholds"
      render={({ fieldState: { error } }) => (
        <FormControl>
          <FormLabel required>
            {t('form.detail.temperature_threshold.label')}
          </FormLabel>
          <div className="ui-rounded ui-bg-slate-100 ui-px-4 ui-py-[9px] ui-flex ui-gap-2 ui-items-center">
            <Warning />
            <p className="ui-text-xs ui-font-normal">
              {t('form.detail.temperature_threshold.warning')}
            </p>
          </div>
          <DataTable
            isLoading={loadingTemperatureTresholds}
            columns={temperatureSchema}
            data={temperatureTresholdData}
            onClickRow={handleTemperatureRowClick}
          />
          {error && <FormErrorMessage>{error.message}</FormErrorMessage>}
        </FormControl>
      )}
    />
  )

  const renderHumidityTable = () => (
    <Controller
      control={control}
      name="humidity_thresholds"
      render={({ fieldState: { error } }) => (
        <FormControl>
          <FormLabel required>
            {t('form.detail.humidity_threshold.label')}
          </FormLabel>
          <div className="ui-rounded ui-bg-slate-100 ui-px-4 ui-py-[9px] ui-flex ui-gap-2 ui-items-center">
            <Warning />
            <p className="ui-text-xs ui-font-normal">
              {t('form.detail.humidity_threshold.warning')}
            </p>
          </div>
          <DataTable
            isLoading={loadingHumidityTresholds}
            columns={humiditySchema}
            data={humidityTresholdData}
            onClickRow={handleHumidityRowClick}
          />
          {error && <FormErrorMessage>{error.message}</FormErrorMessage>}
        </FormControl>
      )}
    />
  )

  useEffect(() => {
    if (isWarehouse && humidityTresholdData) {
      setValue?.('humidity_thresholds', [{ id: humidityTresholdData?.[0]?.id }])
    } else {
      setValue?.('humidity_thresholds', [])
    }
  }, [humidityTresholdData, isWarehouse])

  return (
    <div className="ui-space-y-6">
      {type === ThresholdType.TEMPERATURE && renderTemperatureTable()}
      {type === ThresholdType.HUMIDITY && renderHumidityTable()}
    </div>
  )
}

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '#components/checkbox'
import { DataTable } from '#components/data-table'
import { Radio } from '#components/radio'
import { numberFormatter } from '#utils/formatter'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { ThresholdType } from '../asset-type.constants'
import {
  getAssetTypeHumidityTresholds,
  getAssetTypeTemperatureTresholds,
} from '../asset-type.service'
import {
  AssetTypeThresholds,
  CreateAssetTypeBody,
  DetailAssetTypeResponse,
} from '../asset-type.type'

const useAssetTypeThresholdTableForm = ({
  defaultValues,
  isEdit,
  isAdjustable,
  type,
}: {
  defaultValues?: CreateAssetTypeBody
  isEdit: boolean
  isAdjustable: boolean
  type: ThresholdType.TEMPERATURE | ThresholdType.HUMIDITY
}) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['assetType', 'common'])
  const { control, setValue, watch } = useFormContext<CreateAssetTypeBody>()

  const isWarehouse = watch('is_cce_warehouse')

  const selectedTresholds =
    type === ThresholdType.TEMPERATURE
      ? watch('temperature_thresholds')
      : watch('humidity_thresholds')
  const savedTresholds =
    type === ThresholdType.TEMPERATURE
      ? defaultValues?.temperature_thresholds
      : defaultValues?.humidity_thresholds

  const { data: temperatureTresholds, isLoading: loadingTemperatureTresholds } =
    useQuery({
      queryKey: ['asset-type-temperature-thresholds'],
      queryFn: () =>
        getAssetTypeTemperatureTresholds({
          page: 1,
          paginate: 10,
          is_predefined: isWarehouse ? 2 : 1,
        }),
      enabled: type === ThresholdType.TEMPERATURE,
    })

  const { data: humidityTresholds, isLoading: loadingHumidityTresholds } =
    useQuery({
      queryKey: ['asset-type-humidity-thresholds'],
      queryFn: () =>
        getAssetTypeHumidityTresholds({
          page: 1,
          paginate: 10,
          is_predefined: isWarehouse ? 2 : 1,
        }),
      enabled: type === ThresholdType.HUMIDITY,
    })

  const classRow = (item: AssetTypeThresholds) => {
    const isSaved = Boolean(
      savedTresholds?.filter((treshold) => treshold.id === Number(item.id))
        ?.length
    )
    if (
      isSaved ||
      type === ThresholdType.HUMIDITY ||
      (isEdit && !isAdjustable)
    ) {
      return 'ui-bg-neutral-100 ui-cursor-not-allowed'
    }
    return ''
  }

  const handleUncheck = (
    itemId: number,
    value: any,
    onChange: (...event: any[]) => void
  ) => {
    const filtered = value?.filter((val: any) => val?.id !== itemId)
    onChange(filtered)
  }

  const handleCheck = (row: AssetTypeThresholds) => {
    const fieldName =
      type === ThresholdType.TEMPERATURE
        ? 'temperature_thresholds'
        : 'humidity_thresholds'
    const currentId = Number(row.id)
    const selected = selectedTresholds || []
    const isSelected = selected.some((item) => item.id === currentId)

    if (isSelected) {
      handleUncheck(currentId, selectedTresholds, (val: any) =>
        setValue(fieldName, val)
      )
      return
    }
    if (isAdjustable) {
      return setValue(fieldName, [...selected, { id: currentId }])
    }
    if (!isEdit) {
      return setValue(fieldName, [{ id: currentId }])
    }
    return null
  }

  const tresholdData =
    type === ThresholdType.TEMPERATURE
      ? temperatureTresholds?.data
      : humidityTresholds?.data

  const schema: ColumnDef<AssetTypeThresholds>[] = useMemo(
    () => [
      {
        header: '',
        accessorKey: 'selection',
        meta: { cellClassName: ({ original }) => classRow(original) },
        size: 50,
        cell: ({ row }) => {
          const statusChecked = Boolean(
            selectedTresholds?.filter(
              (treshold) => treshold.id === Number(row.original.id)
            )?.length
          )
          const isSaved = Boolean(
            savedTresholds?.filter(
              (treshold) => treshold.id === Number(row.original.id)
            )?.length
          )
          if (isAdjustable) {
            return (
              <Checkbox
                checked={statusChecked}
                disabled={isEdit && isSaved}
                value={statusChecked ? 1 : 0}
                onChange={() => {
                  handleCheck(row.original)
                }}
              />
            )
          }
          return (
            <Radio
              checked={statusChecked}
              disabled={(isEdit && isSaved) || (isEdit && !isAdjustable)}
              value={statusChecked ? 1 : 0}
              onChange={() => {
                handleCheck(row.original)
              }}
            />
          )
        },
      },
      ...(type === ThresholdType.TEMPERATURE
        ? ([
            {
              header: t(
                'form.detail.temperature_threshold.column.min_temperature'
              ),
              accessorKey: 'min_temperature',
              size: 150,
              meta: { cellClassName: ({ original }) => classRow(original) },
              cell: ({ row }: any) => {
                return `${numberFormatter(
                  row.original.min_temperature,
                  language
                )} °C`
              },
            },
            {
              header: t(
                'form.detail.temperature_threshold.column.max_temperature'
              ),
              accessorKey: 'max_temperature',
              size: 150,
              meta: { cellClassName: ({ original }) => classRow(original) },
              cell: ({ row }: any) => {
                return `${numberFormatter(
                  row.original.max_temperature,
                  language
                )} °C`
              },
            },
          ] as ColumnDef<AssetTypeThresholds>[])
        : ([
            {
              header: t('form.detail.humidity_threshold.column.min_humidity'),
              accessorKey: 'min_humidity',
              size: 150,
              meta: { cellClassName: ({ original }) => classRow(original) },
              cell: ({ row }: any) => {
                return `${numberFormatter(row.original.min_humidity, language)} %`
              },
            },
            {
              header: t('form.detail.humidity_threshold.column.max_humidity'),
              accessorKey: 'max_humidity',
              size: 150,
              meta: { cellClassName: ({ original }) => classRow(original) },
              cell: ({ row }: any) => {
                return `${numberFormatter(row.original.max_humidity, language)} %`
              },
            },
          ] as ColumnDef<AssetTypeThresholds>[])),
    ],
    [selectedTresholds, savedTresholds, type, language]
  )

  const schemaHumidityThreshold: ColumnDef<AssetTypeThresholds>[] = useMemo(
    () => [
      {
        header: '',
        accessorKey: 'selection',
        meta: { cellClassName: ({ original }) => classRow(original) },
        size: 50,
        cell: ({ row }) => {
          const statusChecked = Boolean(
            selectedTresholds?.filter(
              (treshold) => treshold.id === Number(row.original.id)
            )?.length
          )

          return (
            <Radio
              checked={statusChecked}
              disabled
              value={statusChecked ? 1 : 0}
              onChange={() => {
                handleCheck(row.original)
              }}
            />
          )
        },
      },
      {
        header: t('form.detail.humidity_threshold.column.min_humidity'),
        accessorKey: 'min_humidity',
        size: 150,
        meta: { cellClassName: ({ original }) => classRow(original) },
        cell: ({ row }: any) => {
          return `${numberFormatter(row.original.min_humidity, language)} %`
        },
      },
      {
        header: t('form.detail.humidity_threshold.column.max_humidity'),
        accessorKey: 'max_humidity',
        size: 150,
        meta: { cellClassName: ({ original }) => classRow(original) },
        cell: ({ row }: any) => {
          return `${numberFormatter(row.original.max_humidity, language)} %`
        },
      },
    ],
    [selectedTresholds, savedTresholds, type, language]
  )

  const generateAssetUtilization = (detail?: DetailAssetTypeResponse) => {
    const hasTreshold = detail?.temperature_thresholds?.length ?? 0
    const thresholdData =
      type === ThresholdType.TEMPERATURE
        ? temperatureTresholds?.data
        : humidityTresholds?.data
    const thresholdLabel =
      type === ThresholdType.TEMPERATURE
        ? t('form.detail.label.temperature_threshold')
        : t('form.detail.label.humidity_threshold.label')

    return [
      {
        label: t('form.detail.label.is_cce_equipment'),
        value: detail?.name ?? '-',
      },
      {
        label: thresholdLabel,
        value: hasTreshold ? (
          <div className="ui-grid ui-grid-cols-3">
            <DataTable columns={schema} data={thresholdData} />
          </div>
        ) : (
          '-'
        ),
      },
    ]
  }

  return {
    tresholdData,
    selectedTresholds,
    loadingTresholds:
      type === ThresholdType.TEMPERATURE
        ? loadingTemperatureTresholds
        : loadingHumidityTresholds,
    savedTresholds,
    schema:
      type === ThresholdType.TEMPERATURE ? schema : schemaHumidityThreshold,
    control,
    watch,
    handleCheck,
    handleUncheck,
    generateAssetUtilization,
    temperatureTresholds: temperatureTresholds?.data,
    humidityTresholds: humidityTresholds?.data,
    loadingTemperatureTresholds,
    loadingHumidityTresholds,
  }
}

export default useAssetTypeThresholdTableForm

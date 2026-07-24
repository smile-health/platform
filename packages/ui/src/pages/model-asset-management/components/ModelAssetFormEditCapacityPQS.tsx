import { Fragment, useEffect, useMemo } from 'react'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { InputNumber } from '#components/input-number'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { CapacityDetail } from '../../pqs/pqs.types'
import {
  CreateModelAssetBody,
  DetailModelAssetResponse,
} from '../asset-model.type'

export type TCapacityType = {
  id: string
  label: string
  placeholder: string
}

export type TFieldType = {
  temperature_threshold_id?: number | null
  label: string
  gross_capacity: TCapacityType
  net_capacity: TCapacityType
  disabled?: boolean
}

export type ModelAssetFormEditCapacityPQSProps = {
  fields?: TFieldType[]
  isEdit?: boolean
  data?: DetailModelAssetResponse
  capacityPQSFields?: {
    id: string
    label: string
    category: string
    temperature_threshold_id: number
  }[]
}

function ModelAssetFormEditCapacityPQS({
  fields,
  isEdit,
  data,
  capacityPQSFields,
}: Readonly<ModelAssetFormEditCapacityPQSProps>) {
  const { t } = useTranslation('modelAsset')
  const {
    watch,
    control,
    setValue,
    trigger,
    formState: { errors },
  } = useFormContext<CreateModelAssetBody>()

  const { asset_model_capacity, asset_type_id } = watch()

  useEffect(() => {
    if (isEdit) {
      asset_model_capacity?.capacities?.forEach((item, index) => {
        const samePqsAsData =
          asset_model_capacity?.pqs_code_id?.value === data?.pqs_code_id

        const targetThresholdId =
          asset_model_capacity?.pqs_code_id?.data?.capacities?.[index]
            ?.id_temperature_threshold

        let isDisabled = false
        if (samePqsAsData) {
          const whoCaps = data?.net_capacities_who || []
          isDisabled = !whoCaps.some((who) => who?.category === item.category)
        } else if (targetThresholdId) {
          const thresholds = asset_type_id?.data?.temperature_thresholds || []
          isDisabled = !thresholds.some(
            (th) => th.temperature_threshold_id === targetThresholdId
          )
        }
        setValue(`asset_model_capacity.capacities.${index}`, {
          field_name: capacityPQSFields?.[index]?.id,
          id_temperature_threshold: item.id_temperature_threshold ?? undefined,
          gross_capacity: item?.gross_capacity,
          net_capacity: item?.net_capacity,
          category: item?.category ?? undefined,
          is_disabled: isDisabled,
          id: item?.id,
        })
      })
    } else if (asset_model_capacity?.pqs_code_id) {
      const thresholds = asset_type_id?.data?.temperature_thresholds || []
      const pqsCaps = asset_model_capacity?.pqs_code_id?.data?.capacities || []

      thresholds.forEach((item, index) => {
        const thresholdId = item?.temperature_threshold_id
        const field = capacityPQSFields?.find(
          (f) => f.temperature_threshold_id === thresholdId
        )
        if (!field) return

        const pqsCapObj = pqsCaps.find(
          (c) => c?.id_temperature_threshold === thresholdId
        )

        const netVal =
          pqsCapObj?.[field.id as keyof CapacityDetail] ?? undefined

        setValue(`asset_model_capacity.capacities.${index}`, {
          field_name: field.id,
          id_temperature_threshold: thresholdId ?? undefined,
          gross_capacity: undefined,
          net_capacity: netVal,
          is_disabled: Boolean(netVal),
        })
      })
    } else {
      setValue(
        'asset_model_capacity.capacities',
        asset_type_id?.data?.temperature_thresholds?.map((item, index) => {
          return {
            field_name: capacityPQSFields?.[index]?.id,
            id_temperature_threshold:
              item.temperature_threshold_id ?? undefined,
            gross_capacity: isEdit
              ? asset_model_capacity?.capacities?.[index]?.gross_capacity
              : undefined,
            net_capacity: undefined,
            is_disabled: false,
          }
        })
      )
    }
  }, [asset_type_id, asset_model_capacity?.pqs_code_id, isEdit, setValue, data])

  const capacityForms = useMemo(() => {
    const formFields = fields?.map((item, index) => ({
      ...item,
      gross_capacity: {
        ...item.gross_capacity,
        value:
          asset_model_capacity?.capacities?.[index]?.gross_capacity ??
          undefined,
      },
      net_capacity: {
        ...item.net_capacity,
        value:
          asset_model_capacity?.capacities?.[index]?.net_capacity ?? undefined,
      },
    }))
    return formFields
  }, [
    asset_model_capacity?.capacities,
    asset_model_capacity?.pqs_code_id,
    fields,
    t,
  ])

  return (
    <div className="ui-grid ui-grid-cols-2 ui-gap-4">
      {capacityForms?.map((field, index) => {
        return (
          <Fragment key={field.temperature_threshold_id}>
            <FormControl>
              <FormLabel required>{field.gross_capacity?.label}</FormLabel>
              <Controller
                name={`asset_model_capacity.capacities.${index}.gross_capacity`}
                control={control}
                render={() => (
                  <InputNumber
                    hideStepper
                    id={`asset_model_capacity.capacities.${index}.gross_capacity`}
                    placeholder={field.gross_capacity?.placeholder}
                    disabled={!!data?.is_related_asset}
                    value={
                      watch(
                        `asset_model_capacity.capacities.${index}.gross_capacity`
                      ) ?? undefined
                    }
                    onChange={(value) => {
                      setValue(
                        `asset_model_capacity.capacities.${index}.gross_capacity`,
                        value ?? undefined
                      )
                      trigger(
                        `asset_model_capacity.capacities.${index}.gross_capacity`
                      )
                      trigger(
                        `asset_model_capacity.capacities.${index}.net_capacity`
                      )
                    }}
                  />
                )}
              />
              {errors?.asset_model_capacity?.capacities?.[index]?.gross_capacity
                ?.message && (
                <FormErrorMessage>
                  {
                    errors?.asset_model_capacity?.capacities?.[index]
                      ?.gross_capacity?.message
                  }
                </FormErrorMessage>
              )}
            </FormControl>
            <FormControl>
              <FormLabel required>{field.net_capacity?.label}</FormLabel>
              <Controller
                name={`asset_model_capacity.capacities.${index}.net_capacity`}
                control={control}
                render={() => (
                  <InputNumber
                    hideStepper
                    disabled={
                      isEdit ||
                      watch(
                        `asset_model_capacity.capacities.${index}.is_disabled`
                      )
                    }
                    id={`asset_model_capacity.capacities.${index}.net_capacity`}
                    name={`asset_model_capacity.capacities.${index}.net_capacity`}
                    placeholder={field.net_capacity?.placeholder}
                    value={
                      watch(
                        `asset_model_capacity.capacities.${index}.net_capacity`
                      ) ?? undefined
                    }
                    onChange={(value) => {
                      setValue(
                        `asset_model_capacity.capacities.${index}.net_capacity`,
                        value ?? undefined
                      )
                      trigger(
                        `asset_model_capacity.capacities.${index}.net_capacity`
                      )
                      trigger(
                        `asset_model_capacity.capacities.${index}.gross_capacity`
                      )
                    }}
                  />
                )}
              />
              {errors?.asset_model_capacity?.capacities?.[index]?.net_capacity
                ?.message && (
                <FormErrorMessage>
                  {
                    errors?.asset_model_capacity?.capacities?.[index]
                      ?.net_capacity?.message
                  }
                </FormErrorMessage>
              )}
            </FormControl>
          </Fragment>
        )
      })}
    </div>
  )
}

export default ModelAssetFormEditCapacityPQS

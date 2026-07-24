import { useCallback, useMemo } from 'react'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import Warning from '#components/icons/Warning'
import { Radio, RadioGroup } from '#components/radio'
import { BOOLEAN } from '#constants/common'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { assetTypeIsCCEEquipment, ThresholdType } from '../asset-type.constants'
import { CreateAssetTypeBody } from '../asset-type.type'
import AssetTypeThresholdSelection from './AssetTypeThresholdSelection'

const AssetTypeFormUtilization: React.FC<{
  defaultValues?: CreateAssetTypeBody
  isEdit: boolean
}> = ({ defaultValues, isEdit }) => {
  const { t } = useTranslation('assetType')
  const {
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = useFormContext<CreateAssetTypeBody>()

  const isCCEEquipment = watch('is_cce')
  const isWarehouse = watch('is_warehouse')
  const isAdjustable = watch('is_temperature_adjustable')

  const handleRadioChange = useCallback(
    (fieldName: keyof CreateAssetTypeBody, optionId: number) => {
      setValue(fieldName, Number(optionId))
      setValue('temperature_thresholds', [])
      clearErrors(fieldName)
      if (fieldName === 'is_cce') {
        setValue('is_temperature_adjustable', undefined)
      }
      if (fieldName === 'is_warehouse' && optionId === BOOLEAN.TRUE) {
        setValue('is_cce_warehouse', BOOLEAN.TRUE)
      }
    },
    [setValue, clearErrors]
  )

  const cceOptions = [
    {
      id: 'radio_group_is_cce',
      field_name: 'is_cce',
      label: t('form.detail.is_cce_equipment.label'),
      options: assetTypeIsCCEEquipment(t),
      defaultChecked: isCCEEquipment,
      error: errors?.is_cce?.message,
      disabled: isEdit || !!isWarehouse,
    },
    {
      id: 'radio_group_is_warehouse',
      field_name: 'is_warehouse',
      label: t('form.detail.is_warehouse.label'),
      options: assetTypeIsCCEEquipment(t),
      defaultChecked: isWarehouse,
      error: errors?.is_warehouse?.message,
      disabled: isEdit || !!isCCEEquipment,
    },
    {
      id: 'radio_group_is_temperature_adjustable',
      field_name: 'is_temperature_adjustable',
      label: t('form.detail.is_adjustable.label'),
      options: assetTypeIsCCEEquipment(t),
      defaultChecked: isAdjustable,
      error: errors?.is_temperature_adjustable?.message,
      disabled: isEdit,
    },
  ]

  const isCCEChecked = useMemo(() => Boolean(isCCEEquipment), [isCCEEquipment])
  const isWarehouseChecked = useMemo(() => Boolean(isWarehouse), [isWarehouse])

  return (
    <div className="ui-p-4 ui-border ui-rounded">
      <div className="ui-mb-4 ui-font-bold ui-text-primary ui-text-dark-blue">
        {t('form.detail.header.asset_utilization')}
      </div>
      <div className="ui-flex ui-flex-col ui-space-y-5">
        {Boolean(defaultValues?.is_related_asset) && (
          <div className="ui-rounded ui-bg-slate-100 ui-px-4 ui-py-[9px] ui-flex ui-gap-2 ui-items-center">
            <Warning />
            <p className="ui-text-xs ui-font-normal">
              {t('form.detail.header.warning')}
            </p>
          </div>
        )}
        <div className="ui-grid ui-grid-cols-2 ui-gap-4">
          {cceOptions?.map((data) => {
            if (
              data?.field_name === 'is_temperature_adjustable' &&
              !isCCEEquipment &&
              !isWarehouseChecked
            )
              return null
            return (
              <FormControl key={data.id}>
                <FormLabel>{data.label}</FormLabel>
                <RadioGroup className="!ui-mt-5">
                  {data?.options?.map((option) => (
                    <Radio
                      key={option.id}
                      id={`${data?.id}_${option.id}`}
                      name={data.field_name}
                      value={option.id}
                      disabled={data?.disabled}
                      checked={Number(data.defaultChecked) === option.id}
                      onChange={(e) => {
                        handleRadioChange(
                          data?.field_name as keyof CreateAssetTypeBody,
                          Number(e.target.value)
                        )
                      }}
                      label={option.name}
                    />
                  ))}
                </RadioGroup>
                {data?.error && (
                  <FormErrorMessage>{data?.error}</FormErrorMessage>
                )}
              </FormControl>
            )
          })}
        </div>
        {(isCCEChecked || isWarehouseChecked) && (
          <AssetTypeThresholdSelection
            defaultValues={defaultValues}
            isEdit={isEdit}
            isAdjustable={Boolean(isAdjustable)}
            type={ThresholdType.TEMPERATURE}
          />
        )}
        {isWarehouseChecked && (
          <AssetTypeThresholdSelection
            defaultValues={defaultValues}
            isEdit={isEdit}
            isAdjustable={Boolean(isAdjustable)}
            type={ThresholdType.HUMIDITY}
            isWarehouse={isWarehouseChecked}
            setValue={setValue}
          />
        )}
      </div>
    </div>
  )
}

export default AssetTypeFormUtilization

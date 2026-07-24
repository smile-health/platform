import { Fragment, useEffect, useMemo } from 'react'
import { Button } from '#components/button'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import Plus from '#components/icons/Plus'
import Trash from '#components/icons/Trash'
import { InputNumber } from '#components/input-number'
import cx from '#lib/cx'
import { Controller, useFieldArray, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { CreateModelAssetBody } from '../asset-model.type'

const ModelAssetFormEditCapacity = ({
  isEdit,
  defaultValues,
}: {
  isEdit?: boolean
  defaultValues?: CreateModelAssetBody
}) => {
  const { t } = useTranslation('modelAsset')
  const {
    watch,
    control,
    setValue,
    trigger,
    formState: { errors },
  } = useFormContext<CreateModelAssetBody>()

  const {
    append,
    remove,
    fields: fieldData,
  } = useFieldArray({
    name: 'asset_model_capacity.capacities',
    control,
  })

  const canAddMoreCapacity = useMemo(
    () =>
      fieldData.length < 3 &&
      Boolean(!!isEdit || !defaultValues?.is_related_asset),
    [fieldData.length, isEdit, defaultValues?.is_related_asset]
  )

  useEffect(() => {
    if (!fieldData.length) {
      append(
        {
          id_temperature_threshold: null,
          gross_capacity: undefined,
          net_capacity: undefined,
        },
        { shouldFocus: false }
      )
    } else {
      return
    }
  }, [fieldData.length, append])

  return (
    <Fragment>
      {fieldData.map((item, index) => {
        const disableRemoveCapacity =
          isEdit &&
          Boolean(
            defaultValues?.asset_model_capacity?.capacities?.[index]
              ?.net_capacity
          ) &&
          Boolean(
            defaultValues?.asset_model_capacity?.capacities?.[index]
              ?.gross_capacity
          )

        return (
          <div
            className="ui-grid ui-grid-cols-2 ui-gap-4"
            key={item.id_temperature_threshold}
          >
            <FormControl>
              <FormLabel
                required
              >{`${t('form.detail.label.gross_capacity')} - ${index + 1}`}</FormLabel>
              <Controller
                name={`asset_model_capacity.capacities.${index}.gross_capacity`}
                control={control}
                render={() => (
                  <InputNumber
                    hideStepper
                    id={`gross_capacity_${index + 1}`}
                    placeholder={t('form.detail.placeholder.gross_capacity')}
                    value={
                      watch(
                        `asset_model_capacity.capacities.${index}.gross_capacity`
                      ) ?? undefined
                    }
                    disabled={isEdit && !!defaultValues?.is_related_asset}
                    onChange={(value) => {
                      setValue(
                        `asset_model_capacity.capacities.${index}.gross_capacity`,
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
              <FormLabel
                required
              >{`${t('form.detail.label.netto_capacity')} - ${index + 1}`}</FormLabel>
              <div
                className={cx({
                  'ui-flex ui-flex-row ui-items-center ui-gap-1': index > 0,
                  'ui-grid ui-grid-cols-1 ui-gap-1': index === 0,
                })}
              >
                <Controller
                  name={`asset_model_capacity.capacities.${index}.net_capacity`}
                  control={control}
                  render={() => (
                    <InputNumber
                      hideStepper
                      id={`net_capacity_${index + 1}`}
                      placeholder={t('form.detail.placeholder.netto_capacity')}
                      disabled={isEdit && !!defaultValues?.is_related_asset}
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
                {index !== 0 && (
                  <Button
                    type="button"
                    disabled={disableRemoveCapacity}
                    id={`remove_capacity_${index}`}
                    onClick={() => {
                      remove(index)
                    }}
                    variant="subtle"
                    color="danger"
                  >
                    <Trash />
                  </Button>
                )}
              </div>
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
          </div>
        )
      })}
      {canAddMoreCapacity && (
        <div>
          <Button
            leftIcon={<Plus />}
            id="add_capacity"
            type="button"
            onClick={() =>
              append({
                id_temperature_threshold: null,
                gross_capacity: undefined,
                net_capacity: undefined,
              })
            }
            variant="subtle"
          >
            {t('form.detail.label.add_more')}
          </Button>
        </div>
      )}
    </Fragment>
  )
}

export default ModelAssetFormEditCapacity

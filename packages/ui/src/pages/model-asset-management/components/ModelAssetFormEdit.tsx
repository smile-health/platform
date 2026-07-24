import { Dispatch, Fragment, SetStateAction, useMemo } from 'react'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { Checkbox } from '#components/checkbox'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import Warning from '#components/icons/Warning'
import { Input } from '#components/input'
import { OptionTypeWithData, ReactSelectAsync } from '#components/react-select'
import { AssetType, loadAssetTypeWithData } from '#services/asset-type'
import { loadManufacturers } from '#services/manufacturer'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Radio, RadioGroup } from '../../../components/radio/Radio'
import { loadPQSCode } from '../../pqs/pqs.service'
import { PQSDetail } from '../../pqs/pqs.types'
import {
  AssetUtilization,
  assetUtilizationSelections,
  capacityFields,
} from '../asset-model.constants'
import {
  CreateModelAssetBody,
  DetailModelAssetResponse,
} from '../asset-model.type'
import ModelAssetFormEditCapacity from './ModelAssetFormEditCapacity'
import ModelAssetFormEditCapacityPQS, {
  TFieldType,
} from './ModelAssetFormEditCapacityPQS'

const ModelAssetFormEdit = ({
  data,
  defaultValues,
  isEdit,
  setSearchName,
  isNameDuplicate,
  temperatureThresholds,
}: {
  data?: DetailModelAssetResponse
  defaultValues?: CreateModelAssetBody
  isEdit?: boolean
  setSearchName: Dispatch<SetStateAction<string>>
  isNameDuplicate: boolean
  temperatureThresholds?: number[]
}) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['modelAsset', 'common'])

  const {
    watch,
    control,
    setValue,
    clearErrors,
    register,
    trigger,
    formState: { errors },
  } = useFormContext<CreateModelAssetBody>()

  const {
    is_capacity,
    asset_type_id,
    asset_utilization,
    asset_model_capacity,
  } = watch()

  const capacityPQSFields = useMemo(() => {
    return capacityFields(temperatureThresholds || [])
  }, [temperatureThresholds])

  const isAssetTypeCCE = useMemo(() => {
    return isEdit
      ? !!defaultValues?.asset_model_capacity?.capacities?.length &&
          defaultValues?.asset_model_capacity?.capacities?.every((item) =>
            Object.hasOwn(item, 'category')
          )
      : asset_type_id?.data?.is_cce === 1
  }, [asset_type_id, defaultValues])

  const showIsCapacity = useMemo(
    () =>
      asset_utilization?.id === AssetUtilization.Warehouse
        ? false
        : !!is_capacity || isAssetTypeCCE,
    [is_capacity, asset_type_id, isAssetTypeCCE, isEdit]
  )

  const capacityPqsForms = useMemo(() => {
    if (isEdit) {
      return asset_model_capacity?.capacities?.map((data) => {
        const field = capacityPQSFields.find(
          (f) => f.temperature_threshold_id === data.id_temperature_threshold
        )
        return {
          temperature_threshold_id: data.id_temperature_threshold,
          label: field?.label,
          gross_capacity: {
            id: 'gross_capacity',
            label: `${t('form.detail.label.gross_capacity')} ${field?.category}°C`,
            placeholder: t('form.detail.placeholder.gross_capacity'),
          },
          net_capacity: {
            id: 'net_capacity',
            label: `${t('form.detail.label.netto_capacity')} ${field?.category}°C`,
            placeholder: t('form.detail.placeholder.netto_capacity'),
          },
        }
      })
    } else {
      return asset_type_id?.data?.temperature_thresholds
        ?.map((data) => {
          const field = capacityPQSFields.find(
            (f) => f.temperature_threshold_id === data.temperature_threshold_id
          )
          if (!field) return null

          return {
            temperature_threshold_id: data.temperature_threshold_id,
            label: field.label,
            gross_capacity: {
              id: 'gross_capacity',
              label: `${t('form.detail.label.gross_capacity')} ${field.category}°C`,
              placeholder: t('form.detail.placeholder.gross_capacity'),
            },
            net_capacity: {
              id: 'net_capacity',
              label: `${t('form.detail.label.netto_capacity')} ${field.category}°C`,
              placeholder: t('form.detail.placeholder.netto_capacity'),
            },
            disabled: Boolean(defaultValues?.is_related_asset),
          }
        })
        ?.filter(Boolean)
    }
  }, [asset_type_id, isEdit, t, asset_model_capacity, capacityPQSFields])

  return (
    <Fragment>
      <div className="ui-p-4 ui-border ui-rounded">
        <div className="ui-mb-4 ui-font-bold ui-text-primary ui-text-dark-blue">
          {t('form.title.detail')}
        </div>
        <div className="ui-flex ui-flex-col ui-space-y-5">
          <FormControl>
            <FormLabel required>{t('form.detail.label.name')}</FormLabel>
            <Input
              {...register('name')}
              id="input-model-asset-name"
              name="name"
              placeholder={t('form.detail.placeholder.name')}
              onChange={(e) => {
                clearErrors('name')
                setSearchName(e.target.value)
              }}
            />
            {errors?.name?.message && (
              <FormErrorMessage>{errors?.name?.message}</FormErrorMessage>
            )}
            {isNameDuplicate && (
              <div className="ui-border ui-rounded ui-border-grey-200 ui-py-3 ui-px-4 ui-bg-[#F1F5F9] ui-mb-6 ui-flex ui-flex-row">
                <ExclamationCircleIcon className="ui-h-5 ui-w-5 ui-text-grey-500 ui-inline-block ui-mr-2 ui-font-bold" />
                <p className="ui-text-sm">
                  {t('form.detail.validation.name.duplicate')}
                </p>
              </div>
            )}
          </FormControl>

          <Controller
            control={control}
            name="asset_utilization"
            render={({ field: { value } }) => {
              return (
                <FormControl>
                  <FormLabel required>
                    {t('form.detail.label.asset_utilization.label')}
                  </FormLabel>
                  <div className="ui-flex ui-flex-row ui-gap-4">
                    {assetUtilizationSelections(t)?.map((data) => {
                      return (
                        <RadioGroup className="ui-mt-2" key={data?.id}>
                          <Radio
                            key={data?.id}
                            id={`${data?.id}`}
                            name={data.label}
                            value={JSON.stringify(data?.value)}
                            checked={data?.value?.id === value?.id}
                            defaultChecked={
                              defaultValues?.asset_utilization?.id ===
                              data?.value?.id
                            }
                            disabled={isEdit}
                            onClick={() => {
                              if (data?.value?.id === value?.id) {
                                setValue('asset_utilization', undefined)
                                setValue('asset_type_id', undefined)
                                setValue('manufacture_id', undefined)
                              }
                            }}
                            onChange={(e) => {
                              setValue(
                                'asset_utilization',
                                JSON.parse(e?.target?.value)
                              )
                              setValue('manufacture_id', undefined)
                              setValue('asset_type_id', undefined)
                            }}
                            label={data?.label}
                          />
                        </RadioGroup>
                      )
                    })}
                  </div>
                  {!!errors?.asset_utilization && (
                    <FormErrorMessage>
                      {errors?.asset_utilization?.message}
                    </FormErrorMessage>
                  )}
                </FormControl>
              )
            }}
          />

          {asset_utilization?.id && (
            <div className="ui-grid ui-grid-cols-2 ui-gap-4">
              <Controller
                control={control}
                name="asset_type_id"
                render={({
                  field: { value, onChange, ...field },
                  fieldState: { error },
                }) => {
                  return (
                    <FormControl>
                      <FormLabel htmlFor="select-type" required>
                        {t('form.detail.label.type')}
                      </FormLabel>
                      <ReactSelectAsync
                        {...field}
                        key={`type__${asset_type_id?.value}__${value?.value}__${asset_utilization?.id}`}
                        id="select-type"
                        disabled={isEdit || !!defaultValues?.is_related_asset}
                        isClearable
                        loadOptions={loadAssetTypeWithData}
                        onChange={(selected: OptionTypeWithData<AssetType>) => {
                          onChange(selected)
                          setValue('is_capacity', 0)
                          setValue('asset_model_capacity', {
                            pqs_code_id: null,
                            capacities: [],
                          })
                          clearErrors('asset_model_capacity')
                          trigger('manufacture_id')
                          setValue('manufacture_id', undefined)
                        }}
                        additional={{
                          page: 1,
                          is_warehouse:
                            watch('asset_utilization')?.is_warehouse,
                          is_cce: watch('asset_utilization')?.is_cce,
                        }}
                        value={
                          value as
                            | OptionTypeWithData<AssetType>
                            | null
                            | undefined
                        }
                        placeholder={t('form.detail.placeholder.type')}
                      />
                      {error?.message && (
                        <FormErrorMessage>{error?.message}</FormErrorMessage>
                      )}
                    </FormControl>
                  )
                }}
              />
              <Controller
                control={control}
                name="manufacture_id"
                render={({
                  field: { value, onChange, ...field },
                  fieldState: { error },
                }) => (
                  <FormControl>
                    <FormLabel htmlFor="select-manufacturer" required>
                      {t('form.detail.label.manufacturer')}
                    </FormLabel>
                    <ReactSelectAsync
                      {...field}
                      key={`manufacture__${watch('asset_type_id')?.value}__${value?.value}`}
                      id="select-manufacturer"
                      isClearable
                      disabled={
                        (isEdit && !!defaultValues?.is_related_asset) ||
                        !asset_type_id
                      }
                      loadOptions={loadManufacturers}
                      onChange={(selected) => {
                        onChange(selected)
                      }}
                      value={value}
                      placeholder={t('form.detail.placeholder.manufacturer')}
                      additional={{
                        page: 1,
                        status: 1,
                        asset_type_id:
                          watch('asset_type_id')?.value ?? undefined,
                        type:
                          watch('asset_type_id')?.data?.is_warehouse ||
                          data?.is_warehouse
                            ? '6'
                            : undefined,
                      }}
                    />
                    {error?.message && (
                      <FormErrorMessage>{error?.message}</FormErrorMessage>
                    )}
                  </FormControl>
                )}
              />
            </div>
          )}
        </div>
        {!!defaultValues?.is_related_asset && (
          <div className="ui-rounded ui-bg-slate-100 ui-px-4 ui-py-[9px] ui-flex ui-gap-2 ui-items-center mt-4">
            <Warning />
            <p className="ui-text-xs ui-font-normal">
              {t('form.detail.capacity.warning')}
            </p>
          </div>
        )}
        {asset_type_id &&
          !isAssetTypeCCE &&
          asset_utilization?.id !== AssetUtilization.Warehouse && (
            <div className="ui-my-4">
              <Controller
                control={control}
                name="is_capacity"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormControl className="ui-flex ui-flex-row ui-items-center ui-space-y-0">
                    <Checkbox
                      {...field}
                      checked={Boolean(value)}
                      onChange={(e) => {
                        onChange(Number(e.target.checked))
                        clearErrors('asset_model_capacity')
                      }}
                      disabled={isEdit && !!defaultValues?.is_related_asset}
                    />
                    <FormLabel
                      htmlFor="select-manufacturer"
                      className="ui-ml-2 ui-text-dark-blue"
                    >
                      {t('form.detail.label.is_capacity_required')}
                    </FormLabel>
                  </FormControl>
                )}
              />
            </div>
          )}
      </div>

      {showIsCapacity && (
        <div className="ui-p-4 ui-border ui-rounded">
          <div className="ui-mb-4 ui-font-bold ui-text-primary ui-text-dark-blue">
            {t('form.title.capacity')}
          </div>
          {!!defaultValues?.is_related_asset && (
            <div className="ui-rounded ui-bg-slate-100 ui-px-4 ui-py-[9px] ui-flex ui-gap-2 ui-items-center my-4">
              <Warning />
              <p className="ui-text-xs ui-font-normal">
                {t('form.detail.capacity.warning')}
              </p>
            </div>
          )}
          <div className="ui-flex ui-flex-col ui-space-y-5">
            {!isAssetTypeCCE && (
              <ModelAssetFormEditCapacity
                isEdit={isEdit}
                defaultValues={defaultValues}
              />
            )}
            {isAssetTypeCCE && (
              <Fragment>
                <Controller
                  control={control}
                  name="asset_model_capacity.pqs_code_id"
                  render={({
                    field: { value, onChange, ...field },
                    fieldState: { error },
                  }) => (
                    <FormControl>
                      <FormLabel htmlFor="select-pqs">
                        {t('form.detail.label.pqs_code')}
                      </FormLabel>
                      <ReactSelectAsync
                        {...field}
                        key={language}
                        id="select-pqs"
                        isClearable={!isEdit}
                        disabled={isEdit}
                        loadOptions={loadPQSCode}
                        onChange={(selected: OptionTypeWithData<PQSDetail>) => {
                          onChange(selected)
                          trigger('asset_model_capacity.capacities')
                        }}
                        value={
                          value as
                            | OptionTypeWithData<PQSDetail>
                            | null
                            | undefined
                        }
                        placeholder={t('form.detail.placeholder.pqs_code')}
                        additional={{
                          locale: language,
                          page: 1,
                          t,
                          temperatureThresholds,
                        }}
                      />
                      {error?.message && (
                        <FormErrorMessage>{error?.message}</FormErrorMessage>
                      )}
                    </FormControl>
                  )}
                />
                <ModelAssetFormEditCapacityPQS
                  fields={capacityPqsForms?.filter(Boolean) as TFieldType[]}
                  data={data}
                  isEdit={isEdit}
                  capacityPQSFields={capacityPQSFields}
                />
              </Fragment>
            )}
          </div>
        </div>
      )}
    </Fragment>
  )
}

export default ModelAssetFormEdit

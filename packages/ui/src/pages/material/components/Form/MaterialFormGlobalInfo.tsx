import { Fragment, useEffect, useMemo } from 'react'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { Input } from '#components/input'
import { InputNumber } from '#components/input-number'
import { InputNumberV2 } from '#components/input-number-v2'
import { Radio, RadioGroup } from '#components/radio'
import { OptionType, ReactSelectAsync } from '#components/react-select'
import { TextArea } from '#components/text-area'
import {
  loadMaterial,
  loadMaterialSubtype,
  loadMaterialType,
  loadMaterialUnits,
} from '#services/material'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { MaterialGlobalFormData } from '../../schema/MaterialSchemaForm'
import { DEFAULT_VALUE, MATERIAL_LEVEL } from '../../utils/material.constants'
import { useFeatureIsOn } from '@growthbook/growthbook-react'

interface Props {
  isEdit?: boolean
}

const MaterialFormGlobalInformation: React.FC<Props> = ({ isEdit = false }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['material', 'common'])
  const isShowGlobalMaterialSubtype = useFeatureIsOn('annual_planning.global_material_subtype')
  const {
    register,
    watch,
    setValue,
    formState: { errors },
    clearErrors,
    trigger,
    control,
  } = useFormContext<MaterialGlobalFormData>()

  const {
    is_hierarchy,
    material_level_id,
    is_temperature_sensitive,
    is_managed_in_batch,
    is_stock_opname_mandatory,
    material_parent_ids,
    unit_of_distribution_id,
    unit_of_consumption_id,
    material_type_id,
    material_subtype_id,
  } = watch()

  const defaultRadioValue = Number(material_level_id)

  const isHierarchichal = Number(is_hierarchy) === DEFAULT_VALUE.YES

  const isTradeMark = defaultRadioValue === MATERIAL_LEVEL.TRADEMARK

  const temperatureUnit = process.env.TEMPERATURE_UNIT ?? 'C'

  const currency = process.env.CURRENCY ?? 'IDR'

  const isTemperatureSensitive = Number(
    isNaN(is_temperature_sensitive) ? 0 : is_temperature_sensitive
  )

  const handleKFALabel = () => {
    const isKFA92 = defaultRadioValue === MATERIAL_LEVEL.ACTIVE_SUBSTANCE

    return {
      id: isKFA92 ? 'kfa_92_code' : 'kfa_93_code',
      label: isKFA92
        ? t('material:form.kfa_92_code.label')
        : t('material:form.kfa_93_code.label'),
      placeHolder: isKFA92
        ? t('material:form.kfa_92_code.placeholder')
        : t('material:form.kfa_93_code.placeholder'),
    }
  }

  const handleDisabledIsManagedByBatch = () => {
    return [1, 2].includes(
      (material_type_id as { label: string; value: number })?.value
    )
  }

  const handleIsManagedByBatchChecked = useMemo(() => {
    return Number(is_managed_in_batch)
  }, [is_managed_in_batch])

  const numberInputOnWheelPreventChange = (
    e: React.WheelEvent<HTMLInputElement>
  ) => {
    ; (e.target as HTMLInputElement).blur()
    e.stopPropagation()
    setTimeout(() => {
      ; (e.target as HTMLInputElement).focus()
    }, 0)
  }

  useEffect(() => {
    if (isHierarchichal) {
      setValue('is_temperature_sensitive', isTemperatureSensitive)
    }
  }, [])

  return (
    <div className="ui-p-4 ui-border ui-rounded">
      <div className="ui-mb-4 ui-font-bold">{t('material:form.title')}</div>
      <div className="ui-grid ui-grid-cols-1 ui-gap-x-6 ui-gap-y-6">
        <FormControl>
          <FormLabel htmlFor="material_name" required>
            {t('material:form.material_name.label')}
          </FormLabel>
          <Input
            {...register('name')}
            id="material_name"
            type="text"
            placeholder={t('material:form.material_name.placeholder')}
            error={!!errors?.name}
          />
          <FormErrorMessage>{errors?.name?.message}</FormErrorMessage>
        </FormControl>
        <FormControl>
          <FormLabel htmlFor="description">{t('common:description')}</FormLabel>
          <TextArea
            {...register('description')}
            id="description"
            placeholder={t('common:description')}
            error={!!errors?.description}
          />
          <FormErrorMessage>{errors?.description?.message}</FormErrorMessage>
        </FormControl>
        <FormControl>
          <FormLabel required>
            {t('material:form.hierarchical.label')}
          </FormLabel>
          <RadioGroup>
            <Radio
              {...register('is_hierarchy')}
              id="radio-material-is-hierarchical"
              value={DEFAULT_VALUE.YES}
              checked={Number(is_hierarchy) === DEFAULT_VALUE.YES}
              disabled={isEdit}
              label={t('material:form.hierarchical.option.yes')}
            />
          </RadioGroup>
        </FormControl>
        {isHierarchichal ? (
          <Fragment>
            <FormControl>
              <FormLabel>{t('material:form.material_level.label')}</FormLabel>
              <RadioGroup>
                <Radio
                  {...register('material_level_id')}
                  id="radio-material-is-active-substance"
                  value={MATERIAL_LEVEL.ACTIVE_SUBSTANCE}
                  checked={
                    Number(material_level_id) ===
                    MATERIAL_LEVEL.ACTIVE_SUBSTANCE
                  }
                  disabled={isEdit}
                  label={t(
                    'material:form.material_level.radio.active_substance'
                  )}
                />
                <Radio
                  {...register('material_level_id')}
                  id="radio-is-trademark"
                  value={MATERIAL_LEVEL.TRADEMARK}
                  checked={
                    Number(material_level_id) === MATERIAL_LEVEL.TRADEMARK
                  }
                  disabled={isEdit}
                  label={t('material:form.material_level.radio.trademark')}
                />
              </RadioGroup>
            </FormControl>
            {isTradeMark && (
              <Controller
                name="material_parent_ids"
                control={control}
                render={({
                  field: { onChange, value, ...field },
                  fieldState: { error },
                }) => {
                  return (
                    <FormControl>
                      <FormLabel
                        htmlFor="select-material-active-substance"
                        required
                      >
                        {t('material:form.material_active_substance.label')}
                      </FormLabel>
                      <ReactSelectAsync
                        {...field}
                        key={language}
                        id="select-material-active-substance"
                        loadOptions={(keyword, _, additional) =>
                          loadMaterial(keyword, _, additional) as any
                        }
                        debounceTimeout={300}
                        defaultValue={material_parent_ids}
                        isClearable
                        placeholder={t(
                          'form.material_active_substance.placeholder'
                        )}
                        disabled={isEdit}
                        additional={{
                          page: 1,
                          material_level_ids: (Number(material_level_id) === 3
                            ? '2'
                            : material_level_id?.toString()) as string,
                          with_kfa_code: true,
                        }}
                        onChange={(option: OptionType[]) => {
                          onChange([option])
                          setValue('material_parent_ids', [option])
                          clearErrors('material_parent_ids')
                        }}
                        error={!!error?.message}
                      />
                      {error?.message && (
                        <FormErrorMessage>{error.message}</FormErrorMessage>
                      )}
                    </FormControl>
                  )
                }}
              />
            )}
            <div className="ui-grid ui-grid-cols-2 ui-gap-x-6">
              <FormControl>
                <FormLabel htmlFor={handleKFALabel().id} required>
                  {handleKFALabel().label as string}
                </FormLabel>
                <Input
                  {...register('hierarchy_code')}
                  id={handleKFALabel().id}
                  type="text"
                  placeholder={handleKFALabel().placeHolder as string}
                  error={!!errors?.hierarchy_code}
                />
                <FormErrorMessage>
                  {errors?.hierarchy_code?.message as string}
                </FormErrorMessage>
              </FormControl>
              <FormControl>
                <FormLabel htmlFor="material_code" required>
                  {t('material:form.material_code.label')}
                </FormLabel>
                <Input
                  {...register('code')}
                  id="material_code"
                  type="text"
                  placeholder={t('material:form.material_code.placeholder')}
                  error={!!errors?.code}
                />
                <FormErrorMessage>{errors?.code?.message}</FormErrorMessage>
              </FormControl>
            </div>
          </Fragment>
        ) : null}
        {!isHierarchichal && (
          <FormControl>
            <FormLabel htmlFor="material_code" required>
              {t('material:form.material_code.label')}
            </FormLabel>
            <Input
              {...register('code')}
              id="material_code"
              type="text"
              placeholder={t('material:form.material_code.placeholder')}
              error={!!errors?.code}
            />
            <FormErrorMessage>{errors?.code?.message}</FormErrorMessage>
          </FormControl>
        )}
        <div className="ui-grid ui-grid-cols-2 ui-gap-x-6">
          <Controller
            name="unit_of_consumption_id"
            control={control}
            render={({
              field: { onChange, value, ...field },
              fieldState: { error },
            }) => {
              return (
                <FormControl>
                  <FormLabel
                    htmlFor="select-material-consumption-unit"
                    required
                  >
                    {t('material:form.unit_of_consumption.label')}
                  </FormLabel>
                  <ReactSelectAsync
                    {...field}
                    key={language}
                    id="select-material-consumption-unit"
                    loadOptions={loadMaterialUnits}
                    debounceTimeout={300}
                    defaultValue={unit_of_consumption_id}
                    isClearable
                    placeholder={t(
                      'material:form.unit_of_consumption.placeholder'
                    )}
                    additional={{
                      page: 1,
                      type: 'consumption',
                    }}
                    onChange={(option: OptionType) => {
                      onChange(option)
                      setValue('unit_of_consumption_id', option)
                      clearErrors('unit_of_consumption_id')
                    }}
                    error={!!error?.message}
                  />
                  {error?.message && (
                    <FormErrorMessage>{error?.message}</FormErrorMessage>
                  )}
                </FormControl>
              )
            }}
          />
          <Controller
            name="unit_of_distribution_id"
            control={control}
            render={({
              field: { onChange, value, ...field },
              fieldState: { error },
            }) => (
              <FormControl>
                <FormLabel htmlFor="select-material-distribution-unit" required>
                  {t('material:form.unit_of_distribution.label')}
                </FormLabel>
                <ReactSelectAsync
                  {...field}
                  key={language}
                  id="select-material-distribution-unit"
                  loadOptions={loadMaterialUnits}
                  defaultValue={unit_of_distribution_id}
                  debounceTimeout={300}
                  isClearable
                  placeholder={t(
                    'material:form.unit_of_distribution.placeholder'
                  )}
                  additional={{
                    page: 1,
                    type: 'distribution',
                  }}
                  onChange={(option: OptionType) => {
                    onChange(option)
                    setValue('unit_of_distribution_id', option)
                    clearErrors('unit_of_distribution_id')
                  }}
                  error={!!error?.message}
                />
                {error?.message && (
                  <FormErrorMessage>{error?.message}</FormErrorMessage>
                )}
              </FormControl>
            )}
          />
        </div>
        <Controller
          name="consumption_unit_per_distribution_unit"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <FormControl>
              <FormLabel
                htmlFor="number_of_unit_consumption_per_unit_distribution"
                required
              >
                {t(
                  'material:form.number_of_unit_consumption_per_unit_distribution.label'
                )}
              </FormLabel>
              <InputNumberV2
                onWheel={numberInputOnWheelPreventChange}
                id="number_of_unit_consumption_per_unit_distribution"
                value={(value as unknown as number) || 0}
                onValueChange={(e) => onChange(e.floatValue)}
                placeholder={t(
                  'material:form.number_of_unit_consumption_per_unit_distribution.placeholder'
                )}
                error={!!error?.message}
              />
              <FormErrorMessage>{error?.message}</FormErrorMessage>
            </FormControl>
          )}
        />
        <div className="ui-grid ui-grid-cols-2 ui-gap-x-6">
          <Controller
            name="min_retail_price"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <FormControl>
                <FormLabel htmlFor="minimum_retail_price" required>
                  {`${t('material:form.minimum_retail_price.label')} (${currency})`}
                </FormLabel>
                <InputNumberV2
                  onWheel={numberInputOnWheelPreventChange}
                  id="min_retail_price"
                  value={(value as unknown as number) || 0}
                  onValueChange={(e) => {
                    onChange(e.floatValue)
                    trigger('min_retail_price')
                    trigger('min_retail_price')
                  }}
                  placeholder={t(
                    'material:form.minimum_retail_price.placeholder'
                  )}
                  error={!!error?.message}
                />
                <FormErrorMessage>{error?.message}</FormErrorMessage>
              </FormControl>
            )}
          />
          <Controller
            name="max_retail_price"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <FormControl>
                <FormLabel htmlFor="maximum_retail_price" required>
                  {`${t('material:form.maximum_retail_price.label')} (${currency})`}
                </FormLabel>
                <InputNumberV2
                  onWheel={numberInputOnWheelPreventChange}
                  id="max_retail_price"
                  value={(value as unknown as number) || 0}
                  onValueChange={(e) => {
                    onChange(e.floatValue)
                    trigger('max_retail_price')
                    trigger('min_retail_price')
                  }}
                  placeholder={t(
                    'material:form.maximum_retail_price.placeholder'
                  )}
                  error={!!error?.message}
                />
                <FormErrorMessage>{error?.message}</FormErrorMessage>
              </FormControl>
            )}
          />
        </div>
        <div
          className="ui-grid ui-grid-cols-8 ui-gap-x-6 !ui-h-[70px]"
          style={{
            marginBottom:
              errors?.min_temperature || errors?.max_temperature ? '3rem' : '',
          }}
        >
          <div className="ui-col-start-1 ui-col-span-4">
            <FormControl>
              <FormLabel>
                {t('material:form.temperature_sensitive.label')}
              </FormLabel>
              <RadioGroup>
                <Radio
                  {...register('is_temperature_sensitive')}
                  id="radio-material-is-temperature-sensitive"
                  value={DEFAULT_VALUE.YES}
                  checked={isTemperatureSensitive === DEFAULT_VALUE.YES}
                  disabled={isHierarchichal && isEdit}
                  label={t('common:yes')}
                />
                <Radio
                  {...register('is_temperature_sensitive')}
                  id="radio-material-is-not-temperature-sensitive"
                  value={DEFAULT_VALUE.NO}
                  checked={isTemperatureSensitive === DEFAULT_VALUE.NO}
                  disabled={isHierarchichal && isEdit}
                  label={t('common:no')}
                />
              </RadioGroup>
            </FormControl>
          </div>
          {isTemperatureSensitive === DEFAULT_VALUE.YES && (
            <Fragment>
              <div className="ui-col-start-5 ui-col-span-2">
                <Controller
                  name="min_temperature"
                  control={control}
                  render={({
                    field: { onChange, value },
                    fieldState: { error },
                  }) => (
                    <FormControl>
                      <FormLabel htmlFor="minimum_temperature" required>
                        {`${t('material:form.minimum_temperature.label')} (\u00B0${temperatureUnit})`}
                      </FormLabel>
                      <InputNumber
                        hideStepper
                        id="min_temperature"
                        placeholder={t(
                          'material:form.minimum_temperature.placeholder'
                        )}
                        defaultValue={value ? Number(value) : undefined}
                        onChange={(value) => {
                          onChange(value ? Number(value) : undefined)
                          trigger('max_temperature')
                          trigger('min_temperature')
                        }}
                        error={!!error?.message}
                      />
                      <FormErrorMessage>{error?.message}</FormErrorMessage>
                    </FormControl>
                  )}
                />
              </div>
              <div className="ui-col-start-7 ui-col-span-2">
                <Controller
                  name="max_temperature"
                  control={control}
                  render={({
                    field: { onChange, value },
                    fieldState: { error },
                  }) => (
                    <FormControl>
                      <FormLabel htmlFor="maximum_temperature" required>
                        {`${t('material:form.maximum_temperature.label')} (\u00B0${temperatureUnit})`}
                      </FormLabel>
                      <InputNumber
                        hideStepper
                        id="max_temperature"
                        placeholder={t(
                          'material:form.maximum_temperature.placeholder'
                        )}
                        defaultValue={value ? Number(value) : undefined}
                        onChange={(value) => {
                          onChange(value ? Number(value) : undefined)
                          trigger('max_temperature')
                          trigger('min_temperature')
                        }}
                        error={!!error?.message}
                      />
                      <FormErrorMessage>{error?.message}</FormErrorMessage>
                    </FormControl>
                  )}
                />
              </div>
            </Fragment>
          )}
        </div>
        <Controller
          name="material_type_id"
          control={control}
          render={({
            field: { onChange, value, ...field },
            fieldState: { error },
          }) => (
            <FormControl>
              <FormLabel htmlFor="select-material-material-type-unit" required>
                {t('material:form.material_type.label')}
              </FormLabel>
              <ReactSelectAsync
                {...field}
                key={language}
                id="select-material-material-type-unit"
                loadOptions={loadMaterialType}
                debounceTimeout={300}
                defaultValue={material_type_id}
                isClearable
                placeholder={t('material:form.material_type.placeholder')}
                additional={{
                  page: 1,
                }}
                onChange={(option: OptionType) => {
                  onChange(option)
                  setValue('material_type_id', option)
                  if ([1, 2].includes(option?.value)) {
                    setValue('is_managed_in_batch', DEFAULT_VALUE.YES)
                  }
                  setValue('material_subtype_id', null)
                  clearErrors('material_type_id')
                }}
                error={!!error?.message}
              />
              {error?.message && (
                <FormErrorMessage>{error?.message}</FormErrorMessage>
              )}
            </FormControl>
          )}
        />
        {isShowGlobalMaterialSubtype && (
          <Controller
            name="material_subtype_id"
            control={control}
            render={({
              field: { onChange, value, ...field },
              fieldState: { error },
            }) => (
              <FormControl>
                <FormLabel htmlFor="select-material-material-subtype-unit">
                  {t('material:form.material_subtype.label')}
                </FormLabel>
                <ReactSelectAsync
                  {...field}
                  key={`${language}_${(material_type_id as { value: number })?.value}`}
                  id="select-material-material-subtype-unit"
                  loadOptions={loadMaterialSubtype}
                  debounceTimeout={300}
                  defaultValue={material_subtype_id}
                  isClearable
                  placeholder={t('material:form.material_subtype.placeholder')}
                  additional={{
                    page: 1,
                    material_type_id: (material_type_id as { value: number })
                      ?.value,
                  }}
                  onChange={(option: OptionType) => {
                    onChange(option)
                    setValue('material_subtype_id', option)
                    clearErrors('material_subtype_id')
                  }}
                  error={!!error?.message}
                />
                {error?.message && (
                  <FormErrorMessage>{error?.message}</FormErrorMessage>
                )}
              </FormControl>
            )}
          />
        )}
        <FormControl>
          <FormLabel>{t('material:form.managed_by_batch.label')}</FormLabel>
          <RadioGroup>
            <Radio
              {...register('is_managed_in_batch')}
              id="radio-material-is-managed-by-batch"
              value={DEFAULT_VALUE.YES}
              disabled={handleDisabledIsManagedByBatch()}
              checked={handleIsManagedByBatchChecked === DEFAULT_VALUE.YES}
              label={t('common:yes')}
            />
            <Radio
              {...register('is_managed_in_batch')}
              id="radio-is-is-not-managed-by-batch"
              value={DEFAULT_VALUE.NO}
              disabled={handleDisabledIsManagedByBatch()}
              checked={handleIsManagedByBatchChecked === DEFAULT_VALUE.NO}
              label={t('common:no')}
            />
          </RadioGroup>
        </FormControl>
        <FormControl>
          <FormLabel htmlFor="radio-material-is-stock-opname-mandatory">
            {t('material:form.so_required.label')}
          </FormLabel>
          <RadioGroup>
            <Radio
              {...register('is_stock_opname_mandatory')}
              id="radio-material-is-stock-opname-mandatory"
              value={DEFAULT_VALUE.YES}
              checked={Number(is_stock_opname_mandatory) === DEFAULT_VALUE.YES}
              label={t('common:yes')}
            />
            <Radio
              {...register('is_stock_opname_mandatory')}
              id="radio-material-is-not-stock-opname-mandatory"
              value={DEFAULT_VALUE.NO}
              checked={Number(is_stock_opname_mandatory) === DEFAULT_VALUE.NO}
              label={t('common:no')}
            />
          </RadioGroup>
        </FormControl>
      </div>
    </div>
  )
}

export default MaterialFormGlobalInformation

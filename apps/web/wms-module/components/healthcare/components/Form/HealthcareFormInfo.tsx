import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '@repo/ui/components/form-control';
import { Input } from '@repo/ui/components/input';
import {
  OptionType,
  ReactSelect,
  ReactSelectAsync,
} from '@repo/ui/components/react-select';

import { DatePicker } from '@repo/ui/components/date-picker';
import { Switch } from '@repo/ui/components/switch';
import React, { useMemo } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { useTranslation } from 'react-i18next';

import { loadEntityList } from '@/services/entity';
import { loadManufacturer } from '@/services/manufacture';
import { ROLE_LABEL } from '@/types/roles';
import { dateToDateValue, dateValueToDate } from '@/utils/date';
import { getUserRoleString } from '@/utils/getUserRole';
import { AssetStatusOption } from '../../constants/assetHealthcare';
import { HealthcareFormData } from '../../schema/HealthcareSchemaForm';
import { getAssetStatusOptions, getAssetTypeOptions } from '../../utils/helper';

const HealthcareFormInfo: React.FC = () => {
  const { t } = useTranslation(['healthCare']);
  const { t: tCommon } = useTranslation('common');
  const role = getUserRoleString();

  const {
    register,
    watch,
    setValue,
    formState: { errors },
    clearErrors,
    control,
  } = useFormContext<HealthcareFormData>();

  const assetTypeWatch = useWatch({ name: 'assetType' });
  const manufactureWatch = useWatch({ name: 'manufacture' });
  const warrantyStartDate = useWatch({ name: 'warrantyStartDate' });

  const assetStatusOptions = useMemo(() => getAssetStatusOptions(t), [t]);

  const selectedValue = assetStatusOptions.find(
    (option) => option.value === watch('assetStatus')
  );

  return (
    <div className="ui-flex ui-flex-col">
      <div className="ui-p-4 ui-border ui-rounded">
        <div className="ui-grid ui-grid-cols-1 ui-gap-x-6 ui-gap-y-6">
          {role === ROLE_LABEL.SUPER_ADMIN && (
            <Controller
              name="healthcare_facility"
              control={control}
              render={({
                field: { onChange, value, ...field },
                fieldState: { error },
              }) => {
                return (
                  <FormControl>
                    <FormLabel htmlFor="select-healthcare" required>
                      {t('healthCare:form.healthcare_facility.label')}
                    </FormLabel>
                    <ReactSelectAsync
                      {...field}
                      id="select-healthcare"
                      loadOptions={loadEntityList}
                      debounceTimeout={300}
                      isMulti={false}
                      isClearable
                      placeholder={t(
                        'healthCare:form.healthcare_facility.placeholder'
                      )}
                      additional={{
                        page: 1,
                        type_ids: '3',
                      }}
                      onChange={(option: OptionType) => {
                        onChange(option);
                        clearErrors('healthcare_facility');
                        setValue('healthcare_facility', option);
                      }}
                      value={value as OptionType}
                      error={!!error?.message}
                    />
                    {errors?.healthcare_facility?.message && (
                      <FormErrorMessage>
                        {errors?.healthcare_facility?.message}
                      </FormErrorMessage>
                    )}
                  </FormControl>
                );
              }}
            />
          )}
          <FormControl>
            <FormLabel required>
              {t('healthCare:form.asset_type.label')}
            </FormLabel>
            <ReactSelect
              {...register('assetType')}
              id="select-asset-type"
              placeholder={t('healthCare:form.asset_type.placeholder')}
              options={getAssetTypeOptions(tCommon)}
              onChange={(option: OptionType) => {
                setValue('assetType', option?.value);
                clearErrors('assetType');
                setValue('manufacture', { label: '', value: 0 });
                setValue('model', { label: '', value: 0 });
              }}
              value={getAssetTypeOptions(tCommon)?.find(
                (x) => x.value === watch('assetType')
              )}
              isClearable
            />
            {errors?.assetType?.message && (
              <FormErrorMessage>{errors?.assetType?.message}</FormErrorMessage>
            )}
          </FormControl>
          <Controller
            name="manufacture"
            control={control}
            render={({
              field: { onChange, value, ...field },
              fieldState: { error },
            }) => {
              return (
                <FormControl>
                  <FormLabel htmlFor="select-manufacture" required>
                    {t('healthCare:form.manufacture.label')}
                  </FormLabel>
                  <ReactSelectAsync
                    {...field}
                    id="select-manufacturer"
                    loadOptions={loadManufacturer}
                    debounceTimeout={300}
                    isClearable
                    placeholder={t('healthCare:form.manufacture.placeholder')}
                    additional={{
                      page: 1,
                      assetType: assetTypeWatch,
                    }}
                    onChange={(option: OptionType) => {
                      onChange(option);
                      clearErrors('manufacture');
                      setValue('manufacture', option);
                      setValue('model', { label: '', value: 0 });
                    }}
                    value={value as OptionType}
                    error={!!error?.message}
                    disabled={!assetTypeWatch}
                    cacheUniqs={[assetTypeWatch]}
                  />
                  {errors?.manufacture?.message && (
                    <FormErrorMessage>
                      {errors?.manufacture?.message}
                    </FormErrorMessage>
                  )}
                </FormControl>
              );
            }}
          />
          <Controller
            name="model"
            control={control}
            render={({
              field: { onChange, value, ...field },
              fieldState: { error },
            }) => {
              return (
                <FormControl>
                  <FormLabel htmlFor="select-model" required>
                    {t('healthCare:form.model.label')}
                  </FormLabel>
                  <ReactSelectAsync
                    {...field}
                    id="select-model"
                    loadOptions={loadManufacturer}
                    debounceTimeout={300}
                    isClearable
                    placeholder={t('healthCare:form.model.placeholder')}
                    additional={{
                      page: 1,
                      assetType: assetTypeWatch,
                      manufacturerId: manufactureWatch?.value,
                    }}
                    onChange={(option: OptionType) => {
                      onChange(option);
                      setValue('model', option);
                      clearErrors('model');
                    }}
                    value={value as OptionType}
                    error={!!error?.message}
                    disabled={!manufactureWatch?.label}
                    cacheUniqs={[manufactureWatch]}
                  />
                  {errors?.model?.message && (
                    <FormErrorMessage>
                      {errors?.model?.message}
                    </FormErrorMessage>
                  )}
                </FormControl>
              );
            }}
          />
          <FormControl>
            <FormLabel required>
              {t('healthCare:form.asset_id.label')}
            </FormLabel>
            <Input
              {...register('assetId')}
              id="input-asset-id"
              type="text"
              placeholder={t('healthCare:form.asset_id.placeholder')}
              error={!!errors?.assetId}
            />
            <FormErrorMessage>
              {errors?.assetId?.message as string}
            </FormErrorMessage>
          </FormControl>
          <Controller
            name="isIotEnable"
            control={control}
            render={({ field: { value, onChange } }) => (
              <FormControl>
                <FormLabel>{t('healthCare:form.sync.label')}</FormLabel>
                <Switch
                  labelInside={{ on: 'Enabled', off: 'Disabled' }}
                  checked={value}
                  onCheckedChange={onChange}
                  size="lg"
                />
              </FormControl>
            )}
          />
          <FormControl>
            <FormLabel required>
              {t('healthCare:form.asset_status.label')}
            </FormLabel>
            <ReactSelect
              {...register('assetStatus')}
              id="select-asset-status"
              placeholder={t('healthCare:form.asset_status.placeholder')}
              options={assetStatusOptions}
              onChange={(option: AssetStatusOption | null) => {
                setValue('assetStatus', option?.value || '');
                clearErrors('assetStatus');
              }}
              value={selectedValue}
              isClearable
            />
            {errors?.assetStatus?.message && (
              <FormErrorMessage>
                {errors?.assetStatus?.message}
              </FormErrorMessage>
            )}
          </FormControl>
          <FormControl>
            <FormLabel required>
              {t('healthCare:form.year_production.label')}
            </FormLabel>
            <Input
              {...register('yearOfProduction')}
              id="year_production"
              type="text"
              placeholder={t('healthCare:form.year_production.placeholder')}
              error={!!errors?.yearOfProduction}
            />
            <FormErrorMessage>
              {errors?.yearOfProduction?.message as string}
            </FormErrorMessage>
          </FormControl>
          <Controller
            name={`warrantyStartDate`}
            control={control}
            render={({
              field: { value, onChange, ...field },
              fieldState: { error },
            }) => (
              <FormControl>
                <FormLabel htmlFor="warranty-start" required>
                  {t('healthCare:form.warranty_start.label')}
                </FormLabel>
                <DatePicker
                  {...field}
                  id="datepicker-warranty-start-date"
                  value={dateToDateValue(value)}
                  onChange={(dateValue) => {
                    onChange(dateValueToDate(dateValue));
                  }}
                  error={!!error?.message}
                  clearable={false}
                />
                {error?.message && (
                  <FormErrorMessage>{error?.message}</FormErrorMessage>
                )}
              </FormControl>
            )}
          />
          <Controller
            name={`warrantyEndDate`}
            control={control}
            render={({
              field: { value, onChange, ...field },
              fieldState: { error },
            }) => (
              <FormControl>
                <FormLabel htmlFor="warranty-end" required>
                  {t('healthCare:form.warranty_end.label')}
                </FormLabel>
                <DatePicker
                  {...field}
                  id="datepicker-warranty-end-date"
                  value={dateToDateValue(value)}
                  onChange={(dateValue) => {
                    onChange(dateValueToDate(dateValue));
                  }}
                  minValue={dateToDateValue(warrantyStartDate) || undefined}
                  error={!!error?.message}
                  clearable={false}
                  isDisabled={!warrantyStartDate}
                />
                {error?.message && (
                  <FormErrorMessage>{error?.message}</FormErrorMessage>
                )}
              </FormControl>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default HealthcareFormInfo;

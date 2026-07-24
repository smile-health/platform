import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '@repo/ui/components/form-control';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Input } from '@repo/ui/components/input';
import { TextArea } from '@repo/ui/components/text-area';
import { AssetTypeFormData } from '../../schema/AssetTypeSchemaForm';

const AssetTypeFormInfo: React.FC = () => {
  const { t } = useTranslation(['assetType', 'common']);

  const {
    register,
    formState: { errors },
    control,
  } = useFormContext<AssetTypeFormData>();

  return (
    <div className="ui-flex ui-flex-col">
      <div className="ui-p-4 ui-border ui-rounded">
        <div className="ui-flex ui-flex-col ui-space-y-5">
          <Controller
            name="name"
            control={control}
            render={({
              field: { onChange, value, ...field },
              fieldState: { error },
            }) => {
              return (
                <FormControl>
                  <FormLabel required>
                    {t('assetType:form.asset_type.label')}
                  </FormLabel>
                  <Input
                    {...field}
                    id="input-asset-id"
                    type="text"
                    placeholder={t('assetType:form.asset_type.placeholder')}
                    error={!!error?.message}
                    value={value ?? ''}
                    onChange={(e) => {
                      onChange(e.target.value);
                    }}
                  />
                  {error?.message && (
                    <FormErrorMessage>
                      {error?.message as string}
                    </FormErrorMessage>
                  )}
                </FormControl>
              );
            }}
          />

          <Controller
            name="description"
            control={control}
            render={({
              field: { onChange, value, ...field },
              fieldState: { error },
            }) => {
              return (
                <FormControl>
                  <FormLabel required>
                    {t('assetType:form.description.label')}
                  </FormLabel>
                  <TextArea
                    {...field}
                    id="input-asset-id"
                    placeholder={t('assetType:form.description.placeholder')}
                    error={!!error?.message}
                    value={value ?? ''}
                    onChange={(e) => {
                      onChange(e.target.value);
                    }}
                  />
                  {error?.message && (
                    <FormErrorMessage>
                      {error?.message as string}
                    </FormErrorMessage>
                  )}
                </FormControl>
              );
            }}
          />
        </div>
        <div className="ui-grid ui-grid-cols-2 ui-gap-4 ui-mt-3">
          <FormControl>
            <FormLabel htmlFor="input-min-temperature">
              {t('assetType:form.min_temperature.label')}
            </FormLabel>
            <Input
              {...register('minTemperature')}
              id="input-min-temperature"
              type="number"
              min={0}
              placeholder={t('assetType:form.min_temperature.placeholder')}
              error={!!errors?.minTemperature}
            />
            <FormErrorMessage>
              {errors?.minTemperature?.message as string}
            </FormErrorMessage>
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="input-max-temperature">
              {t('assetType:form.max_temperature.label')}
            </FormLabel>
            <Input
              {...register('maxTemperature')}
              id="input-max-temperature"
              type="number"
              min={0}
              placeholder={t('assetType:form.max_temperature.placeholder')}
              error={!!errors?.maxTemperature}
            />
            <FormErrorMessage>
              {errors?.maxTemperature?.message as string}
            </FormErrorMessage>
          </FormControl>
        </div>
      </div>
    </div>
  );
};

export default AssetTypeFormInfo;

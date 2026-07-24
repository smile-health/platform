import {
  FormControl,
  FormDescription,
  FormErrorMessage,
  FormLabel,
} from '@repo/ui/components/form-control';
import { Input } from '@repo/ui/components/input';
import {
  OptionType,
  ReactSelect,
  ReactSelectCreateableAsync,
} from '@repo/ui/components/react-select';
import { TextArea } from '@repo/ui/components/text-area';
import React, { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { getAssetTypeOptions } from '@/components/healthcare/utils/helper';
import {
  createManufactureOption,
  loadManufacturers,
} from '@/services/manufacture';
import { getUserStorage } from '@/utils/storage/user';
import { useMutation } from '@tanstack/react-query';
import { ManufactureFormData } from '../../schema/ManufactureSchemaForm';

const ManufactureFormInfo: React.FC = () => {
  const user = getUserStorage();
  const { t } = useTranslation(['manufacture']);
  const { t: tCommon } = useTranslation(['common']);
  const [manufacturersReloadKey, setManufacturersReloadKey] = useState(0);

  const { setValue, control } = useFormContext<ManufactureFormData>();

  const {
    mutate: createManufactureOptionList,
    isPending: isCreateManufactureOptionListPending,
  } = useMutation({
    mutationFn: createManufactureOption,
    onSuccess: (data) => {
      setManufacturersReloadKey((k) => k + 1);

      if (data && data.data.id) {
        setValue('manufacturer', {
          label: data.data.name,
          value: data.data.id,
        });
      }
    },
  });

  return (
    <div className="ui-flex ui-flex-col">
      <div className="ui-p-4 ui-border ui-rounded">
        <div className="ui-grid ui-grid-cols-1 ui-gap-x-6 ui-gap-y-6">
          <Controller
            name="asset_type"
            control={control}
            render={({
              field: { value, onChange, ...field },
              fieldState: { error },
            }) => (
              <FormControl>
                <FormLabel required>
                  {t('manufacture:form.asset_type.label')}
                </FormLabel>
                <ReactSelect
                  {...field}
                  id="select-asset-type"
                  placeholder={t('manufacture:form.asset_type.placeholder')}
                  options={getAssetTypeOptions(tCommon)}
                  isMulti={false}
                  defaultValue={
                    getAssetTypeOptions(tCommon).filter(
                      (item) => item.value === value
                    ) || null
                  }
                  onChange={(option: OptionType) => {
                    setValue('asset_type', option.value);
                  }}
                  isClearable
                />
                {error?.message && (
                  <FormErrorMessage>{error?.message}</FormErrorMessage>
                )}
              </FormControl>
            )}
          />

          <Controller
            name="manufacturer"
            control={control}
            render={({
              field: { onChange, value, ...field },
              fieldState: { error },
            }) => {
              return (
                <FormControl>
                  <FormLabel htmlFor="select-manufacturer" required>
                    {t('manufacture:form.manufacture.label')}
                  </FormLabel>
                  <ReactSelectCreateableAsync
                    {...field}
                    key={manufacturersReloadKey}
                    id="select-manufacturer"
                    loadOptions={loadManufacturers}
                    debounceTimeout={300}
                    isMulti={false}
                    isClearable
                    placeholder={t('form.manufacture.placeholder')}
                    additional={{
                      page: 1,
                    }}
                    onChange={(option: OptionType) => {
                      onChange(option);
                      setValue('manufacturer', option);
                    }}
                    onCreateOption={(inputValue) => {
                      createManufactureOptionList({
                        name: inputValue,
                        description: inputValue,
                        createdBy: user?.user_uuid ?? '',
                      });
                    }}
                    value={(value as OptionType) ?? null}
                    disabled={isCreateManufactureOptionListPending}
                    error={!!error?.message}
                  />
                  <FormDescription>
                    <p className="ui-italic">
                      {t('form.manufacture.description')}
                    </p>
                  </FormDescription>
                  {error?.message && (
                    <FormErrorMessage>{error?.message}</FormErrorMessage>
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
                  <FormLabel required>
                    {t('manufacture:form.model.label')}
                  </FormLabel>
                  <Input
                    {...field}
                    id="input-asset-id"
                    type="text"
                    placeholder={t('manufacture:form.model.placeholder')}
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
                  <FormLabel>
                    {t('manufacture:form.description.label')}
                  </FormLabel>
                  <TextArea
                    {...field}
                    id="input-asset-id"
                    placeholder={t('manufacture:form.description.placeholder')}
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
      </div>
    </div>
  );
};

export default ManufactureFormInfo;

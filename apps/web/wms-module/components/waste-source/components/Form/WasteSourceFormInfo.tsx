import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '@repo/ui/components/form-control';
import React, { useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { loadEntityList } from '@/services/entity';
import { SourceType } from '@/types/waste-source';
import {
  getDefaultProvinceValue,
  getDefaultRegencyValue,
} from '@/utils/getUserRole';
import { Input } from '@repo/ui/components/input';
import {
  OptionType,
  ReactSelect,
  ReactSelectAsync,
} from '@repo/ui/components/react-select';
import { WasteSourceFormData } from '../../schema/WasteSourceSchemaForm';
import {
  getInternalTreatmentOptions,
  getSourceTypeOptions,
} from '../../utils/helper';

interface WasteSourceFormProps {
  isEdit?: boolean;
}

const WasteSourceFormInfo: React.FC<WasteSourceFormProps> = ({ isEdit }) => {
  const { t } = useTranslation(['wasteSource']);

  const {
    register,
    watch,
    setValue,
    formState: { errors },
    clearErrors,
    resetField,
    control,
  } = useFormContext<WasteSourceFormData>();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const sourceOptions = useMemo(() => getSourceTypeOptions(), [t]);

  const selectedSourceTypeValue = sourceOptions.find(
    (option) => option.value === watch('sourceType')
  );

  return (
    <div className="ui-flex ui-flex-col">
      <div className="ui-p-4 ui-border ui-rounded">
        <div className="ui-grid ui-grid-cols-1 ui-gap-x-6 ui-gap-y-6">
          <Controller
            name="sourceType"
            control={control}
            render={({
              field: { onChange, value, ...field },
              fieldState: { error },
            }) => {
              return (
                <FormControl>
                  <FormLabel htmlFor="select-internal-treatment" required>
                    {t('wasteSource:form.source_type.label')}
                  </FormLabel>
                  <ReactSelect
                    {...field}
                    id="select-internal-treatment"
                    placeholder={t('wasteSource:form.source_type.placeholder')}
                    options={sourceOptions}
                    onChange={(option: OptionType) => {
                      onChange(option);

                      setValue('sourceType', option.value);

                      // reset the value
                      setValue('internalSourceName', '');
                      setValue('internalTreatmentName', '');
                      setValue('externalHealthcareFacility', null as any);

                      clearErrors('sourceType');
                    }}
                    value={selectedSourceTypeValue}
                    isClearable
                    disabled={isEdit}
                  />
                  {error?.message && (
                    <FormErrorMessage>{error?.message}</FormErrorMessage>
                  )}
                </FormControl>
              );
            }}
          />

          {/* if source type is INTERNAL */}
          {watch('sourceType') === SourceType.INTERNAL && (
            <FormControl>
              <FormLabel required>
                {t('wasteSource:form.internal_waste_source.label')}
              </FormLabel>
              <Input
                {...register('internalSourceName')}
                id="input-internal-waste-source"
                type="text"
                placeholder={t(
                  'wasteSource:form.internal_waste_source.placeholder'
                )}
                error={!!errors?.internalSourceName}
              />
              <FormErrorMessage>
                {errors?.internalSourceName?.message as string}
              </FormErrorMessage>
            </FormControl>
          )}

          {/* if source type EXTERNAL */}
          {watch('sourceType') === SourceType.EXTERNAL && (
            <>
              <Controller
                name="externalHealthcareFacility"
                control={control}
                render={({
                  field: { onChange, value, ...field },
                  fieldState: { error },
                }) => {
                  return (
                    <FormControl>
                      <FormLabel
                        htmlFor="select-external-healthcare-facility"
                        required
                      >
                        {t('wasteSource:form.external_waste_source.label')}
                      </FormLabel>
                      <ReactSelectAsync
                        {...field}
                        id="select-external-healthcare-facility"
                        loadOptions={loadEntityList}
                        debounceTimeout={300}
                        isMulti={false}
                        isClearable
                        placeholder={t(
                          'wasteSource:form.external_waste_source.placeholder'
                        )}
                        additional={{
                          page: 1,
                          type_ids: '3',
                          province_ids: getDefaultProvinceValue()?.value,
                          regency_ids: getDefaultRegencyValue()?.value,
                        }}
                        onChange={(option: OptionType) => {
                          onChange(option);

                          setValue('externalHealthcareFacility', option);
                        }}
                        value={value as OptionType}
                        error={
                          !!error?.message ||
                          !!errors.externalHealthcareFacility?.label?.message
                        }
                      />
                      <FormErrorMessage>
                        {error?.message ||
                          errors.externalHealthcareFacility?.label?.message}
                      </FormErrorMessage>
                    </FormControl>
                  );
                }}
              />
            </>
          )}

          {/* if source type INTERNAL_TREATMENT */}
          {watch('sourceType') === SourceType.INTERNAL_TREATMENT && (
            <Controller
              name="internalTreatmentName"
              control={control}
              render={({
                field: { onChange, value, ...field },
                fieldState: { error },
              }) => {
                const selectedValues = getInternalTreatmentOptions().find(
                  (opt) => opt.value === value
                );

                return (
                  <FormControl>
                    <FormLabel htmlFor="select-internal-treatment" required>
                      {t(
                        'wasteSource:form.internal_treatment_waste_source.label'
                      )}
                    </FormLabel>
                    <ReactSelect
                      {...field}
                      id="select-internal-treatment"
                      placeholder={t(
                        'wasteSource:form.internal_treatment_waste_source.placeholder'
                      )}
                      options={getInternalTreatmentOptions()}
                      onChange={(option: OptionType) => {
                        onChange(option);

                        setValue('internalTreatmentName', option.value);
                        clearErrors('internalTreatmentName');
                      }}
                      value={selectedValues}
                      isClearable
                    />
                    {error?.message && (
                      <FormErrorMessage>{error?.message}</FormErrorMessage>
                    )}
                  </FormControl>
                );
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default WasteSourceFormInfo;

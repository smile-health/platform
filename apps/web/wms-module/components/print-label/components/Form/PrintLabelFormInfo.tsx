import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '@repo/ui/components/form-control';
import { Input } from '@repo/ui/components/input';
import {
  OptionType,
  OptionTypeWithData,
  ReactSelect,
  ReactSelectAsync,
} from '@repo/ui/components/react-select';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { getSourceTypeOptions } from '@/components/waste-source/utils/helper';
import { loadWasteByParentHierarchyId } from '@/services/waste-hierarchy';
import { loadWasteSourceList } from '@/services/waste-source';
import { WasteCassificationPartnership } from '@/types/partnership';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { PrintLabelFormData } from '../../schema/PrintLabelSchemaForm';

type WasteSpecificationFormInfoParams = {
  isEdit?: boolean;
};

const PrintLabelFormInfo: React.FC<WasteSpecificationFormInfoParams> = ({
  isEdit,
}) => {
  const { t } = useTranslation(['printLabel']);

  const {
    register,
    watch,
    setValue,
    formState: { errors },
    clearErrors,
    control,
  } = useFormContext<PrintLabelFormData>();

  const wasteTypeId = useWatch({ name: 'wasteTypeId' });
  const wasteGroupId = useWatch({ name: 'wasteGroupId' });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const sourceOptions = useMemo(() => getSourceTypeOptions(), [t]);

  const sourceTypeValue = sourceOptions.find(
    (option) => option.value === watch('sourceType')
  );

  const { i18n } = useTranslation();

  const { data: wasteTypeOption } = useQuery({
    queryKey: ['wasteTypeOptions', i18n.language],
    queryFn: () =>
      loadWasteByParentHierarchyId('', null, {
        page: 1,
        parent_hierarchy_id: null,
      }),
    select: (res) => res.options,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const { data: wasteGroupOption } = useQuery({
    queryKey: ['wasteGroupOptions', wasteTypeId, i18n.language],
    queryFn: () =>
      loadWasteByParentHierarchyId('', null, {
        page: 1,
        parent_hierarchy_id: wasteTypeId,
      }),
    select: (res) => res.options,
    retry: false,
    refetchOnWindowFocus: false,
    enabled: Boolean(wasteTypeId),
  });

  const { data: wasteCharacteristicOption } = useQuery({
    queryKey: ['wasteCharacteristicOptions', wasteGroupId, i18n.language],
    queryFn: () =>
      loadWasteByParentHierarchyId('', null, {
        page: 1,
        parent_hierarchy_id: wasteGroupId,
      }),
    select: (res) =>
      res.options.filter((item) => item.data.wasteClassificationId),
    retry: false,
    refetchOnWindowFocus: false,
    enabled: Boolean(wasteGroupId),
  });

  return (
    <div className="ui-flex ui-flex-col">
      <div className="ui-p-4 ui-border ui-rounded">
        <div className="ui-grid ui-grid-cols-1 ui-gap-x-6 ui-gap-y-6">
          <FormControl>
            <FormLabel htmlFor="select-source-type" required>
              {t('printLabel:form.source_type.label')}
            </FormLabel>
            <ReactSelect
              {...register('sourceType')}
              id="select-source-type"
              placeholder={t('printLabel:form.source_type.placeholder')}
              options={sourceOptions}
              onChange={(option: OptionType) => {
                setValue('sourceType', option?.value);
                clearErrors('sourceType');
                setValue('wasteSource', { label: '', value: 0 });
              }}
              value={sourceTypeValue}
              isClearable
            />
            {errors?.sourceType?.message && (
              <FormErrorMessage>{errors?.sourceType?.message}</FormErrorMessage>
            )}
          </FormControl>
          <Controller
            name="wasteSource"
            control={control}
            render={({
              field: { onChange, value, ...field },
              fieldState: { error },
            }) => {
              return (
                <FormControl>
                  <FormLabel htmlFor="select-manufacturer" required>
                    {t('printLabel:form.waste_source.label')}
                  </FormLabel>
                  <ReactSelectAsync
                    {...field}
                    id="select-waste-source"
                    loadOptions={loadWasteSourceList}
                    debounceTimeout={300}
                    isMulti={false}
                    isClearable
                    placeholder={t('printLabel:form.waste_source.placeholder')}
                    additional={{
                      page: 1,
                      sourceType: sourceTypeValue?.value,
                    }}
                    onChange={(option: OptionType) => {
                      onChange(option);
                      setValue('wasteSource', option);
                      clearErrors('wasteSource');
                    }}
                    error={!!error?.message}
                    disabled={!sourceTypeValue}
                    cacheUniqs={[sourceTypeValue]}
                    value={value as OptionType}
                  />
                  {errors?.wasteSource?.message && (
                    <FormErrorMessage>
                      {errors?.wasteSource?.message}
                    </FormErrorMessage>
                  )}
                </FormControl>
              );
            }}
          />
          <Controller
            name="wasteTypeId"
            control={control}
            render={({
              field: { onChange, value, ...field },
              fieldState: { error },
            }) => {
              return (
                <FormControl>
                  <FormLabel htmlFor="select-waste-type" required>
                    {t('printLabel:form.waste_type.label')}
                  </FormLabel>
                  <ReactSelect
                    {...field}
                    id="select-waste-type"
                    placeholder={t('printLabel:form.waste_type.placeholder')}
                    options={wasteTypeOption}
                    onChange={(option: OptionType) => {
                      setValue('wasteTypeId', option?.value);
                      clearErrors('wasteTypeId');

                      setValue('wasteGroupId', 0);
                      clearErrors('wasteGroupId');

                      setValue('wasteCharacteristicsId', 0);
                      clearErrors('wasteCharacteristicsId');
                    }}
                    value={wasteTypeOption?.find(
                      (x) => x.value === watch('wasteTypeId')
                    )}
                    isClearable
                  />
                  {error?.message && (
                    <FormErrorMessage>{error?.message}</FormErrorMessage>
                  )}
                </FormControl>
              );
            }}
          />
          <Controller
            name="wasteGroupId"
            control={control}
            render={({
              field: { onChange, value, ...field },
              fieldState: { error },
            }) => {
              return (
                <FormControl>
                  <FormLabel htmlFor="select-waste-group" required>
                    {t('printLabel:form.waste_group.label')}
                  </FormLabel>
                  <ReactSelect
                    {...field}
                    id="select-waste-group"
                    placeholder={t('printLabel:form.waste_group.placeholder')}
                    options={wasteGroupOption}
                    onChange={(option: OptionType) => {
                      setValue('wasteGroupId', option?.value);
                      clearErrors('wasteGroupId');

                      setValue('wasteCharacteristicsId', 0);
                      clearErrors('wasteCharacteristicsId');
                    }}
                    value={
                      wasteGroupOption?.find(
                        (x) => x.value === watch('wasteGroupId')
                      ) ?? null
                    }
                    isClearable
                  />
                  {error?.message && (
                    <FormErrorMessage>{error?.message}</FormErrorMessage>
                  )}
                </FormControl>
              );
            }}
          />
          <Controller
            name="wasteCharacteristicsId"
            control={control}
            render={({
              field: { onChange, value, ...field },
              fieldState: { error },
            }) => {
              return (
                <FormControl>
                  <FormLabel htmlFor="select-waste-characteristic" required>
                    {t('printLabel:form.waste_characteristic.label')}
                  </FormLabel>
                  <ReactSelect
                    {...field}
                    id="select-waste-characteristic"
                    placeholder={t(
                      'printLabel:form.waste_characteristic.placeholder'
                    )}
                    options={wasteCharacteristicOption}
                    onChange={(
                      option: OptionTypeWithData<WasteCassificationPartnership>
                    ) => {
                      setValue(
                        'wasteClassificationId',
                        option?.data?.wasteClassificationId ?? 0
                      );
                      setValue('wasteCharacteristicsId', option?.value);
                      clearErrors('wasteCharacteristicsId');
                    }}
                    value={
                      wasteCharacteristicOption?.find(
                        (x) => x.value === watch('wasteCharacteristicsId')
                      ) ?? null
                    }
                    isClearable
                  />
                  {error?.message && (
                    <FormErrorMessage>{error?.message}</FormErrorMessage>
                  )}
                </FormControl>
              );
            }}
          />
          <FormControl>
            <FormLabel htmlFor="select-source-type" required>
              {t('printLabel:form.total_number.label')}
            </FormLabel>
            <Input
              {...register('total_number')}
              id="input-waste-code"
              type="number"
              placeholder={t('printLabel:form.total_number.placeholder')}
              error={!!errors?.total_number}
            />
            <FormErrorMessage>
              {errors?.total_number?.message as string}
            </FormErrorMessage>
          </FormControl>
        </div>
      </div>
    </div>
  );
};

export default PrintLabelFormInfo;

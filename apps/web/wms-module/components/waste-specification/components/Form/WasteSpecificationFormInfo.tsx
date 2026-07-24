import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '@repo/ui/components/form-control';
import { OptionType, ReactSelect } from '@repo/ui/components/react-select';
import { useEffect } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { loadWasteByParentHierarchyId } from '@/services/waste-hierarchy';
import { Input } from '@repo/ui/components/input';
import { Radio, RadioGroup } from '@repo/ui/components/radio';
import { useQuery } from '@tanstack/react-query';

import { WasteSpecificationFormData } from '../../schema/WasteSpecificationSchemaForm';
import {
  getExternalTreatmentOptions,
  getInternalTreatmentOptions,
  getVehicleTypeOptions,
  getWasteBagColorOptions,
} from '../../utils/helper';
import { DEFAULT_VALUE } from '../../utils/wasteSpecification.contants';

type WasteSpecificationFormInfoParams = {
  isEdit?: boolean;
};

const WasteSpecificationFormInfo: React.FC<WasteSpecificationFormInfoParams> = ({
  isEdit,
}) => {
  const { t } = useTranslation(['wasteSpecification', 'common']);

  const {
    register,
    watch,
    setValue,
    formState: { errors },
    clearErrors,
    control,
  } = useFormContext<WasteSpecificationFormData>();

  const wasteTypeId = useWatch({ name: 'wasteTypeId' });
  const wasteGroupId = useWatch({ name: 'wasteGroupId' });
  const useColdStorage = useWatch({ name: 'useColdStorage' });
  const hasMultipleTransporters = useWatch({ name: 'hasMultipleTransporters' });
  const wasteInternalTreatment = useWatch({ name: 'wasteInternalTreatment' });
  const wasteCharacteristicsId = useWatch({ name: 'wasteCharacteristicsId' });

  const internalTreatmentOptions = getInternalTreatmentOptions();
  const externalTreatmentOptions = getExternalTreatmentOptions(
    wasteInternalTreatment
  );
  const wasteBagColorOptions = getWasteBagColorOptions();
  const vehicleTypeOptions = getVehicleTypeOptions();

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
    select: (res) => res.options,
    retry: false,
    refetchOnWindowFocus: false,
    enabled: Boolean(wasteGroupId),
  });

  const wasteExternalTreatment = useWatch({ name: 'wasteExternalTreatment' });

  useEffect(() => {
    if (wasteExternalTreatment) {
      const treatmentOptionsRequiringTransport = [
        'TRANSPORTER_TREATMENT', // Treatment
        'TRANSPORTER_RECYCLER', // Recycle
        'TRANSPORTER_LANDFILL', // Treatment Landfill
      ];

      const selectedValues = wasteExternalTreatment
        .split(',')
        .map((v: string) =>
          externalTreatmentOptions.find((opt) => opt.value === v)
        )
        .filter(Boolean);

      const hasTreatmentOptions = selectedValues?.some((option: OptionType) =>
        treatmentOptionsRequiringTransport.includes(option.value)
      );

      const hasTransport = selectedValues?.some(
        (option: OptionType) => option.value === 'TRANSPORTER'
      );

      if (hasTreatmentOptions && !hasTransport) {
        const transportOption = externalTreatmentOptions.find(
          (opt) => opt.value === 'TRANSPORTER'
        );
        if (transportOption) {
          const updatedValues = [...selectedValues, transportOption];
          const valueTemp = updatedValues.map((x) => String(x.value)).join(',');
          setValue('wasteExternalTreatment', valueTemp);
        }
      }
    }
  }, [wasteExternalTreatment, setValue, externalTreatmentOptions]);

  return (
    <div className="ui-flex ui-flex-col">
      <div className="ui-p-4 ui-border ui-rounded">
        <div className="ui-grid ui-grid-cols-1 ui-gap-x-6 ui-gap-y-6">
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
                    {t('wasteSpecification:form.waste_type.label')}
                  </FormLabel>
                  <ReactSelect
                    {...field}
                    id="select-waste-type"
                    placeholder={t(
                      'wasteSpecification:form.waste_type.placeholder'
                    )}
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
                    disabled={isEdit}
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
                    {t('wasteSpecification:form.waste_group.label')}
                  </FormLabel>
                  <ReactSelect
                    {...field}
                    id="select-waste-group"
                    placeholder={t(
                      'wasteSpecification:form.waste_group.placeholder'
                    )}
                    options={wasteGroupOption}
                    onChange={(option: OptionType) => {
                      setValue('wasteGroupId', option?.value);
                      clearErrors('wasteGroupId');

                      setValue('wasteCharacteristicsId', 0);
                      clearErrors('wasteCharacteristicsId');
                    }}
                    value={wasteGroupOption?.find(
                      (x) => x.value === watch('wasteGroupId')
                    )}
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
                    {t('wasteSpecification:form.waste_characteristic.label')}
                  </FormLabel>
                  <ReactSelect
                    {...field}
                    id="select-waste-characteristic"
                    placeholder={t(
                      'wasteSpecification:form.waste_characteristic.placeholder'
                    )}
                    options={wasteCharacteristicOption}
                    onChange={(option: OptionType) => {
                      setValue('wasteCharacteristicsId', option?.value);
                      clearErrors('wasteCharacteristicsId');
                    }}
                    value={wasteCharacteristicOption?.find(
                      (x) => x.value === wasteCharacteristicsId
                    )}
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
          <FormControl>
            <FormLabel required>
              {t('wasteSpecification:form.waste_code.label')}
            </FormLabel>
            <Input
              {...register('wasteCode')}
              id="input-waste-code"
              type="text"
              placeholder={t('wasteSpecification:form.waste_code.placeholder')}
              error={!!errors?.wasteCode}
            />
            <FormErrorMessage>
              {errors?.wasteCode?.message as string}
            </FormErrorMessage>
          </FormControl>
          <Controller
            name="wasteBagColor"
            control={control}
            render={({
              field: { onChange, value, ...field },
              fieldState: { error },
            }) => {
              return (
                <FormControl>
                  <FormLabel htmlFor="select-waste-bag-color" required>
                    {t('wasteSpecification:form.waste_bag_color.label')}
                  </FormLabel>
                  <ReactSelect
                    {...field}
                    id="select-waste-bag-color"
                    placeholder={t(
                      'wasteSpecification:form.waste_bag_color.placeholder'
                    )}
                    options={wasteBagColorOptions}
                    onChange={(option: OptionType) => {
                      setValue('wasteBagColor', option?.value);
                      clearErrors('wasteBagColor');
                    }}
                    value={wasteBagColorOptions?.find(
                      (x) => x.value === watch('wasteBagColor')
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
          {wasteCharacteristicsId === 54 && (
            <div className="ui-flex ui-flex-row ui-justify-between ui-items-start">
              <div className="ui-w-[300px]">
                <FormControl className="ui-mt-3">
                  <FormLabel required>
                    {t(
                      'wasteSpecification:form.minimum_decay_time_process.label'
                    )}
                  </FormLabel>
                </FormControl>
              </div>
              <FormControl className="ui-flex-1">
                <Input
                  {...register('minimunDecayDay')}
                  id="input-minimun-decay-day"
                  type="number"
                  min={1}
                  placeholder={t(
                    'wasteSpecification:form.minimum_decay_time_process.placeholder'
                  )}
                  error={!!errors?.minimunDecayDay}
                />
                <FormErrorMessage>
                  {errors?.minimunDecayDay?.message as string}
                </FormErrorMessage>
              </FormControl>
            </div>
          )}
          <FormControl>
            <FormLabel required>
              {t('wasteSpecification:form.multiple_transporters.label')}
            </FormLabel>
            <RadioGroup>
              <Radio
                {...register('hasMultipleTransporters', {
                  onChange: (e) => {
                    setValue('hasMultipleTransporters', e.target.value);
                  },
                })}
                id="radio-yes-multiple-transporters"
                value={DEFAULT_VALUE.YES}
                checked={Number(hasMultipleTransporters) === DEFAULT_VALUE.YES}
                label={t('common:yes')}
              />
              <Radio
                {...register('hasMultipleTransporters', {
                  onChange: (e) => {
                    setValue('hasMultipleTransporters', e.target.value);
                  },
                })}
                id="radio-not-multiple-transporters"
                value={DEFAULT_VALUE.NO}
                checked={Number(hasMultipleTransporters) === DEFAULT_VALUE.NO}
                label={t('common:no')}
              />
            </RadioGroup>
          </FormControl>
          <FormControl>
            <FormLabel required>
              {t('wasteSpecification:form.use_cold_storage.label')}
            </FormLabel>
            <RadioGroup>
              <Radio
                {...register('useColdStorage', {
                  onChange: (e) => {
                    setValue('useColdStorage', e.target.value);
                    clearErrors('useColdStorage');
                  },
                })}
                id="radio-yes-use-cold-storage"
                value={DEFAULT_VALUE.YES}
                checked={Number(useColdStorage) === DEFAULT_VALUE.YES}
                label={t('common:yes')}
              />
              <Radio
                {...register('useColdStorage', {
                  onChange: (e) => {
                    setValue('useColdStorage', e.target.value);
                    clearErrors('useColdStorage');

                    setValue('coldStorageMaxProcessingTime', 0);
                  },
                })}
                id="radio-not-use-cold-storage"
                value={DEFAULT_VALUE.NO}
                checked={Number(useColdStorage) === DEFAULT_VALUE.NO}
                label={t('common:no')}
              />
            </RadioGroup>
          </FormControl>
          <div className="ui-flex ui-flex-row ui-justify-between ui-items-start">
            <div className="ui-w-[300px]">
              <FormControl className="ui-mt-3">
                <FormLabel
                  required={Number(useColdStorage) === DEFAULT_VALUE.YES}
                >
                  {t(
                    'wasteSpecification:form.cold_storage_max_processing_type.label'
                  )}
                </FormLabel>
              </FormControl>
            </div>
            <FormControl className="ui-flex-1">
              <Input
                {...register('coldStorageMaxProcessingTime')}
                id="input-cold-storage-max-processing-time"
                type="number"
                min={1}
                placeholder={t(
                  'wasteSpecification:form.cold_storage_max_processing_time.placeholder'
                )}
                error={!!errors?.coldStorageMaxProcessingTime}
                disabled={Number(useColdStorage) === DEFAULT_VALUE.NO}
              />
              <FormErrorMessage>
                {errors?.coldStorageMaxProcessingTime?.message as string}
              </FormErrorMessage>
            </FormControl>
          </div>
          <div className="ui-flex ui-flex-row ui-justify-between ui-items-start">
            <div className="ui-w-[300px]">
              <FormControl className="ui-mt-3">
                <FormLabel required={wasteCharacteristicsId !== 54}>
                  {t(
                    'wasteSpecification:form.temporary_storage_max_processing_type.label'
                  )}
                </FormLabel>
              </FormControl>
            </div>
            <FormControl className="ui-flex-1">
              <Input
                {...register('temporaryStorageMaxProcessingTime')}
                id="input-cold-storage-max-processing-time"
                type="number"
                min={1}
                placeholder={t(
                  'wasteSpecification:form.temporary_storage_max_processing_time.placeholder'
                )}
                error={!!errors?.temporaryStorageMaxProcessingTime}
                disabled={
                  !wasteCharacteristicsId || wasteCharacteristicsId === 54
                }
              />
              <FormErrorMessage>
                {errors?.temporaryStorageMaxProcessingTime?.message as string}
              </FormErrorMessage>
            </FormControl>
          </div>
          <Controller
            name="wasteInternalTreatment"
            control={control}
            render={({
              field: { onChange, value, ...field },
              fieldState: { error },
            }) => {
              const selectedValues =
                typeof value === 'string'
                  ? value
                      .split(',')
                      .map((v) =>
                        internalTreatmentOptions.find((opt) => opt.value === v)
                      )
                      .filter(Boolean)
                  : null;

              return (
                <FormControl>
                  <FormLabel htmlFor="select-internal-treatment">
                    {t(
                      'wasteSpecification:form.waste_internal_treatment.label'
                    )}
                  </FormLabel>
                  <ReactSelect
                    {...field}
                    id="select-internal-treatment"
                    placeholder={t(
                      'wasteSpecification:form.waste_internal_treatment.placeholder'
                    )}
                    options={internalTreatmentOptions}
                    onChange={(option: OptionType[]) => {
                      onChange(option);
                      const valueTemp = option
                        .map((x) => String(x.value))
                        .join(',');

                      // Reset external treatment when internal treatment changes
                      setValue('wasteExternalTreatment', '');
                      clearErrors('wasteExternalTreatment');

                      setValue('wasteInternalTreatment', valueTemp);
                      clearErrors('wasteInternalTreatment');
                    }}
                    value={selectedValues}
                    isClearable
                    isMulti
                    multiSelectCounterStyle="normal"
                  />
                  {error?.message && (
                    <FormErrorMessage>{error?.message}</FormErrorMessage>
                  )}
                </FormControl>
              );
            }}
          />
          <Controller
            name="wasteExternalTreatment"
            control={control}
            render={({
              field: { onChange, value, ...field },
              fieldState: { error },
            }) => {
              const selectedValues =
                typeof value === 'string'
                  ? value
                      .split(',')
                      .map((v: string) =>
                        externalTreatmentOptions.find((opt) => opt.value === v)
                      )
                      .filter(Boolean)
                  : null;

              const treatmentOptionsRequiringTransport = [
                'TRANSPORTER_TREATMENT', // Treatment
                'TRANSPORTER_RECYCLER', // Recycle
                'TRANSPORTER_LANDFILL', // Treatment Landfill
              ];

              const hasTreatmentOptions = selectedValues?.some(
                (option: OptionType) =>
                  treatmentOptionsRequiringTransport.includes(option.value)
              );

              const hasTransport = selectedValues?.some(
                (option: OptionType) => option.value === 'TRANSPORTER'
              );

              const availableOptions = externalTreatmentOptions;

              return (
                <FormControl>
                  <FormLabel htmlFor="select-waste-external-treatment" required>
                    {t(
                      'wasteSpecification:form.waste_external_treatment.label'
                    )}
                  </FormLabel>
                  <ReactSelect
                    {...field}
                    id="select-waste-external-treatment"
                    placeholder={t(
                      'wasteSpecification:form.waste_external_treatment.placeholder'
                    )}
                    options={availableOptions}
                    onChange={(option: OptionType[]) => {
                      onChange(option);

                      const selectedTreatmentOptions = option?.some((opt) =>
                        treatmentOptionsRequiringTransport.includes(opt.value)
                      );

                      let finalOptions = option || [];

                      if (
                        selectedTreatmentOptions &&
                        !option?.some((opt) => opt.value === 'TRANSPORTER')
                      ) {
                        const transportOption = externalTreatmentOptions.find(
                          (opt) => opt.value === 'TRANSPORTER'
                        );
                        if (transportOption) {
                          finalOptions = [...option, transportOption];
                        }
                      }

                      const valueTemp = finalOptions
                        .map((x) => String(x.value))
                        .join(',');

                      setValue('wasteExternalTreatment', valueTemp);
                      clearErrors('wasteExternalTreatment');
                    }}
                    value={selectedValues}
                    isClearable
                    isMulti
                    multiSelectCounterStyle="normal"
                  />
                  {error?.message && (
                    <FormErrorMessage>{error?.message}</FormErrorMessage>
                  )}
                  {hasTreatmentOptions && hasTransport && (
                    <div className="ui-text-sm ui-text-blue-600 ui-mt-1">
                      {t(
                        'wasteSpecification:form.waste_external_treatment.transport_auto_selected'
                      )}
                    </div>
                  )}
                </FormControl>
              );
            }}
          />
          <Controller
            name="vehicleType"
            control={control}
            render={({
              field: { onChange, value, ...field },
              fieldState: { error },
            }) => {
              return (
                <FormControl>
                  <FormLabel htmlFor="select-vechile-type">
                    {t('wasteSpecification:form.vehicle_type.label')}
                  </FormLabel>
                  <ReactSelect
                    {...field}
                    id="select-vechile-type"
                    placeholder={t(
                      'wasteSpecification:form.vehicle_type.placeholder'
                    )}
                    options={vehicleTypeOptions}
                    onChange={(option: OptionType) => {
                      setValue('vehicleType', option?.value);
                      clearErrors('vehicleType');
                    }}
                    value={vehicleTypeOptions?.find(
                      (x) => x.value === watch('vehicleType')
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
        </div>
      </div>
    </div>
  );
};

export default WasteSpecificationFormInfo;

import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '@repo/ui/components/form-control';
import { Input } from '@repo/ui/components/input';
import { OptionType, ReactSelect } from '@repo/ui/components/react-select';

import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { useTranslation } from 'react-i18next';

import { PartnershipVehicleFormData } from '../../schema/PartnershipVehicleSchemaForm';

import { getVehicleTypeOptions } from '../../../waste-specification/utils/helper';
import { formatVehicleNumber } from '../../utils/helper';
import { useHealthcarePatner } from '@/components/partnership/hooks/useHealthcarePatner';
import { useParams } from 'next/navigation';

const PartnershipVehicleFormInfo: React.FC = () => {
  const { t } = useTranslation(['partnershipVehicle', 'common']);
  const params = useParams();
  const isEdit = Boolean(params?.id);

  const {
    register,
    watch,
    setValue,
    formState: { errors },
    clearErrors,
    control,
  } = useFormContext<PartnershipVehicleFormData>();

  const vehicleTypeOptions = getVehicleTypeOptions();

  const { options: healthcarePatnerOptions } = useHealthcarePatner();

  return (
    <div className="ui-flex ui-flex-col">
      <div className="ui-p-4 ui-border ui-rounded">
        <div className="ui-grid ui-grid-cols-1 ui-gap-x-6 ui-gap-y-6">
          <FormControl>
            <FormLabel htmlFor="select-vehicle-type" required>
              {t('partnershipVehicle:form.vehicle_type.label')}
            </FormLabel>
            <ReactSelect
              {...register('vehicleType')}
              id="select-vehicle-type"
              placeholder={t(
                'partnershipVehicle:form.vehicle_type.placeholder'
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
            {errors?.vehicleType?.message && (
              <FormErrorMessage>
                {errors?.vehicleType?.message}
              </FormErrorMessage>
            )}
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="input-vehicle-number" required>
              {t('partnershipVehicle:form.vehicle_number.label')}
            </FormLabel>
            <Input
              {...register('vehicleNumber')}
              id="input-vehicle-number"
              type="text"
              placeholder={t(
                'partnershipVehicle:form.vehicle_number.placeholder'
              )}
              error={!!errors?.vehicleNumber}
              onChange={(e) => {
                e.target.value = formatVehicleNumber(e.target.value);
                register('vehicleNumber').onChange(e);
              }}
            />
            <FormErrorMessage>
              {errors?.vehicleNumber?.message as string}
            </FormErrorMessage>
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="input-capacity" required>
              {t('partnershipVehicle:form.capacity.label')}
            </FormLabel>
            <Input
              {...register('capacityInKgs')}
              id="input-capacity"
              type="number"
              placeholder={t('partnershipVehicle:form.capacity.placeholder')}
              error={!!errors?.capacityInKgs}
              className="[&::-webkit-outer-spin-button]:ui-appearance-none [&::-webkit-inner-spin-button]:ui-appearance-none"
            />
            <FormErrorMessage>
              {errors?.capacityInKgs?.message as string}
            </FormErrorMessage>
          </FormControl>
          <Controller
            name="entity"
            control={control}
            render={({
              field: { onChange, value, ...field },
              fieldState: { error },
            }) => {
              return (
                <FormControl>
                  <FormLabel htmlFor="select-entity" required>
                    {t('partnershipVehicle:form.healthcare_consumer.label')}
                  </FormLabel>
                  <ReactSelect
                    {...field}
                    id="select-entity"
                    options={healthcarePatnerOptions}
                    isClearable
                    isMulti={!isEdit}
                    multiSelectCounterStyle="normal"
                    multiSelectOptionStyle="normal"
                    placeholder={t(
                      'partnershipVehicle:form.healthcare_consumer.placeholder'
                    )}
                    onChange={(option: OptionType | OptionType[] | null) => {
                      if (isEdit) {
                        // For edit mode
                        onChange(option);
                        clearErrors('entity');
                        if (option && !Array.isArray(option)) {
                          setValue('entity', option);
                        }
                      } else {
                        // For create mode
                        const optionsArray = Array.isArray(option)
                          ? option
                          : [];
                        onChange(optionsArray);
                        clearErrors('entity');
                        setValue('entity', optionsArray);
                      }
                    }}
                    value={value}
                    error={!!error?.message}
                  />
                  {errors?.entity?.message && (
                    <FormErrorMessage>
                      {errors?.entity?.message}
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

export default PartnershipVehicleFormInfo;

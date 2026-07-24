import { FormErrorMessage } from '@repo/ui/components/form-control';
import { Input } from '@repo/ui/components/input';
import { ReactSelect } from '@repo/ui/components/react-select';

import React from 'react';

import { useFormContext } from 'react-hook-form';

import { useTranslation } from 'react-i18next';

import { PartnershipStatusOption } from '@/components/partnership/constants/partnership';
import { getPartnershipStatusOptions } from '@/components/partnership/utils/helper';
import { HealthcarePartnerFormData } from '../../schema/HealthcarePartnerSchemaForm';

const HealthcarePartnerFormInfo: React.FC = () => {
  const { t } = useTranslation(['healthcarePartner', 'common']);

  const {
    register,
    watch,
    setValue,
    formState: { errors },
    clearErrors,
  } = useFormContext<HealthcarePartnerFormData>();

  const partnershipStatusOptions = getPartnershipStatusOptions();

  const selectedValue = partnershipStatusOptions.find(
    (option) => option.value === watch('partnershipStatus')
  );

  return (
    <div className="ui-grid ui-grid-cols-[264px_3px_1fr] ui-gap-x-2 ui-gap-y-4">
      <p className="ui-text-[#787878] ui-content-center">
        {t('healthcarePartner:form.pic_name.label')}
      </p>
      <span></span>
      <div className="ui-flex ui-flex-col">
        <Input
          {...register('picName')}
          type="text"
          placeholder={t('healthcarePartner:form.pic_name.placeholder')}
          error={!!errors?.picName}
          className="ui-min-w-[20px]"
        />
        <FormErrorMessage>
          {errors?.picName?.message as string}
        </FormErrorMessage>
      </div>
      <p className="ui-text-[#787878] ui-content-center">
        {t('healthcarePartner:form.position.label')}
      </p>
      <span></span>
      <div className="ui-flex ui-flex-col">
        <Input
          {...register('picPosition')}
          type="text"
          placeholder={t('healthcarePartner:form.position.placeholder')}
          error={!!errors?.picPosition}
          className="ui-min-w-[20px]"
        />
        <FormErrorMessage>
          {errors?.picPosition?.message as string}
        </FormErrorMessage>
      </div>
      <p className="ui-text-[#787878] ui-content-center">
        {t('healthcarePartner:form.phone_number.label')}
      </p>
      <span></span>
      <div className="ui-flex ui-flex-col">
        <Input
          {...register('picPhoneNumber')}
          type="number"
          placeholder={t('healthcarePartner:form.phone_number.placeholder')}
          error={!!errors?.picPhoneNumber}
          className="ui-min-w-[200px] [&::-webkit-outer-spin-button]:ui-appearance-none [&::-webkit-inner-spin-button]:ui-appearance-none"
        />
        <FormErrorMessage>
          {errors?.picPhoneNumber?.message as string}
        </FormErrorMessage>
      </div>
      <p className="ui-text-[#787878] ui-content-center ui-content-center">
        {t('healthcarePartner:form.partnership_status.label')}
      </p>
      <span></span>
      <div className="ui-flex ui-flex-col">
        <ReactSelect
          {...register('partnershipStatus')}
          id="select-asset-status"
          placeholder={t(
            'healthcarePartner:form.partnership_status.placeholder'
          )}
          options={partnershipStatusOptions}
          onChange={(option: PartnershipStatusOption) => {
            setValue('partnershipStatus', option?.value);
            clearErrors('partnershipStatus');
          }}
          value={selectedValue}
          isClearable
          className="ui-min-w-[20px]"
        />
        {errors?.partnershipStatus?.message && (
          <FormErrorMessage>
            {errors?.partnershipStatus?.message}
          </FormErrorMessage>
        )}
      </div>
    </div>
  );
};

export default HealthcarePartnerFormInfo;

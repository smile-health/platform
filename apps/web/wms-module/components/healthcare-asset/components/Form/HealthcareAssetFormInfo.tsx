import { FormErrorMessage } from '@repo/ui/components/form-control';
import { Input } from '@repo/ui/components/input';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import { useTranslation } from 'react-i18next';
import { HealthcareAssetFormData } from '../../schema/HealthcareAssetSchemaForm';
import { loggedAsAdmin } from '@/utils/getUserRole';

const HealthcareAssetFormInfo: React.FC = () => {
  const { t } = useTranslation(['healthcareAsset']);
  const {
    register,
    formState: { errors },
  } = useFormContext<HealthcareAssetFormData>();

  return (
    <div className="ui-grid ui-grid-cols-[264px_3px_1fr] ui-gap-x-2 ui-gap-y-4">
      <p className="ui-text-[#787878] ui-content-center">
        {t('healthcareAsset:form.dongle_id.label')}
      </p>
      <span className="ui-mt-1">:</span>
      <div className="ui-flex ui-flex-col gap-1">
        <Input
          {...register('assetId')}
          type="text"
          placeholder={t('healthcareAsset:form.dongle_id.placeholder')}
          error={!!errors?.assetId}
          className="ui-min-w-[20px] ui-uppercase"
          disabled={loggedAsAdmin()}
        />
        <FormErrorMessage>
          {errors?.assetId?.message as string}
        </FormErrorMessage>
      </div>
    </div>
  );
};

export default HealthcareAssetFormInfo;

import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '@repo/ui/components/form-control';
import { Input } from '@repo/ui/components/input';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import { useTranslation } from 'react-i18next';
import { AssetDongleFormData } from '../../schema/AssetDongleSchemaForm';

const AssetDongleFormInfo: React.FC = () => {
  const { t } = useTranslation(['assetDongle']);

  const {
    register,
    formState: { errors },
  } = useFormContext<AssetDongleFormData>();

  return (
    <div className="ui-flex ui-flex-col">
      <div className="ui-p-4 ui-border ui-rounded">
        <div className="ui-grid ui-grid-cols-1 ui-gap-x-6 ui-gap-y-6">
          <FormControl>
            <FormLabel htmlFor="input-vehicle-number" required>
              {t('assetDongle:form.dongle_id.label')}
            </FormLabel>
            <Input
              {...register('assetId')}
              id="input-vehicle-number"
              type="text"
              placeholder={t('assetDongle:form.dongle_id.placeholder')}
              error={!!errors?.assetId}
            />
            <FormErrorMessage>
              {errors?.assetId?.message as string}
            </FormErrorMessage>
          </FormControl>
        </div>
      </div>
    </div>
  );
};

export default AssetDongleFormInfo;

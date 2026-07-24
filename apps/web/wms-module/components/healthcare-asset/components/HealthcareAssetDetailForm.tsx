'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@repo/ui/components/button';
import { toast } from '@repo/ui/components/toast';
import { useTranslation } from 'react-i18next';

import { ModalConfirmation } from '@/components/ModalConfirmation';
import { updateHealthcareAsset } from '@/services/healthcare-asset';
import {
  THealthcareAsset,
  UpdateHealthcareAssetInput,
} from '@/types/healthcare-asset';
import { loggedAsAdmin } from '@/utils/getUserRole';
import { handleAxiosError } from '@/utils/handleAxiosError';
import { useMutation } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useContext, useState } from 'react';
import {
  FieldErrors,
  FormProvider,
  SubmitHandler,
  useForm,
} from 'react-hook-form';
import {
  HealthcareAssetFormData,
  healthcareAssetFormSchema,
} from '../schema/HealthcareAssetSchemaForm';
import { HealthCareAssetDetailContext } from '../utils/healthcare-asset-detail.context';
import { handleDefaultValueHealthcare } from '../utils/helper';
import HealthcareAssetInfo from './Detail/HealthcareAssetInfo';
import HealthcareAssetFormInfo from './Form/HealthcareAssetFormInfo';

type HealthcareAssetDetailFormProps = {
  defaultValues?: THealthcareAsset;
  isAdmin?: boolean;
};

const HealthcareAssetDetailForm = ({
  defaultValues,
}: HealthcareAssetDetailFormProps) => {
  const params = useParams();
  const { t } = useTranslation(['common', 'healthcareAsset']);
  const { isAdmin } = useContext(HealthCareAssetDetailContext);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [invalidAssetId, setInvalidAssetId] = useState('');

  const methods = useForm<any>({
    resolver: yupResolver(healthcareAssetFormSchema(t) as any),
    mode: 'onBlur',
    defaultValues: handleDefaultValueHealthcare(defaultValues),
  });

  const { handleSubmit } = methods;

  const { mutate, isPending } = useMutation({
    mutationFn: (data: unknown) =>
      updateHealthcareAsset(
        Number(params?.healthcareId),
        data as UpdateHealthcareAssetInput
      ),
    onSuccess: () => {
      toast.success({
        description: t('common:message.success.update', {
          type: t('healthcareAsset:form.dongle_id.label')?.toLowerCase(),
        }),
      });
    },
    onError: handleAxiosError,
  });

  const onValid: SubmitHandler<HealthcareAssetFormData> = (formData) => {
    const assetIdUpper = formData.assetId?.toUpperCase() || '';
    const lettersOnly = assetIdUpper.replace(/[^A-Z]/g, '');

    const allowedKeywords = ['IND', 'IOTS', 'BADR'];

    if (assetIdUpper && !allowedKeywords.includes(lettersOnly)) {
      setInvalidAssetId(assetIdUpper);
      setShowErrorModal(true);
      return;
    }

    const commonPayload = {
      assetId: formData.assetId,
    };
    mutate(commonPayload);
  };

  const onInvalid = (errors: FieldErrors<HealthcareAssetFormData>) => {
    console.error('Validation Errors:', errors);
  };

  const assetName = defaultValues?.asset_type?.name?.toLowerCase() ?? '';
  const isScale = ['scale', 'timbangan'].some((keyword) =>
    assetName.includes(keyword)
  );

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onValid, onInvalid)}>
        <div className="space-y-4">
          <div className="ui-p-4 ui-border ui-border-neutral-300 ui-rounded ui-space-y-4">
            <HealthcareAssetInfo data={defaultValues} isLoading={false} />
            {isScale && isAdmin && <HealthcareAssetFormInfo />}
          </div>
        </div>
        {isScale && !loggedAsAdmin() && isAdmin && (
          <div className="ui-flex ui-mt-6 ui-justify-end">
            <Button
              id="btn-submit"
              type="submit"
              className="ui-w-[150px]"
              loading={isPending}
            >
              {t('common:save')}
            </Button>
          </div>
        )}
      </form>
      <ModalConfirmation
        open={showErrorModal}
        setOpen={setShowErrorModal}
        type="info"
        title={t('healthcareAsset:modal.title')}
        description={t('healthcareAsset:modal.description', {
          dongleId: invalidAssetId,
        })}
      />
    </FormProvider>
  );
};

export default HealthcareAssetDetailForm;

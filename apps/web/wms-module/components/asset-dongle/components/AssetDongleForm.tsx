'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@repo/ui/components/button';
import { toast } from '@repo/ui/components/toast';
import { useTranslation } from 'react-i18next';

import { createAssetDongle } from '@/services/asset-dongle';
import { CreateAssetDongleInput, TAssetDongle } from '@/types/asset-dongle';
import { handleAxiosError } from '@/utils/handleAxiosError';
import { useMutation } from '@tanstack/react-query';
import {
  FieldErrors,
  FormProvider,
  SubmitHandler,
  useForm,
} from 'react-hook-form';
import {
  AssetDongleFormData,
  assetDongleFormSchema,
} from '../schema/AssetDongleSchemaForm';
import { handleDefaultValueHealthcare } from '../utils/helper';
import AssetDongleFormInfo from './Form/AssetDongleFormInfo';
import useWmsRouter from '@/utils/hooks/useWmsRouter';

type AssetDongleDetailFormProps = {
  defaultValues?: TAssetDongle;
};

const AssetDongleDetailForm = ({
  defaultValues,
}: AssetDongleDetailFormProps) => {
  const router = useWmsRouter();
  const { t, i18n: locale } = useTranslation(['common', 'assetDongle']);
  const language = locale.language;

  const methods = useForm<any>({
    resolver: yupResolver(assetDongleFormSchema(t) as any),
    mode: 'onBlur',
    defaultValues: handleDefaultValueHealthcare(defaultValues),
  });

  const { handleSubmit } = methods;

  const { mutate, isPending } = useMutation({
    mutationFn: (data: unknown) =>
      createAssetDongle(data as CreateAssetDongleInput),
    onSuccess: () => {
      toast.success({
        description: t('common:message.success.create', {
          type: t('assetDongle:form.dongle_id.label')?.toLowerCase(),
        }),
      });
      router.push(`/${language}/asset-dongle`);
    },
    onError: handleAxiosError,
  });

  const onValid: SubmitHandler<AssetDongleFormData> = (formData) => {
    const commonPayload = {
      assetId: formData.assetId,
    };
    mutate(commonPayload);
  };

  const onInvalid = (errors: FieldErrors<AssetDongleFormData>) => {
    console.error('Validation Errors:', errors);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onValid, onInvalid)}>
        <div className="ui-w-full ui-space-y-6 ui-max-w-form ui-mx-auto">
          <AssetDongleFormInfo />
          <div className="ui-flex ui-justify-end">
            <div className="ui-grid ui-grid-cols-2 ui-w-[300px] ui-gap-2">
              <Button
                id="btn-back"
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                {t('common:back')}
              </Button>
              <Button id="btn-submit" type="submit" loading={isPending}>
                {t('common:save')}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default AssetDongleDetailForm;

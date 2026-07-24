'use client';

import useWmsRouter from '@/utils/hooks/useWmsRouter';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@repo/ui/components/button';
import {
  FieldErrors,
  FormProvider,
  SubmitHandler,
  useForm,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  CreateAssetTypeInput,
  TAssetType,
  UpdateAssetTypeInput,
} from '@/types/asset-type';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import {
  AssetTypeFormData,
  assetTypeFormSchema,
} from '../schema/AssetTypeSchemaForm';
import AssetTypeFormInfo from './Form/AssetTypeFormInfo';

import { createAssetType, updateAssetTyper } from '@/services/asset-type';
import { handleAxiosError } from '@/utils/handleAxiosError';
import { getUserStorage } from '@/utils/storage/user';
import { toast } from '@repo/ui/components/toast';
import { handleDefaultValue } from '../utils/helper';

type AssetTypeFormProps = {
  defaultValues?: TAssetType;
};

type BasePayload = {
  name?: string;
  description?: string;
  maxTemperature?: string;
  minTemperature?: string;
};

const AssetTypeForm = ({ defaultValues }: AssetTypeFormProps) => {
  const router = useWmsRouter();
  const params = useParams();
  const user = getUserStorage();
  const queryClient = useQueryClient();

  const { t } = useTranslation(['common', 'assetType']);

  const isEdit = Boolean(params?.id);

  const { i18n: locale } = useTranslation();
  const language = locale.language;

  const methods = useForm<any>({
    resolver: yupResolver(assetTypeFormSchema(t) as any),
    mode: 'onBlur',
    defaultValues: handleDefaultValue(defaultValues),
  });

  const { handleSubmit } = methods;

  const { mutate, isPending } = useMutation({
    mutationFn: (data: unknown) =>
      isEdit
        ? updateAssetTyper(Number(params?.id), data as UpdateAssetTypeInput)
        : createAssetType(data as CreateAssetTypeInput),
    onSuccess: () => {
      isEdit &&
        queryClient.invalidateQueries({
          queryKey: ['assetType-detail', params?.id],
        });

      toast.success({
        description: t(
          isEdit
            ? 'common:message.success.update'
            : 'common:message.success.create',
          {
            type: t('assetType:title.list')?.toLowerCase(),
          }
        ),
      });

      router.push(`/${language}/asset-type`);
    },
    onError: handleAxiosError,
  });

  const onValid: SubmitHandler<AssetTypeFormData> = (formData) => {
    const commonPayload: BasePayload = {
      name: formData.name ?? undefined,
      description: formData.description ?? undefined,
      maxTemperature: formData.maxTemperature ?? undefined,
      minTemperature: formData.minTemperature ?? undefined,
      ...(isEdit
        ? { updatedBy: user?.user_uuid }
        : { createdBy: user?.user_uuid }),
    };

    mutate(commonPayload);
  };

  const onInvalid = (errors: FieldErrors<AssetTypeFormData>) => {
    console.error('Validation Errors:', errors);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onValid, onInvalid)}>
        <div className="ui-w-full ui-space-y-6 ui-max-w-form ui-mx-auto">
          <AssetTypeFormInfo />
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

export default AssetTypeForm;

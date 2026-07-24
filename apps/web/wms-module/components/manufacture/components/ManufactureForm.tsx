'use client';

import { handleAxiosError } from '@/utils/handleAxiosError';
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
  CreateManufactureInput,
  GetManufactureDetailResponse,
  UpdateManufactureInput,
} from '@/types/manufacture';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import {
  ManufactureFormData,
  manufactureFormSchema,
} from '../schema/ManufactureSchemaForm';
import ManufactureFormInfo from './Form/ManufactureFormInfo';

import { createManufacture, updateManufacturer } from '@/services/manufacture';
import { getUserStorage } from '@/utils/storage/user';
import { toast } from '@repo/ui/components/toast';
import { handleDefaultValue } from '../utils/helper';

type ManufactureFormProps = {
  defaultValues?: GetManufactureDetailResponse;
};

type BasePayload = {
  name?: string;
  assetType?: string;
  description?: string;
  manufacturerId?: number;
};

const ManufactureForm = ({ defaultValues }: ManufactureFormProps) => {
  const router = useWmsRouter();
  const params = useParams();
  const user = getUserStorage();
  const queryClient = useQueryClient();

  const { t } = useTranslation(['common', 'manufacture']);

  const isEdit = Boolean(params?.id);

  const { i18n: locale } = useTranslation();
  const language = locale.language;

  const methods = useForm<any>({
    resolver: yupResolver(manufactureFormSchema(t) as any),
    mode: 'onBlur',
    defaultValues: handleDefaultValue(defaultValues),
  });

  const { handleSubmit } = methods;

  const { mutate, isPending } = useMutation({
    mutationFn: (data: unknown) =>
      isEdit
        ? updateManufacturer(Number(params?.id), data as UpdateManufactureInput)
        : createManufacture(data as CreateManufactureInput),
    onSuccess: () => {
      isEdit &&
        queryClient.invalidateQueries({
          queryKey: ['manufacture-detail', params?.id],
        });

      toast.success({
        description: t(
          isEdit
            ? 'common:message.success.update'
            : 'common:message.success.create',
          {
            type: t('manufacture:title.manufacture')?.toLowerCase(),
          }
        ),
      });

      router.push(`/${language}/manufacture`);
    },
    onError: handleAxiosError,
  });

  const onValid: SubmitHandler<ManufactureFormData> = (formData) => {
    const commonPayload: BasePayload = {
      name: formData.model ?? undefined,
      assetType: formData.asset_type ?? undefined,
      description: formData.description ?? undefined,
      manufacturerId: formData.manufacturer.value ?? undefined,
      ...(isEdit
        ? { updatedBy: user?.user_uuid }
        : { createdBy: user?.user_uuid }),
    };

    mutate(commonPayload);
  };

  const onInvalid = (errors: FieldErrors<ManufactureFormData>) => {
    console.error('Validation Errors:', errors);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onValid, onInvalid)}>
        <div className="ui-w-full ui-space-y-6 ui-max-w-form ui-mx-auto">
          <ManufactureFormInfo />
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

export default ManufactureForm;

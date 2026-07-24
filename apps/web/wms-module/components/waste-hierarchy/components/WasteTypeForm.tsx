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

import { getUserStorage } from '@/utils/storage/user';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  WasteTypeFormData,
  wasteTypeFormSchema,
} from '../schema/WasteHierarchySchemaForm';
import WasteTypeFormInfo from './Form/WasteTypeFormInfo';

import { createWasteType, updateWasteType } from '@/services/waste-hierarchy';
import {
  CreateWasteTypeInput,
  GetWasteTypeDetailResponse,
  UpdateWasteTypeInput,
} from '@/types/waste-hierarchy';
import { toast } from '@repo/ui/components/toast';
import { useParams } from 'next/navigation';
import { handleDefaultValueWasteType } from '../utils/helper';

type WasteTypeFormProps = {
  defaultValues?: GetWasteTypeDetailResponse;
};

type BasePayload = {
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  regionId: number;
};

const WasteTypeForm = ({ defaultValues }: WasteTypeFormProps) => {
  const router = useWmsRouter();
  const user = getUserStorage();
  const params = useParams();
  const queryClient = useQueryClient();

  const { t, i18n: locale } = useTranslation(['common', 'wasteHierarchy']);
  const language = locale.language;

  const isEdit = Boolean(params?.id);

  const methods = useForm<any>({
    resolver: yupResolver(wasteTypeFormSchema(t) as any),
    mode: 'onBlur',
    defaultValues: handleDefaultValueWasteType(defaultValues),
  });

  const { handleSubmit } = methods;

  const { mutate, isPending } = useMutation({
    mutationFn: (data: unknown) =>
      isEdit
        ? updateWasteType(Number(params?.id), data as UpdateWasteTypeInput)
        : createWasteType(data as CreateWasteTypeInput),
    onSuccess: () => {
      isEdit &&
        queryClient.invalidateQueries({
          queryKey: ['waste-type-detail', params?.id],
        });

      toast.success({
        description: t(
          isEdit
            ? 'common:message.success.update'
            : 'common:message.success.create',
          {
            type: t('wasteHierarchy:title.waste_type')?.toLowerCase(),
          }
        ),
      });

      router.push(`/${language}/waste-hierarchy?tab=waste_type`);
    },
    onError: handleAxiosError,
  });
  const isIndo = language === 'id';
  const isEnglish = language === 'en';

  const onValid: SubmitHandler<WasteTypeFormData> = (formData) => {
    const commonPayload: BasePayload = {
      name: isIndo
        ? formData.waste_type
        : defaultValues?.data?.name ?? formData.waste_type,
      nameEn: isEnglish
        ? formData.waste_type
        : defaultValues?.data?.nameEn ?? formData.waste_type,
      description: isIndo
        ? formData.description
        : defaultValues?.data?.description ?? formData.description,
      descriptionEn: isEnglish
        ? formData.description
        : defaultValues?.data?.descriptionEn ?? formData.description,
      regionId: 1,
      ...(isEdit
        ? { updatedBy: user?.user_uuid }
        : { createdBy: user?.user_uuid }),
    };

    mutate(commonPayload);
  };

  const onInvalid = (errors: FieldErrors<WasteTypeFormData>) => {
    console.error('Validation Errors:', errors);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onValid, onInvalid)}>
        <div className="ui-w-full ui-space-y-6 ui-max-w-form ui-mx-auto">
          <WasteTypeFormInfo />
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

export default WasteTypeForm;

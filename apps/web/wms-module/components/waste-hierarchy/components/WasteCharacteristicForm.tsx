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

import { handleAxiosError } from '@/utils/handleAxiosError';
import { getUserStorage } from '@/utils/storage/user';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  WasteCharacteristicFormData,
  wasteCharacteristicFormSchema,
} from '../schema/WasteHierarchySchemaForm';
import WasteCharacteristicFormInfo from './Form/WasteCharacteristicFormInfo';

import {
  createWasteCharacteristic,
  updateWasteCharacteristic,
} from '@/services/waste-hierarchy';
import {
  CreateWasteCharacteristicInput,
  GetWasteCharacteristicDetailResponse,
  UpdateWasteCharacteristicInput,
} from '@/types/waste-hierarchy';
import { toast } from '@repo/ui/components/toast';
import { useParams } from 'next/navigation';
import { handleDefaultValueWasteCharacteristic } from '../utils/helper';

type WasteCharacteristicFormProps = {
  defaultValues?: GetWasteCharacteristicDetailResponse;
};

type BasePayload = {
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  regionId: number;
  level: number;
  parentHierarchyId: number;
  isResidue?: boolean;
  isActive?: boolean;
};

const WasteCharacteristicForm = ({
  defaultValues,
}: WasteCharacteristicFormProps) => {
  const router = useWmsRouter();
  const user = getUserStorage();
  const params = useParams();
  const queryClient = useQueryClient();

  const { t, i18n: locale } = useTranslation(['common', 'wasteHierarchy']);
  const language = locale.language;

  const isEdit = Boolean(params?.id);

  const methods = useForm<any>({
    resolver: yupResolver(wasteCharacteristicFormSchema(t) as any),
    mode: 'onBlur',
    defaultValues: handleDefaultValueWasteCharacteristic(defaultValues),
  });

  const { handleSubmit } = methods;

  const { mutate, isPending } = useMutation({
    mutationFn: (data: unknown) =>
      isEdit
        ? updateWasteCharacteristic(
            Number(params?.id),
            data as UpdateWasteCharacteristicInput
          )
        : createWasteCharacteristic(data as CreateWasteCharacteristicInput),
    onSuccess: () => {
      isEdit &&
        queryClient.invalidateQueries({
          queryKey: ['waste-characteristic-detail', params?.id],
        });

      toast.success({
        description: t(
          isEdit
            ? 'common:message.success.update'
            : 'common:message.success.create',
          {
            type: t('wasteHierarchy:title.waste_characteristic')?.toLowerCase(),
          }
        ),
      });

      router.push(`/${language}/waste-hierarchy?tab=waste_characteristic`);
    },
    onError: handleAxiosError,
  });

  const isIndo = language === 'id';
  const isEnglish = language === 'en';

  const onValid: SubmitHandler<WasteCharacteristicFormData> = (formData) => {
    const commonPayload: BasePayload = {
      name: isIndo
        ? formData.waste_characteristic
        : defaultValues?.data?.name ?? formData.waste_characteristic,
      nameEn: isEnglish
        ? formData.waste_characteristic
        : defaultValues?.data?.nameEn ?? formData.waste_characteristic,
      isResidue: false,
      description: isIndo
        ? formData.description
        : defaultValues?.data?.description ?? formData.description,
      descriptionEn: isEnglish
        ? formData.description
        : defaultValues?.data?.descriptionEn ?? formData.description,
      regionId: 1,
      level: 2,
      isActive: !!formData.is_active,
      parentHierarchyId: formData.waste_group?.value ?? 0,
      ...(isEdit
        ? { updatedBy: user?.user_uuid }
        : { createdBy: user?.user_uuid }),
    };

    mutate(commonPayload);
  };

  const onInvalid = (errors: FieldErrors<WasteCharacteristicFormData>) => {
    console.error('Validation Errors:', errors);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onValid, onInvalid)}>
        <div className="ui-w-full ui-space-y-6 ui-max-w-form ui-mx-auto">
          <WasteCharacteristicFormInfo />
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

export default WasteCharacteristicForm;

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

import { createWasteSource, updateWasteSource } from '@/services/waste-source';
import {
  CreateWasteSourceInput,
  GetWasteSourceDetailResponse,
  UpdateWasteSourceInput,
} from '@/types/waste-source';
import { getUserStorage } from '@/utils/storage/user';
import { toast } from '@repo/ui/components/toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import {
  WasteSourceFormData,
  wasteSourceFormSchema,
} from '../schema/WasteSourceSchemaForm';
import { handleDefaultValueWasteSource } from '../utils/helper';
import WasteSourceFormInfo from './Form/WasteSourceFormInfo';

type WasteSourceFormProps = {
  defaultValues?: GetWasteSourceDetailResponse;
};

type BasePayload = {
  sourceType: string;
  isActive: boolean;
  createdBy?: string;
  updatedBy?: string;
  internalSourceName?: string;
  internalTreatmentName?: string;
  externalHealthcareFacilityId?: number | null;
  externalHealthcareFacilityName?: string;
};

const WasteSourceForm = ({ defaultValues }: WasteSourceFormProps) => {
  const router = useWmsRouter();
  const user = getUserStorage();
  const params = useParams();
  const queryClient = useQueryClient();

  const { t, i18n: locale } = useTranslation(['common', 'wasteSource']);
  const language = locale.language;

  const isEdit = Boolean(params?.id);

  const methods = useForm<any>({
    resolver: yupResolver(wasteSourceFormSchema(t) as any),
    mode: 'onBlur',
    defaultValues: handleDefaultValueWasteSource(defaultValues),
  });

  const { handleSubmit } = methods;

  const { mutate, isPending } = useMutation({
    mutationFn: (data: unknown) =>
      isEdit
        ? updateWasteSource(Number(params?.id), data as UpdateWasteSourceInput)
        : createWasteSource(data as CreateWasteSourceInput),
    onSuccess: () => {
      isEdit &&
        queryClient.invalidateQueries({
          queryKey: ['waste-source-detail', params?.id],
        });

      toast.success({
        description: t(
          isEdit
            ? 'common:message.success.update'
            : 'common:message.success.create',
          {
            type: t('wasteSource:title.waste_source')?.toLowerCase(),
          }
        ),
      });

      router.push(`/${language}/waste-source`);
    },
    onError: handleAxiosError,
  });

  const onValid: SubmitHandler<WasteSourceFormData> = (formData) => {
    const commonPayload: BasePayload = {
      sourceType: formData.sourceType,
      isActive: true,
      ...(isEdit
        ? { updatedBy: user?.user_uuid }
        : { createdBy: user?.user_uuid }),
    };

    if (formData.sourceType === 'INTERNAL') {
      commonPayload.internalSourceName = formData.internalSourceName;
    } else if (formData.sourceType === 'INTERNAL_TREATMENT') {
      commonPayload.internalTreatmentName = formData.internalTreatmentName;
    } else if (formData.sourceType === 'EXTERNAL') {
      commonPayload.externalHealthcareFacilityId =
        formData?.externalHealthcareFacility?.value;
      commonPayload.externalHealthcareFacilityName =
        formData?.externalHealthcareFacility?.label;
    }

    mutate(commonPayload);
  };

  const onInvalid = (errors: FieldErrors<WasteSourceFormData>) => {
    console.error('Validation Errors:', errors);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onValid, onInvalid)}>
        <div className="ui-w-full ui-space-y-6 ui-max-w-form ui-mx-auto">
          <WasteSourceFormInfo isEdit={isEdit} />
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

export default WasteSourceForm;

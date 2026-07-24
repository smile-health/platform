'use client';

import useWmsRouter from '@/utils/hooks/useWmsRouter';
import { getUserStorage } from '@/utils/storage/user';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@repo/ui/components/button';
import { toast } from '@repo/ui/components/toast';
import { useTranslation } from 'react-i18next';

import { createPartnership, updatePartnership } from '@/services/partnership';
import {
  ConsumerType,
  CreatePartnershipInput,
  TPartnership,
  UpdatePartnershipInput,
} from '@/types/partnership';
import { handleAxiosError } from '@/utils/handleAxiosError';
import { useMutation } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useParams } from 'next/navigation';
import {
  FieldErrors,
  FormProvider,
  SubmitHandler,
  useForm,
} from 'react-hook-form';
import {
  PartnershipFormData,
  partnershipFormSchema,
} from '../schema/PartnershipSchemaForm';
import { handleDefaultValuePartnership } from '../utils/helper';
import PartnershipFormInfo from './Form/PartnershipFormInfo';

type PartnershipFormProps = {
  defaultValues?: TPartnership;
};

const PartnershipForm = ({ defaultValues }: PartnershipFormProps) => {
  const router = useWmsRouter();
  const user = getUserStorage();

  const params = useParams();
  const { t, i18n: locale } = useTranslation(['common', 'partnership']);
  const language = locale.language;

  const isEdit = Boolean(params?.id);

  const methods = useForm<any>({
    resolver: yupResolver(partnershipFormSchema(t) as any),
    mode: 'onBlur',
    defaultValues: handleDefaultValuePartnership(defaultValues),
    context: { isEdit },
  });

  const { handleSubmit } = methods;

  const { mutate, isPending } = useMutation({
    mutationFn: (data: unknown) =>
      isEdit
        ? updatePartnership(Number(params?.id), data as UpdatePartnershipInput)
        : createPartnership(data as CreatePartnershipInput),
    onSuccess: () => {
      toast.success({
        description: t(
          isEdit
            ? 'common:message.success.update'
            : 'common:message.success.create',
          {
            type: t('partnership:list.list')?.toLowerCase(),
          }
        ),
      });
      router.push(`/${language}/partnership`);
    },
    onError: handleAxiosError,
  });

  const onValid: SubmitHandler<PartnershipFormData> = (formData) => {
    const commonPayload = {
      ...(isEdit
        ? { updatedBy: user?.user_uuid }
        : { createdBy: user?.user_uuid }),
      consumerId: user?.entity_id,
      consumerType: ConsumerType.HEALTHCARE_FACILITY,
      providerId: formData?.entity?.value,
      providerType: formData?.providerType,
      partnershipStatus: formData.partnershipStatus,
      picName: formData.picName,
      picPhoneNumber: formData.picPhoneNumber,
      picPosition: formData.picPosition,
      contractStartDate: dayjs(formData.contractDate?.start).format(
        'YYYY-MM-DD'
      ),
      contractEndDate: dayjs(formData.contractDate?.end).format('YYYY-MM-DD'),
      contractId: formData.contractId,
      hasIncinerator: false,
      hasAutoclave: false,
    };

    // For Create
    if (!isEdit) {
      mutate({
        ...commonPayload,
        wasteClassification: formData?.wasteClassification?.map((spec) => ({
          wasteClassificationId: Number(spec.classification),
          price: Number(spec.pricePerKg),
        })),
      });
    }
    // For Edit
    else {
      mutate({
        ...commonPayload,
        wasteClassificationId: Number(formData.wasteClassificationId),
        pricePerKg: Number(formData.pricePerKg),
      });
    }
  };

  const onInvalid = (errors: FieldErrors<PartnershipFormData>) => {
    console.error('Validation Errors:', errors);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onValid, onInvalid)}>
        <div className="ui-w-full ui-space-y-6 ui-max-w-[800px] ui-mx-auto">
          <PartnershipFormInfo />
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

export default PartnershipForm;

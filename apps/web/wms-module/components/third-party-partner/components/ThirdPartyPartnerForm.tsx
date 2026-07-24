'use client';

import { handleAxiosError } from '@/utils/handleAxiosError';
import useWmsRouter from '@/utils/hooks/useWmsRouter';
import { getUserStorage } from '@/utils/storage/user';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@repo/ui/components/button';
import { toast } from '@repo/ui/components/toast';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import { createPartnership, updatePartnership } from '@/services/partnership';
import {
  ConsumerType,
  CreatePartnershipInput,
  TPartnership,
  UpdatePartnershipInput,
} from '@/types/partnership';
import { useMutation } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import {
  FieldErrors,
  FormProvider,
  SubmitHandler,
  useForm,
} from 'react-hook-form';
import {
  ThirdPartyPartnerFormData,
  thirdPartyPartnerFormSchema,
} from '../schema/ThirdPartyPartnerSchemaForm';
import { handleDefaultValueThirdPartyPartner } from '../utils/helper';
import ThirdPartyPartnerFormInfo from './Form/ThirdPartyPartnerFormInfo';

type ThirdPartyPartnerFormProps = {
  defaultValues?: TPartnership;
};

const ThirdPartyPartnerForm = ({
  defaultValues,
}: ThirdPartyPartnerFormProps) => {
  const router = useWmsRouter();
  const user = getUserStorage();
  const params = useParams();
  const { t, i18n: locale } = useTranslation(['common', 'thirdPartyPartner']);
  const language = locale.language;

  const isEdit = Boolean(params?.id);

  const methods = useForm<any>({
    resolver: yupResolver(thirdPartyPartnerFormSchema(t) as any),
    mode: 'onBlur',
    defaultValues: handleDefaultValueThirdPartyPartner(defaultValues, isEdit),
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
            type: t('thirdPartyPartner:list.list')?.toLowerCase(),
          }
        ),
      });
      router.push(`/${language}/third-party-partner`);
    },
    onError: handleAxiosError,
  });

  const onValid: SubmitHandler<ThirdPartyPartnerFormData> = (formData) => {
    const isSameCompany = !!formData.isSameCompany;
    const commonPayload = {
      ...(isEdit
        ? { updatedBy: user?.user_uuid }
        : { createdBy: user?.user_uuid }),
      consumerId: formData?.healthcarePartner?.value,
      consumerType: ConsumerType.HEALTHCARE_FACILITY,
      providerId: isSameCompany
        ? user?.entity_id
        : formData?.thirdPartyPartner?.value,
      partnershipStatus: formData.partnershipStatus,
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
          wasteClassificationId: Number(spec.characteristicId),
          providerTypes: spec.providerType,
        })),
      });
    }
    // For Edit
    else {
      mutate({
        ...commonPayload,
        wasteClassificationId: formData.wasteClassificationId,
        providerType: formData?.providerType,
      });
    }
  };

  const onInvalid = (errors: FieldErrors<ThirdPartyPartnerFormData>) => {
    console.error('Validation Errors:', errors);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onValid, onInvalid)}>
        <div className="ui-w-full ui-space-y-6 max-w-[700px] ui-mx-auto">
          <ThirdPartyPartnerFormInfo />
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

export default ThirdPartyPartnerForm;

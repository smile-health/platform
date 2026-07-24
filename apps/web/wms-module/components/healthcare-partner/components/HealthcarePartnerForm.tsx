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
import { useParams } from 'next/navigation';
import {
  FieldErrors,
  FormProvider,
  SubmitHandler,
  useForm,
} from 'react-hook-form';
import {
  HealthcarePartnerFormData,
  thirdPartyPartnerFormSchema,
} from '../schema/HealthcarePartnerSchemaForm';
import { handleDefaultValueHealthcarePartner } from '../utils/helper';
import HealthcarePartnerDetail from './Form/HealthcarePartnerDetail';

type HealthcarePartnerFormProps = {
  defaultValues?: TPartnership;
};

const HealthcarePartnerForm = ({
  defaultValues,
}: HealthcarePartnerFormProps) => {
  const router = useWmsRouter();
  const user = getUserStorage();
  const params = useParams();
  const { t, i18n: locale } = useTranslation(['common', 'healthcarePartner']);

  const language = locale.language;

  const isEdit = Boolean(params?.id);

  const methods = useForm<any>({
    resolver: yupResolver(thirdPartyPartnerFormSchema(t) as any),
    mode: 'onBlur',
    defaultValues: handleDefaultValueHealthcarePartner(defaultValues),
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
            type: t('healthcarePartner:list.list')?.toLowerCase(),
          }
        ),
      });
      router.push(`/${language}/healthcare-partner`);
    },
    onError: handleAxiosError,
  });

  const onValid: SubmitHandler<HealthcarePartnerFormData> = (formData) => {
    const commonPayload = {
      ...(isEdit
        ? { updatedBy: user?.user_uuid }
        : { createdBy: user?.user_uuid }),
      consumerId: defaultValues?.consumerId,
      consumerType: ConsumerType.HEALTHCARE_FACILITY,
      providerId: user?.entity_id,
      providerType: defaultValues?.providerType,
      partnershipStatus: formData.partnershipStatus,
      picName: formData.picName,
      picPhoneNumber: formData.picPhoneNumber,
      picPosition: formData.picPosition,
      hasIncinerator: false,
      hasAutoclave: false,
    };
    mutate(commonPayload);
  };

  const onInvalid = (errors: FieldErrors<HealthcarePartnerFormData>) => {
    console.error('Validation Errors:', errors);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onValid, onInvalid)}>
        <div className="space-y-4">
          <div className="ui-p-4 ui-border ui-border-neutral-300 ui-rounded ui-space-y-4">
            <div className="ui-flex ui-justify-between ui-items-start ui-gap-4">
              <h5 className="ui-font-bold ui-text-dark-blue">
                {t('healthcarePartner:detail.healthcare_partner_info')}
              </h5>
            </div>
            <HealthcarePartnerDetail data={defaultValues} />
          </div>
        </div>
        <div className="ui-flex ui-mt-6 ui-justify-end">
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
      </form>
    </FormProvider>
  );
};

export default HealthcarePartnerForm;

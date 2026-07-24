'use client';

import useWmsRouter from '@/utils/hooks/useWmsRouter';
import { getUserStorage } from '@/utils/storage/user';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@repo/ui/components/button';
import { toast } from '@repo/ui/components/toast';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import { createHealthcare, updateHealthcare } from '@/services/healthcare';
import {
  CreateHealthcareInput,
  THealthcare,
  UpdateHealthcareInput,
} from '@/types/healthcare';
import { getUserRoleString, isFacilityAdmin } from '@/utils/getUserRole';
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
  HealthcareFormData,
  healthcareFormSchema,
} from '../schema/HealthcareSchemaForm';
import { handleDefaultValueHealthcare } from '../utils/helper';
import HealthcareFormInfo from './Form/HealthcareFormInfo';

type HealthcareFormProps = {
  defaultValues?: THealthcare;
};

const HealthcareForm = ({ defaultValues }: HealthcareFormProps) => {
  const router = useWmsRouter();
  const user = getUserStorage();
  const params = useParams();
  const { t, i18n: locale } = useTranslation(['common', 'healthCare']);

  const role = getUserRoleString();
  const language = locale.language;

  const isEdit = Boolean(params?.id);
  const methods = useForm<any>({
    resolver: yupResolver(healthcareFormSchema(t, role) as any),
    mode: 'onBlur',
    defaultValues: handleDefaultValueHealthcare(defaultValues),
  });

  const { handleSubmit } = methods;

  const { mutate, isPending } = useMutation({
    mutationFn: (data: unknown) =>
      isEdit
        ? updateHealthcare(Number(params?.id), data as UpdateHealthcareInput)
        : createHealthcare(data as CreateHealthcareInput),
    onSuccess: () => {
      toast.success({
        description: t(
          isEdit
            ? 'common:message.success.update'
            : 'common:message.success.create',
          {
            type: t('healthCare:list.list')?.toLowerCase(),
          }
        ),
      });
      router.push(`/${language}/healthcare`);
    },
    onError: handleAxiosError,
  });

  const onValid: SubmitHandler<HealthcareFormData> = (formData) => {
    const healthcareFacilityId = isFacilityAdmin()
      ? user?.entity_id
      : formData?.healthcare_facility?.value;
    const commonPayload = {
      ...(isEdit
        ? { updatedBy: user?.user_uuid }
        : { createdBy: user?.user_uuid }),
      healthcareFacilityId,
      modelId: formData?.model?.value,
      isIotEnable: formData.isIotEnable ? 1 : 0,
      assetId: formData.assetId,
      assetStatus: formData.assetStatus,
      yearOfProduction: formData.yearOfProduction,
      warrantyStartDate: dayjs(formData.warrantyStartDate).format('YYYY-MM-DD'),
      warrantyEndDate: dayjs(formData.warrantyEndDate).format('YYYY-MM-DD'),
    };
    mutate(commonPayload);
  };

  const onInvalid = (errors: FieldErrors<HealthcareFormData>) => {
    console.error('Validation Errors:', errors);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onValid, onInvalid)}>
        <div className="ui-w-full ui-space-y-6 ui-max-w-form ui-mx-auto">
          <HealthcareFormInfo />
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

export default HealthcareForm;

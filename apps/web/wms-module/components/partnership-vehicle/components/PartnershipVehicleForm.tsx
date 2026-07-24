'use client';

import { handleAxiosError } from '@/utils/handleAxiosError';
import useWmsRouter from '@/utils/hooks/useWmsRouter';
import { getUserStorage } from '@/utils/storage/user';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@repo/ui/components/button';
import { toast } from '@repo/ui/components/toast';
import { useTranslation } from 'react-i18next';

import {
  createBulkHealthcarePartnershipVehicle,
  getPartnershipVehicle,
  updatePartnershipVehicle,
} from '@/services/partnership-vehicle';
import {
  TPartnershipVehicle,
  UpdatePartnershipVehicleInput,
  BulkHealthcarePartnershipVehicleInput,
} from '@/types/partnership-vehicle';
import { useMutation } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import {
  FieldErrors,
  FormProvider,
  SubmitHandler,
  useForm,
} from 'react-hook-form';
import {
  PartnershipVehicleFormData,
  partnershipVehicleFormSchema,
} from '../schema/PartnershipVehicleSchemaForm';
import { handleDefaultValuePartnershipVehicle } from '../utils/helper';
import PartnershipVehicleFormInfo from './Form/PartnershipVehicleFormInfo';

type PartnershipVehicleFormProps = {
  defaultValues?: TPartnershipVehicle;
};

const PartnershipVehicleForm = ({
  defaultValues,
}: PartnershipVehicleFormProps) => {
  const router = useWmsRouter();
  const user = getUserStorage();

  const params = useParams();
  const { t, i18n: locale } = useTranslation(['common', 'partnershipVehicle']);
  const language = locale.language;

  const isEdit = Boolean(params?.id);

  const methods = useForm<any>({
    resolver: yupResolver(partnershipVehicleFormSchema(t, isEdit) as any),
    mode: 'onBlur',
    defaultValues: handleDefaultValuePartnershipVehicle(defaultValues, isEdit),
  });

  const {
    handleSubmit,
    setError,
    clearErrors,
    formState: { isSubmitting },
  } = methods;

  const { mutate, isPending } = useMutation({
    mutationFn: (data: unknown) =>
      isEdit
        ? updatePartnershipVehicle(
            Number(params?.id),
            data as UpdatePartnershipVehicleInput
          )
        : createBulkHealthcarePartnershipVehicle(
            data as BulkHealthcarePartnershipVehicleInput
          ),
    onSuccess: () => {
      toast.success({
        description: t(
          isEdit
            ? 'common:message.success.update'
            : 'common:message.success.create',
          {
            type: t('partnershipVehicle:list.list')?.toLowerCase(),
          }
        ),
      });
      router.push(`/${language}/partnership-vehicle`);
    },
    onError: handleAxiosError,
  });

  const onValid: SubmitHandler<PartnershipVehicleFormData> = async (
    formData
  ) => {
    clearErrors('vehicleNumber');

    const vehicleNumber = formData.vehicleNumber.trim();
    const normalized = vehicleNumber.toUpperCase();
    const currentId = isEdit ? Number(params?.id) : undefined;
    const entityIds = isEdit
      ? [Number((formData.entity as { value?: number }).value)]
      : (formData.entity as { value?: number }[]).map((e) => Number(e.value));

    // Vehicle number must be unique within each selected entity.
    try {
      const checks = await Promise.all(
        entityIds.map((entityId) =>
          getPartnershipVehicle({
            page: 1,
            limit: 100,
            healthcareFacilityId: entityId,
            search: vehicleNumber,
          }).then((res) =>
            (res?.data?.data ?? []).some(
              (v) =>
                v.vehicleNumber?.trim().toUpperCase() === normalized &&
                v.id !== currentId
            )
          )
        )
      );

      if (checks.some(Boolean)) {
        setError('vehicleNumber', {
          type: 'manual',
          message: t(
            'partnershipVehicle:form.vehicle_number.validation.duplicate'
          ),
        });
        return;
      }
    } catch {
      // Lookup failed (e.g. network) — don't block; the backend stays authoritative.
    }

    const basePayload = {
      capacityInKgs: Number(formData.capacityInKgs),
      vehicleNumber: vehicleNumber,
      vehicleType: formData.vehicleType,
    };

    if (isEdit) {
      const entity = formData.entity as { value?: number; label: string };
      const payload = {
        ...basePayload,
        updatedBy: user?.user_uuid,
        entityId: Number(entity.value),
      };
      mutate(payload);
    } else {
      const entities = formData.entity as { value?: number; label: string }[];
      const entityIds = entities.map((item) => item.value).join(',');
      const payload = {
        ...basePayload,
        createdBy: user?.user_uuid,
        entityIds,
      };
      mutate(payload);
    }
  };

  const onInvalid = (errors: FieldErrors<PartnershipVehicleFormData>) => {
    console.error('Validation Errors:', errors);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onValid, onInvalid)}>
        <div className="ui-w-full ui-space-y-6 ui-max-w-form ui-mx-auto">
          <PartnershipVehicleFormInfo />
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
              <Button
                id="btn-submit"
                type="submit"
                loading={isPending || isSubmitting}
              >
                {t('common:save')}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default PartnershipVehicleForm;

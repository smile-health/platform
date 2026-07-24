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
  createWasteSpecification,
  updateWasteSpecification,
} from '@/services/waste-specification';
import {
  CreateWasteSpecificationInput,
  GetWasteSpecificationDetailResponse,
  UpdateWasteSpecificationInput,
} from '@/types/waste-specification';
import { getUserStorage } from '@/utils/storage/user';
import { toast } from '@repo/ui/components/toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import {
  WasteSpecificationFormData,
  wasteSpecificationFormSchema,
} from '../schema/WasteSpecificationSchemaForm';
import { handleDefaultValueWasteSpecification } from '../utils/helper';
import { DEFAULT_VALUE } from '../utils/wasteSpecification.contants';
import WasteSpecificationFormInfo from './Form/WasteSpecificationFormInfo';

type WasteSpecificationFormProps = {
  defaultValues?: GetWasteSpecificationDetailResponse;
};

type BasePayload = {
  wasteTypeId: number;
  wasteGroupId: number;
  wasteCharacteristicsId: number;
  wasteCode: string;
  wasteBagColorCode: string;
  storageRuleType: string;
  useColdStorage: number;
  hasMultipleTransporters: number;
  coldStorageMaxHours?: number;
  tempStorageMaxHours: number;
  storageRule: string;
  allowHealthcareFacilityTreatment: number;
  treatmentMethod?: string;
  disposalMethod: string;
  allowedVehicleTypes?: string;
  minimunDecayDay?: number;
  updatedBy?: string;
  createdBy?: string;
};

const WasteSpecificationForm = ({
  defaultValues,
}: WasteSpecificationFormProps) => {
  const router = useWmsRouter();
  const user = getUserStorage();
  const params = useParams();
  const queryClient = useQueryClient();

  const { t, i18n: locale } = useTranslation(['common', 'wasteSpecification']);
  const language = locale.language;

  const isEdit = Boolean(params?.id);

  const methods = useForm<any>({
    resolver: yupResolver(wasteSpecificationFormSchema(t) as any),
    mode: 'onBlur',
    defaultValues: handleDefaultValueWasteSpecification(defaultValues),
  });

  const { handleSubmit } = methods;

  const { mutate, isPending } = useMutation({
    mutationFn: (data: unknown) =>
      isEdit
        ? updateWasteSpecification(
            Number(params?.id),
            data as UpdateWasteSpecificationInput
          )
        : createWasteSpecification(data as CreateWasteSpecificationInput),
    onSuccess: () => {
      isEdit &&
        queryClient.invalidateQueries({
          queryKey: ['waste-specification-detail', params?.id],
        });

      toast.success({
        description: t(
          isEdit
            ? 'common:message.success.update'
            : 'common:message.success.create',
          {
            type: t(
              'wasteSpecification:title.waste_specification'
            )?.toLowerCase(),
          }
        ),
      });

      router.push(`/${language}/waste-specification`);
    },
    onError: handleAxiosError,
  });

  const onValid: SubmitHandler<WasteSpecificationFormData> = (formData) => {
    const coldStorageMaxHours =
      Number(formData.coldStorageMaxProcessingTime) * 24;

    const tempStorageMaxHours =
      Number(formData.temporaryStorageMaxProcessingTime) * 24;

    const commonPayload: BasePayload = {
      wasteTypeId: formData.wasteTypeId,
      wasteGroupId: formData.wasteGroupId,
      wasteCharacteristicsId: formData.wasteCharacteristicsId,
      wasteCode: formData.wasteCode,
      wasteBagColorCode: formData.wasteBagColor,
      storageRuleType: 'STATIC',
      useColdStorage: Number(formData.useColdStorage),
      hasMultipleTransporters: Number(formData.hasMultipleTransporters),
      tempStorageMaxHours,
      storageRule: '',
      allowHealthcareFacilityTreatment: 1,
      disposalMethod: formData.wasteExternalTreatment ?? undefined,
      ...(formData.wasteCharacteristicsId === 54 && {
        minimunDecayDay: formData.minimunDecayDay,
      }),
      ...(isEdit
        ? { updatedBy: user?.user_uuid }
        : { createdBy: user?.user_uuid }),
    };

    if (Number(formData.useColdStorage) === DEFAULT_VALUE.YES) {
      commonPayload.coldStorageMaxHours = coldStorageMaxHours;
    }

    if (formData.vehicleType) {
      commonPayload.allowedVehicleTypes = formData.vehicleType;
    }

    if (formData.wasteInternalTreatment) {
      commonPayload.treatmentMethod = formData.wasteInternalTreatment;
    }

    mutate(commonPayload);
  };

  const onInvalid = (errors: FieldErrors<WasteSpecificationFormData>) => {
    console.error('Validation Errors:', errors);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onValid, onInvalid)}>
        <div className="ui-w-full ui-space-y-6 ui-max-w-form ui-mx-auto">
          <WasteSpecificationFormInfo isEdit={isEdit} />
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

export default WasteSpecificationForm;

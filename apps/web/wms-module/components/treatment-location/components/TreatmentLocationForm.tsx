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

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useParams } from 'next/navigation';
import {
  TreatmentLocationFormData,
  treatmentLocationFormSchema,
} from '../schema/TreatmentLocationFormSchema';
import TreatmentLocationFormInfo from './Form/TreatmentLocationFormInfo';

import {
  createEntityLocation,
  updateEntityLocation,
} from '@/services/entity-location';
import { getGlobalEntitySettings } from '@/services/global-settings';
import { ErrorResponse } from '@/types/common';
import {
  CreateEntityLocationInput,
  GetEntityLocationResponse,
  UpdateEntityLocationInput,
} from '@/types/entity-location';
import { GetEntitySettingsResponse } from '@/types/entity-settings';
import { handleAxiosError } from '@/utils/handleAxiosError';
import { getUserStorage } from '@/utils/storage/user';
import { toast } from '@repo/ui/components/toast';
import { handleDefaultValue } from '../utils/helper';

type TreatmentLocationFormProps = {
  defaultValues?: GetEntityLocationResponse;
};

type BasePayload = {
  createdBy?: string;
  updatedBy?: string;
  entityId?: number;
  locationName: string;
  latitude: number;
  longitude: number;
  distanceLimitInMeters?: number;
  address?: string;
  provinceId?: number;
  provinceName?: string;
  cityId?: number;
  cityName?: string;
};

const TreatmentLocationForm = ({
  defaultValues,
}: TreatmentLocationFormProps) => {
  const router = useWmsRouter();
  const params = useParams();
  const user = getUserStorage();
  const queryClient = useQueryClient();

  const { t } = useTranslation(['common', 'treatmentLocation']);

  const isEdit = Boolean(params?.id);

  const { i18n: locale } = useTranslation();
  const language = locale.language;

  const methods = useForm<any>({
    resolver: yupResolver(treatmentLocationFormSchema(t) as any),
    mode: 'onBlur',
    defaultValues: handleDefaultValue(defaultValues),
  });

  const { data: dataEntitySettings } = useQuery<
    GetEntitySettingsResponse,
    AxiosError<ErrorResponse>
  >({
    queryKey: ['entity-settings'],
    queryFn: () =>
      getGlobalEntitySettings({
        search: 'distance_limit',
        page: 1,
        limit: 1,
      }),
  });

  const { handleSubmit } = methods;

  const { mutate, isPending } = useMutation({
    mutationFn: (data: unknown) =>
      isEdit
        ? updateEntityLocation(
            Number(params?.id),
            data as UpdateEntityLocationInput
          )
        : createEntityLocation(data as CreateEntityLocationInput),
    onSuccess: () => {
      isEdit &&
        queryClient.invalidateQueries({
          queryKey: ['treatment-location-detail', params?.id],
        });

      toast.success({
        description: t(
          isEdit
            ? 'common:message.success.update'
            : 'common:message.success.create',
          {
            type: t('treatmentLocation:list.list')?.toLowerCase(),
          }
        ),
      });

      router.push(`/${language}/treatment-location`);
    },
    onError: handleAxiosError,
  });

  const onValid: SubmitHandler<TreatmentLocationFormData> = (formData) => {
    const commonPayload: BasePayload = {
      locationName: formData.locationName,
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
      distanceLimitInMeters: Number(
        dataEntitySettings?.data?.data?.[0]?.settingValue ?? '0'
      ),
      ...(isEdit
        ? { updatedBy: user?.user_uuid }
        : { createdBy: user?.user_uuid }),
    };

    if (formData.distanceLimitInMeters) {
      commonPayload.distanceLimitInMeters = formData.distanceLimitInMeters;
    }

    if (formData.province) {
      commonPayload.provinceId = formData.province.value;
      commonPayload.provinceName = formData.province.label;
    }

    if (formData.city) {
      commonPayload.cityId = formData.city.value;
      commonPayload.cityName = formData.city.label;
    }

    if (formData.address) {
      commonPayload.address = formData.address;
    }

    mutate(commonPayload);
  };

  const onInvalid = (errors: FieldErrors<TreatmentLocationFormData>) => {
    console.error('Validation Errors:', errors);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onValid, onInvalid)}>
        <div className="ui-w-full ui-space-y-6 ui-max-w-form ui-mx-auto">
          <TreatmentLocationFormInfo />
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

export default TreatmentLocationForm;

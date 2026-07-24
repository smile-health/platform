'use client';

import AppLayout from '@/components/layouts/AppLayout/AppLayout';
import Meta from '@/components/layouts/Meta';
import { ErrorResponse } from '@/types/common';
import { yupResolver } from '@hookform/resolvers/yup';
import { generateMetaTitle } from '@repo/ui/utils/strings';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  FieldErrors,
  FormProvider,
  SubmitHandler,
  useForm,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  getEntityLocationDetail,
  updateEntityLocation,
} from '@/services/entity-location';
import {
  GetEntityLocationResponse,
  UpdateEntityLocationInput,
} from '@/types/entity-location';
import { handleAxiosError } from '@/utils/handleAxiosError';
import { usePermission } from '@/utils/permission';
import { getUserStorage } from '@/utils/storage/user';
import { Spinner } from '@repo/ui/components/spinner';
import { toast } from '@repo/ui/components/toast';
import Error403Page from '../error/Error403Page';
import Error404Page from '../error/Error404Page';
import HealthcareStorageLocationFormInfo from './components/Form/HealthcareStorageLocationFormInfo';
import {
  healthcareStorageLocationSchemaForm,
  HealthcareStorageLocationSchemaFormData,
} from './schema/HealthcareStorageLocationSchemaForm';

const HealthcareStorageLocationEditPage = (): JSX.Element => {
  usePermission('healthcare-storage-location-mutate');
  const { t } = useTranslation(['common', 'healthcareStorageLocation']);

  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = getUserStorage();

  const { data, isLoading, error } = useQuery<
    GetEntityLocationResponse,
    AxiosError<ErrorResponse>
  >({
    queryKey: ['entity-location-detail', params?.id],
    queryFn: () => getEntityLocationDetail(Number(params?.id)),
    enabled: Boolean(params?.id),
  });

  const methods = useForm<HealthcareStorageLocationSchemaFormData>({
    resolver: yupResolver(healthcareStorageLocationSchemaForm(t) as any),
    mode: 'onBlur',
    defaultValues: {
      locationName: '',
      latitude: '',
      longitude: '',
      distanceLimitInMeters: undefined,
      address: '',
      province: null,
      city: null,
    },
  });

  const { handleSubmit, reset } = methods;

  const { mutate, isPending } = useMutation({
    mutationFn: (data: UpdateEntityLocationInput) =>
      updateEntityLocation(Number(params?.id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['entity-location-detail', params?.id],
      });

      toast.success({
        description: t('common:message.success.update', {
          type: t('healthcareStorageLocation:index.title')?.toLowerCase(),
        }),
      });

      router.back();
    },
    onError: handleAxiosError,
  });

  const onValid: SubmitHandler<HealthcareStorageLocationSchemaFormData> = (
    formData
  ) => {
    const payload: UpdateEntityLocationInput = {
      locationName: formData.locationName,
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
      distanceLimitInMeters: formData.distanceLimitInMeters || 0,
      address: formData.address || '',
      provinceId: formData.province?.value ?? 0,
      provinceName: formData.province?.label ?? '',
      cityId: formData.city?.value ?? 0,
      cityName: formData.city?.label ?? '',
      updatedBy: user?.user_uuid || '',
    };

    mutate(payload);
  };

  const onInvalid = (
    errors: FieldErrors<HealthcareStorageLocationSchemaFormData>
  ) => {
    console.error('Validation Errors:', errors);
  };

  useEffect(() => {
    if (data?.data) {
      const defaultValues = {
        locationName: data.data.locationName || '',
        latitude: data.data.latitude?.toString() || '',
        longitude: data.data.longitude?.toString() || '',
        distanceLimitInMeters: data.data.distanceLimitInMeters || undefined,
        address: data.data.address || '',
        province: data.data.provinceId
          ? {
              label: data.data.provinceName || '',
              value: data.data.provinceId,
            }
          : null,
        city: data.data.cityId
          ? {
              label: data.data.cityName || '',
              value: data.data.cityId,
            }
          : null,
      };
      reset(defaultValues);
    }
  }, [data, reset]);

  if (error?.response?.status === 403) return <Error403Page />;
  if (error?.response?.status === 404) return <Error404Page />;
  if (error?.response?.status === 422) return <Error404Page />;

  return (
    <AppLayout title={t('healthcareStorageLocation:index.edit')}>
      <Meta
        title={generateMetaTitle('Healthcare Storage Location', true, true)}
      />
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onValid, onInvalid)}>
          <div className="mt-6 space-y-6">
            {isLoading ? (
              <div className="ui-w-full ui-flex ui-items-center ui-justify-center ui-my-20">
                <Spinner className="ui-h-8 ui-w-8" />
              </div>
            ) : (
              <HealthcareStorageLocationFormInfo
                isEditMode={true}
                isFound={true}
                isLoading={isPending}
                setIsEditMode={() => router.back()}
                entityLocation={data?.data}
              />
            )}
          </div>
        </form>
      </FormProvider>
    </AppLayout>
  );
};

export default HealthcareStorageLocationEditPage;

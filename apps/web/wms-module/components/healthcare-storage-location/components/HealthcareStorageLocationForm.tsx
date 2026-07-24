'use client';

import { handleAxiosError } from '@/utils/handleAxiosError';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  FieldErrors,
  FormProvider,
  SubmitHandler,
  useForm,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  createEntityLocation,
  getEntityLocation,
  updateEntityLocation,
} from '@/services/entity-location';
import { ErrorResponse } from '@/types/common';
import {
  CreateEntityLocationInput,
  GetEntityStorageLocationResponse,
  UpdateEntityLocationInput,
} from '@/types/entity-location';
import { getUserStorage } from '@/utils/storage/user';
import { Spinner } from '@repo/ui/components/spinner';
import { toast } from '@repo/ui/components/toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import React from 'react';
import {
  healthcareStorageLocationSchemaForm,
  HealthcareStorageLocationSchemaFormData,
} from '../schema/HealthcareStorageLocationSchemaForm';
import { handleDefaultValueEntityLocation } from '../utils/helper';
import HealthcareStorageLocationFormInfo from './Form/HealthcareStorageLocationFormInfo';

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

const HealthcareStorageLocationForm = () => {
  const [isEditMode, setIsEditMode] = React.useState<boolean>(false);
  const { t } = useTranslation(['common', 'healthcareStorageLocation']);

  const queryClient = useQueryClient();
  const user = getUserStorage();

  const { data: dataEntityLocation, isLoading: isLoadingEntitySettings } =
    useQuery<GetEntityStorageLocationResponse, AxiosError<ErrorResponse>>({
      queryKey: ['entity-location'],
      queryFn: () => getEntityLocation(),
    });

  const isEdit = !!dataEntityLocation?.data[0];

  const methods = useForm<any>({
    resolver: yupResolver(healthcareStorageLocationSchemaForm(t) as any),
    mode: 'onBlur',
    defaultValues: {
      locationName: '',
      latitude: '',
      longitude: '',
      distanceLimitInMeters: '',
      address: '',
      provinceId: '',
      cityId: '',
    },
  });

  const { handleSubmit, reset } = methods;

  const { mutate, isPending } = useMutation({
    mutationFn: (data: unknown) =>
      isEdit
        ? updateEntityLocation(
            dataEntityLocation.data[0].id,
            data as UpdateEntityLocationInput
          )
        : createEntityLocation(data as CreateEntityLocationInput),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['entity-location'],
      });

      setIsEditMode(false);

      toast.success({
        description: t(
          isEdit
            ? 'common:message.success.update'
            : 'common:message.success.create',
          {
            type: t('healthcareStorageLocation:index.title')?.toLowerCase(),
          }
        ),
      });
    },
    onError: handleAxiosError,
  });

  const onValid: SubmitHandler<HealthcareStorageLocationSchemaFormData> = (
    formData
  ) => {
    const commonPayload: BasePayload = {
      locationName: formData.locationName,
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
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

  const onInvalid = (
    errors: FieldErrors<HealthcareStorageLocationSchemaFormData>
  ) => {
    console.error('Validation Errors:', errors);
  };

  React.useEffect(() => {
    if (dataEntityLocation?.data) {
      reset(handleDefaultValueEntityLocation(dataEntityLocation));
    }
  }, [dataEntityLocation, reset]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onValid, onInvalid)}>
        <div className="ui-w-full">
          {isLoadingEntitySettings ? (
            <div className="ui-w-full ui-flex ui-items-center ui-justify-center ui-my-20">
              <Spinner className="ui-h-8 ui-w-8" />
            </div>
          ) : (
            <HealthcareStorageLocationFormInfo
              entityLocation={dataEntityLocation?.data[0]}
              isFound={isEdit}
              isLoading={isPending}
              isEditMode={isEditMode}
              setIsEditMode={(value) => setIsEditMode(value)}
            />
          )}
        </div>
      </form>
    </FormProvider>
  );
};

export default HealthcareStorageLocationForm;

'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import {
  FieldErrors,
  FormProvider,
  SubmitHandler,
  useForm,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  createEntitySettings,
  getEntitySettings,
  updateEntitySettings,
} from '@/services/entity-settings';
import {
  createGlobalEntitySettings,
  getGlobalEntitySettings,
  updateGlobalEntitySettings,
} from '@/services/global-settings';
import {
  CreateEntitySettingsInput,
  UpdateEntitySettingsInput,
} from '@/types/entity-settings';
import { isSuperAdmin } from '@/utils/getUserRole';
import { handleAxiosError } from '@/utils/handleAxiosError';
import { getUserStorage } from '@/utils/storage/user';
import { Spinner } from '@repo/ui/components/spinner';
import { toast } from '@repo/ui/components/toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import {
  distanceSchemaForm,
  DistanceSchemaFormData,
} from '../schema/DistanceSchemaForm';
import { handleDefaultValueEntitySettings } from '../utils/helper';
import DistanceFormInfo from './Form/DistanceFormInfo';

type BasePayload = {
  createdBy?: string;
  updatedBy?: string;
  entityId?: number;
  settingName: string;
  settingValue: string;
};

const DistanceForm = () => {
  const [isEditMode, setIsEditMode] = React.useState<boolean>(false);
  const { t } = useTranslation(['common', 'distance']);

  const queryClient = useQueryClient();
  const user = getUserStorage();

  const { data: dataEntitySettings, isLoading: isLoadingEntitySettings } =
    useQuery({
      queryKey: ['entity-settings'],
      queryFn: async () => {
        const commonParams = {
          search: 'distance_limit',
          page: 1,
          limit: 1,
        };

        const global = await getGlobalEntitySettings(commonParams);

        if (isSuperAdmin()) {
          return { global, local: null };
        } else {
          const local = await getEntitySettings(commonParams);
          return { global, local };
        }
      },
    });

  const distanceDataLocal = React.useMemo(
    () => dataEntitySettings?.local?.data?.data ?? [],
    [dataEntitySettings?.local?.data?.data]
  );

  const distanceDataGlobal = React.useMemo(
    () => dataEntitySettings?.global?.data?.data ?? [],
    [dataEntitySettings?.global?.data?.data]
  );

  const minDistance = isSuperAdmin()
    ? 1
    : Number(distanceDataGlobal?.[0]?.settingValue ?? 0);

  const isEdit = !!distanceDataLocal.length || !!distanceDataGlobal.length;

  const methods = useForm<any>({
    resolver: yupResolver(distanceSchemaForm(t, minDistance) as any),
    mode: 'onBlur',
    defaultValues: {
      distance_limit: '',
    },
  });

  const { handleSubmit, reset } = methods;

  const { mutate, isPending } = useMutation({
    mutationFn: (data: unknown) => {
      if (isSuperAdmin()) {
        if (isEdit && distanceDataGlobal[0]) {
          return updateGlobalEntitySettings(
            distanceDataGlobal[0].id,
            data as UpdateEntitySettingsInput
          );
        } else {
          return createGlobalEntitySettings(data as CreateEntitySettingsInput);
        }
      } else {
        if (isEdit && distanceDataLocal[0]) {
          return updateEntitySettings(
            distanceDataLocal[0].id,
            data as UpdateEntitySettingsInput
          );
        } else {
          return createEntitySettings(data as CreateEntitySettingsInput);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['entity-settings'],
      });

      setIsEditMode(false);

      toast.success({
        description: t(
          isEdit
            ? 'common:message.success.update'
            : 'common:message.success.create',
          {
            type: t('distance:index.title')?.toLowerCase(),
          }
        ),
      });
    },
    onError: handleAxiosError,
  });

  const onValid: SubmitHandler<DistanceSchemaFormData> = (formData) => {
    const commonPayload: BasePayload = {
      settingName: 'distance_limit',
      settingValue: String(formData.distance_limit),
      updatedBy: user?.user_uuid,
      createdBy: user?.user_uuid,
    };

    mutate(commonPayload);
  };

  const onInvalid = (errors: FieldErrors<DistanceSchemaFormData>) => {
    console.error('Validation Errors:', errors);
  };

  React.useEffect(() => {
    const source = distanceDataLocal[0] ?? distanceDataGlobal[0];
    if (source) {
      reset(handleDefaultValueEntitySettings(source));
    }
  }, [distanceDataLocal, distanceDataGlobal, reset]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onValid, onInvalid)}>
        <div className="ui-w-full">
          {isLoadingEntitySettings ? (
            <div className="ui-w-full ui-flex ui-items-center ui-justify-center ui-my-20">
              <Spinner className="ui-h-8 ui-w-8" />
            </div>
          ) : (
            <DistanceFormInfo
              entitySettings={distanceDataLocal[0] ?? distanceDataGlobal[0]}
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

export default DistanceForm;

'use client';

import useWmsRouter from '@/utils/hooks/useWmsRouter';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@repo/ui/components/button';
import { toast } from '@repo/ui/components/toast';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { createHFAssetActivity } from '@/services/hf-asset-activity';
import {
  ActivityType,
  HFAssetActivityPayload,
} from '@/types/hf-asset-activity';
import { useMutation } from '@tanstack/react-query';
import { useParams } from 'next/navigation';

import { handleAxiosError } from '@/utils/handleAxiosError';
import {
  FieldErrors,
  FormProvider,
  SubmitHandler,
  useForm,
} from 'react-hook-form';
import { allowedActivity } from '../constants/assetHealthcare';
import {
  AssetActivityFormData,
  assetActivitySchemaForm,
} from '../schema/HFAssetActivitySchemaForm';
import HFAssetActivityFormInfo from './Form/HFAssetActivityFormInfo';

type HFHealthcareFormProps = {
  activityType: ActivityType;
};

const HFAssetActivityForm = ({ activityType }: HFHealthcareFormProps) => {
  const router = useWmsRouter();
  const params = useParams();
  const id = params?.id;
  const { t, i18n: locale } = useTranslation(['common', 'healthCare']);
  const language = locale.language;
  const methods = useForm<AssetActivityFormData>({
    resolver: yupResolver(assetActivitySchemaForm(t, activityType) as any),
    mode: 'onBlur',
  });
  const { handleSubmit } = methods;
  const destinationUrl = `/${language}/healthcare/${id}`;
  const succesLabel =
    {
      [ActivityType.CALIBRATION]: t(
        'healthCare:title_asset_activity.calibration'
      ),
      [ActivityType.MAINTENANCE]: t(
        'healthCare:title_asset_activity.maintenance'
      ),
    }[activityType] || t('healthCare:title_asset_activity.calibration');

  const { mutate, isPending } = useMutation({
    mutationFn: (data: unknown) =>
      createHFAssetActivity(data as HFAssetActivityPayload),
    onSuccess: () => {
      toast.success({
        description: t('common:message.success.create', {
          type: succesLabel?.toLowerCase(),
        }),
      });
      router.push(destinationUrl);
    },
    onError: handleAxiosError,
  });

  const onValid: SubmitHandler<AssetActivityFormData> = (formData) => {
    const commonPayload = {
      hfAssetId: Number(id),
      operatorId: formData.operatorId,
      activityType: activityType,
      createdAt: dayjs(formData.startDate).format('YYYY-MM-DD'),
      startDate: dayjs(formData.startDate).format('YYYY-MM-DD'),
      ...(activityType === ActivityType.CALIBRATION && {
        endDate: dayjs(formData.endDate).format('YYYY-MM-DD'),
      }),
    };
    mutate(commonPayload);
  };

  const onInvalid = (errors: FieldErrors<AssetActivityFormData>) => {
    console.error('Validation Errors:', errors);
  };

  const isValidActivity =
    activityType && allowedActivity.includes(activityType);

  useEffect(() => {
    if (!isValidActivity) {
      router.replace(destinationUrl);
    }
  }, [isValidActivity, destinationUrl, router]);

  if (!isValidActivity) {
    return null;
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onValid, onInvalid)}>
        <div className="ui-w-full ui-space-y-6 ui-max-w-form ui-mx-auto">
          <HFAssetActivityFormInfo activityType={activityType} />
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

export default HFAssetActivityForm;

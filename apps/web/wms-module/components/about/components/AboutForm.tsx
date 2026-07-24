'use client';

import useWmsRouter from '@/utils/hooks/useWmsRouter';
import { yupResolver } from '@hookform/resolvers/yup';
import { Alert } from '@repo/ui/components/alert';
import { Button } from '@repo/ui/components/button';
import {
  FieldErrors,
  FormProvider,
  SubmitHandler,
  useForm,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useMutation } from '@tanstack/react-query';
import { AboutFormData, aboutFormSchema } from '../schema/AboutSchemaForm';
import AboutFormInfo from './Form/AboutFormInfo';

import { updateEntity } from '@/services/entity';
import { TEntitiesWms, UpdateEntityInput } from '@/types/entity';
import { handleAxiosError } from '@/utils/handleAxiosError';
import { toast } from '@repo/ui/components/toast';
import { handleDefaultValue } from '../utils/helper';

type AssetTypeFormProps = {
  defaultValues?: TEntitiesWms;
};

type BasePayload = {
  gender?: number;
  email?: string;
  mobile_phone?: string | null;
  nib?: string;
  head_name?: string;
  total_bad_room?: number | null;
  percentage_bad_room?: number | null;
};

const AboutForm = ({ defaultValues }: AssetTypeFormProps) => {
  const router = useWmsRouter();

  const { t } = useTranslation(['common', 'about']);

  const { i18n: locale } = useTranslation();
  const language = locale.language;

  const methods = useForm<AboutFormData>({
    resolver: yupResolver(aboutFormSchema(t) as any),
    mode: 'onBlur',
    defaultValues: handleDefaultValue(defaultValues),
  });

  const { handleSubmit } = methods;

  const { mutate, isPending } = useMutation({
    mutationFn: (data: unknown) => updateEntity(data as UpdateEntityInput),
    onSuccess: () => {
      toast.success({
        description: t('common:message.success.update', {
          type: t('about:title.list')?.toLowerCase(),
        }),
      });

      router.push(`/${language}/about`);
    },
    onError: handleAxiosError,
  });

  const onValid: SubmitHandler<AboutFormData> = (formData) => {
    const commonPayload: BasePayload = {
      gender: Number(formData.gender),
      email: formData.email ?? '',
      mobile_phone:
        formData.phone !== null && formData.phone !== undefined
          ? String(formData.phone)
          : '',
      nib: formData.nib ?? '',
      head_name: formData.headName ?? '',
      total_bad_room: Number(formData.totalBedroom ?? 0),
      percentage_bad_room: Number(formData.percentageBedroom ?? 0),
    };

    mutate(commonPayload);
  };

  const onInvalid = (errors: FieldErrors<AboutFormData>) => {
    console.error('Validation Errors:', errors);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onValid, onInvalid)}>
        <div className="ui-w-full ui-space-y-6 ui-max-w-form ui-mx-auto">
          <Alert type="neutral" withIcon title={t('about:info.title')}>
            {t('about:info.body')}
          </Alert>
          <AboutFormInfo />
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

export default AboutForm;

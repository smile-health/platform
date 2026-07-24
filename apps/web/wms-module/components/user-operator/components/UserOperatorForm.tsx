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

import { useMutation } from '@tanstack/react-query';
import {
  UserOperatorFormData,
  userOperatorFormSchema,
} from '../schema/UserOperatorSchemaForm';
import UserOperatorFormInfo from './Form/UserOperatorFormInfo';

import {
  createOperatorThirdparty,
  updateOperatorThirdparty,
} from '@/services/partnership-operator';
import {
  CreateOperatorThirdpartyInput,
  TOperatorThirdparty,
  UpdateOperatorThirdpartyInput,
} from '@/types/partnership-operator';
import { resetStorageUserOperator } from '@/utils/storage/user-operator';
import { toast } from '@repo/ui/components/toast';
import { handleDefaultValue } from '../utils/helper';

type UserOperatorFormProps = {
  defaultValues?: TOperatorThirdparty;
};

type BasePayload = {
  partnershipId: number;
  operatorId: string;
};

const UserOperatorForm = ({ defaultValues }: UserOperatorFormProps) => {
  const router = useWmsRouter();

  const oldOperatorId = defaultValues?.operatorId;
  const oldPartnershipId = defaultValues?.partnershipId;

  const { t } = useTranslation(['common', 'userOperator']);

  const isEdit = Boolean(oldOperatorId);

  const { i18n: locale } = useTranslation();
  const language = locale.language;

  const methods = useForm<any>({
    resolver: yupResolver(userOperatorFormSchema(t) as any),
    mode: 'onBlur',
    defaultValues: handleDefaultValue(defaultValues),
  });

  const { handleSubmit } = methods;

  const { mutate, isPending } = useMutation({
    mutationFn: (data: unknown) =>
      isEdit
        ? updateOperatorThirdparty(
            {
              operator_id: oldOperatorId ?? '',
              partnership_id: Number(oldPartnershipId),
            },
            data as UpdateOperatorThirdpartyInput
          )
        : createOperatorThirdparty(data as CreateOperatorThirdpartyInput),
    onSuccess: () => {
      isEdit && resetStorageUserOperator();

      toast.success({
        description: t(
          isEdit
            ? 'common:message.success.update'
            : 'common:message.success.create',
          {
            type: t('userOperator:list.list')?.toLowerCase(),
          }
        ),
      });

      router.replace(`/${language}/user-operator`);
    },
    onError: handleAxiosError,
  });

  const onValid: SubmitHandler<UserOperatorFormData> = (formData) => {
    const commonPayload: BasePayload = {
      operatorId: formData.operator.value ?? '',
      partnershipId: Number(formData.healthcare_facility.value),
    };

    mutate(commonPayload);
  };

  const onInvalid = (errors: FieldErrors<UserOperatorFormData>) => {
    console.error('Validation Errors:', errors);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onValid, onInvalid)}>
        <div className="ui-w-full ui-space-y-6 ui-max-w-form ui-mx-auto">
          <UserOperatorFormInfo />
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

export default UserOperatorForm;

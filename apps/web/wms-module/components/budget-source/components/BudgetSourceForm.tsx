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

import {
  CreateBudgetSourceInput,
  TBudgetSource,
  UpdateBudgetSourceInput,
} from '@/types/budget-source';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import {
  BudgetSourceFormData,
  budgetSourceFormSchema,
} from '../schema/BudgetSourceSchemaForm';
import BudgetSourceFormInfo from './Form/BudgetSourceFormInfo';

import {
  createBudgetSource,
  updateBudgetSource,
} from '@/services/budget-source';
import { handleAxiosError } from '@/utils/handleAxiosError';
import { getUserStorage } from '@/utils/storage/user';
import { toast } from '@repo/ui/components/toast';
import { handleDefaultValue } from '../utils/helper';

type BudgetSourceFormProps = {
  defaultValues?: TBudgetSource;
};

type BasePayload = {
  name?: string;
  description?: string;
};

const BudgetSourceForm = ({ defaultValues }: BudgetSourceFormProps) => {
  const router = useWmsRouter();
  const params = useParams();
  const user = getUserStorage();
  const queryClient = useQueryClient();

  const { t } = useTranslation(['common', 'budgetSource']);

  const isEdit = Boolean(params?.id);

  const { i18n: locale } = useTranslation();
  const language = locale.language;

  const methods = useForm<any>({
    resolver: yupResolver(budgetSourceFormSchema(t) as any),
    mode: 'onBlur',
    defaultValues: handleDefaultValue(defaultValues),
  });

  const { handleSubmit } = methods;

  const { mutate, isPending } = useMutation({
    mutationFn: (data: unknown) =>
      isEdit
        ? updateBudgetSource(
          Number(params?.id),
          data as UpdateBudgetSourceInput
        )
        : createBudgetSource(data as CreateBudgetSourceInput),
    onSuccess: () => {
      isEdit &&
        queryClient.invalidateQueries({
          queryKey: ['budget-source-detail', params?.id],
        });

      toast.success({
        description: t(
          isEdit
            ? 'common:message.success.update'
            : 'common:message.success.create',
          {
            type: t('budgetSource:title.list')?.toLowerCase(),
          }
        ),
      });

      router.push(`/${language}/budget-source`);
    },
    onError: handleAxiosError,
  });

  const onValid: SubmitHandler<BudgetSourceFormData> = (formData) => {
    const commonPayload: BasePayload = {
      name: formData.name ?? undefined,
      description: formData.description ?? undefined,
      ...(isEdit
        ? { updatedBy: user?.user_uuid }
        : { createdBy: user?.user_uuid }),
    };

    mutate(commonPayload);
  };

  const onInvalid = (errors: FieldErrors<BudgetSourceFormData>) => {
    console.error('Validation Errors:', errors);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onValid, onInvalid)}>
        <div className="ui-w-full ui-space-y-6 ui-max-w-form ui-mx-auto">
          <BudgetSourceFormInfo />
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

export default BudgetSourceForm;

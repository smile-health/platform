'use client';
import { handleAxiosError } from '@/utils/handleAxiosError';

import { createPrintLabel, updatePrintLabel } from '@/services/print-label';
import {
  CreatePrintLabelInput,
  TPrintLabel,
  UpdatePrintLabelInput,
} from '@/types/print-label';
import useWmsRouter from '@/utils/hooks/useWmsRouter';
import { getUserStorage } from '@/utils/storage/user';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@repo/ui/components/button';
import { toast } from '@repo/ui/components/toast';
import { useMutation } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import {
  FieldErrors,
  FormProvider,
  SubmitHandler,
  useForm,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  PrintLabelFormData,
  printLabelFormSchema,
} from '../schema/PrintLabelSchemaForm';
import { handleDefaultValuePrintLabel } from '../utils/helper';
import PrintLabelFormInfo from './Form/PrintLabelFormInfo';

type PrintLabelFormProps = {
  defaultValues?: TPrintLabel;
};

const PrintLabelForm = ({ defaultValues }: PrintLabelFormProps) => {
  const router = useWmsRouter();
  const user = getUserStorage();
  const params = useParams();

  const isEdit = Boolean(params?.id);

  const { t, i18n: locale } = useTranslation(['common', 'printLabel']);
  const language = locale.language;

  const methods = useForm<any>({
    resolver: yupResolver(printLabelFormSchema(t) as any),
    mode: 'onBlur',
    defaultValues: handleDefaultValuePrintLabel(defaultValues),
  });

  const { handleSubmit } = methods;

  const { mutate, isPending } = useMutation({
    mutationFn: (data: unknown) =>
      isEdit
        ? updatePrintLabel(Number(params?.id), data as UpdatePrintLabelInput)
        : createPrintLabel(data as CreatePrintLabelInput),
    onSuccess: () => {
      toast.success({
        description: t(
          isEdit
            ? 'common:message.success.update'
            : 'common:message.success.create',
          {
            type: t('printLabel:list.list')?.toLowerCase(),
          }
        ),
      });
      router.push(`/${language}/print-label`);
    },
    onError: handleAxiosError,
  });

  const onValid: SubmitHandler<PrintLabelFormData> = (formData) => {
    const commonPayload = {
      ...(isEdit
        ? { updatedBy: user?.user_uuid }
        : { createdBy: user?.user_uuid }),
      healthcareFacilityId: user?.entity_id,
      wasteSourceId: formData.wasteSource.value,
      wasteClassificationId: formData.wasteClassificationId,
      labelCount: formData.total_number,
    };
    mutate(commonPayload);
  };

  const onInvalid = (errors: FieldErrors<PrintLabelFormData>) => {
    console.error('Validation Errors:', errors);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onValid, onInvalid)}>
        <div className="ui-w-full ui-space-y-6 ui-max-w-form ui-mx-auto">
          <PrintLabelFormInfo />
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

export default PrintLabelForm;

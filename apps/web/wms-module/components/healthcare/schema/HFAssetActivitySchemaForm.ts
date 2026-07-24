import { ActivityType } from '@/types/hf-asset-activity';
import { TFunction } from 'i18next';
import * as yup from 'yup';

export const assetActivitySchemaForm = (
  t: TFunction<['common', 'healthCare']>,
  activityType: string
) => {
  return yup.object().shape({
    startDate: yup
      .date()
      .typeError(t('common:validation.message_invalid_date'))
      .required(t('common:validation.required')),
    endDate:
      activityType === ActivityType.MAINTENANCE
        ? yup.date().nullable()
        : yup
            .date()
            .nullable()
            .typeError(t('common:validation.message_invalid_date'))
            .required(t('common:validation.required'))
            .min(
              yup.ref('startDate'),
              t('common:validation.date_must_be_after_start_date')
            ),
    operatorId: yup.string().required(t('common:validation.required')),
  });
};

export type AssetActivityFormData = yup.InferType<
  ReturnType<typeof assetActivitySchemaForm>
>;

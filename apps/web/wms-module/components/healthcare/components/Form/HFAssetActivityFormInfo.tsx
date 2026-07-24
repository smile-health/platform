import { DatePicker } from '@repo/ui/components/date-picker';
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '@repo/ui/components/form-control';
import { Input } from '@repo/ui/components/input';
import React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { useTranslation } from 'react-i18next';

import { ActivityType } from '@/types/hf-asset-activity';
import { dateToDateValue, dateValueToDate } from '@/utils/date';
import { AssetActivityFormData } from '../../schema/HFAssetActivitySchemaForm';

type HFAssetActivityFormInfoProps = {
  activityType: ActivityType;
};

const HFAssetActivityFormInfo: React.FC<HFAssetActivityFormInfoProps> = ({
  activityType,
}) => {
  const { t } = useTranslation(['common', 'healthCare']);

  const {
    register,
    formState: { errors },
    control,
  } = useFormContext<AssetActivityFormData>();

  const startDate = useWatch({ name: 'startDate' });

  const dateLabel =
    {
      [ActivityType.CALIBRATION]: t(
        'healthCare:form_asset_activity.calibration_start_date.label'
      ),
      [ActivityType.MAINTENANCE]: t(
        'healthCare:form_asset_activity.maintenance_date.label'
      ),
    }[activityType] ||
    t('healthCare:form_asset_activity.calibration_start_date.label');

  return (
    <div className="ui-flex ui-flex-col">
      <div className="ui-p-4 ui-border ui-rounded">
        <div className="ui-grid ui-grid-cols-1 ui-gap-x-6 ui-gap-y-6">
          <FormControl>
            <FormLabel required>
              {t('healthCare:form_asset_activity.operator_name.label')}
            </FormLabel>
            <Input
              {...register('operatorId')}
              id="input-asset-id"
              type="text"
              placeholder={t(
                'healthCare:form_asset_activity.operator_name.placeholder'
              )}
              error={!!errors?.operatorId}
            />
            <FormErrorMessage>
              {errors?.operatorId?.message as string}
            </FormErrorMessage>
          </FormControl>
          <Controller
            name={`startDate`}
            control={control}
            render={({
              field: { value, onChange, ...field },
              fieldState: { error },
            }) => (
              <FormControl>
                <FormLabel htmlFor="start-date" required>
                  {dateLabel}
                </FormLabel>
                <DatePicker
                  {...field}
                  value={dateToDateValue(value)}
                  onChange={(dateValue) => {
                    onChange(dateValueToDate(dateValue));
                  }}
                  error={!!error?.message}
                  clearable={false}
                />
                {error?.message && (
                  <FormErrorMessage>{error?.message}</FormErrorMessage>
                )}
              </FormControl>
            )}
          />
          {activityType === ActivityType.CALIBRATION && (
            <Controller
              name={`endDate`}
              control={control}
              render={({
                field: { value, onChange, ...field },
                fieldState: { error },
              }) => (
                <FormControl>
                  <FormLabel htmlFor="end-date" required>
                    {t(
                      'healthCare:form_asset_activity.calibration_end_date.label'
                    )}
                  </FormLabel>
                  <DatePicker
                    {...field}
                    value={dateToDateValue(value)}
                    onChange={(dateValue) => {
                      onChange(dateValueToDate(dateValue));
                    }}
                    minValue={dateToDateValue(startDate) || undefined}
                    error={!!error?.message}
                    clearable={false}
                    isDisabled={!startDate}
                  />
                  {error?.message && (
                    <FormErrorMessage>{error?.message}</FormErrorMessage>
                  )}
                </FormControl>
              )}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default HFAssetActivityFormInfo;

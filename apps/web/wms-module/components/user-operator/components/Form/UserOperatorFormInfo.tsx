import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { loadUsers } from '@/services/user';
import { getUserStorage } from '@/utils/storage/user';
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '@repo/ui/components/form-control';
import {
  OptionType,
  ReactSelect,
  ReactSelectAsync,
} from '@repo/ui/components/react-select';
import { UserOperatorFormData } from '../../schema/UserOperatorSchemaForm';
import { useHealthcarePatnerOperator } from '../../hooks/useHealthcarePatnerOperator';

const UserOperatorFormInfo: React.FC = () => {
  const user = getUserStorage();
  const { t } = useTranslation(['userOperator', 'common']);

  const { options: healthcarePatnerOptions } = useHealthcarePatnerOperator();

  const {
    setValue,
    control,
    clearErrors,
    formState: { errors },
  } = useFormContext<UserOperatorFormData>();

  return (
    <div className="ui-flex ui-flex-col">
      <div className="ui-p-4 ui-border ui-rounded">
        <div className="ui-grid ui-grid-cols-1 ui-gap-x-6 ui-gap-y-6">
          <Controller
            name="operator"
            control={control}
            render={({
              field: { onChange, value, ...field },
              fieldState: { error },
            }) => {
              return (
                <FormControl>
                  <FormLabel htmlFor="select-operator" required>
                    {t('userOperator:form.operator.label')}
                  </FormLabel>
                  <ReactSelectAsync
                    {...field}
                    id="select-operator"
                    loadOptions={loadUsers}
                    debounceTimeout={300}
                    isClearable
                    placeholder={t('userOperator:form.operator.placeholder')}
                    additional={{
                      page: 1,
                      entity_id: user?.entity_id,
                    }}
                    onChange={(option: OptionType) => {
                      onChange(option);
                      clearErrors('operator');
                      setValue('operator', option);
                    }}
                    value={value as OptionType}
                    error={!!error?.message}
                  />
                  {errors?.operator?.message && (
                    <FormErrorMessage>
                      {errors?.operator?.message}
                    </FormErrorMessage>
                  )}
                </FormControl>
              );
            }}
          />
          <Controller
            name="healthcare_facility"
            control={control}
            render={({
              field: { onChange, value, ...field },
              fieldState: { error },
            }) => {
              return (
                <FormControl>
                  <FormLabel htmlFor="select-healthcare-partnership" required>
                    {t('userOperator:form.healthcare_facility.label')}
                  </FormLabel>
                  <ReactSelect
                    {...field}
                    id="select-healthcare-partner"
                    options={healthcarePatnerOptions}
                    isClearable
                    placeholder={t(
                      'userOperator:form.healthcare_facility.placeholder'
                    )}
                    onChange={(option: OptionType) => {
                      onChange(option);
                      clearErrors('healthcare_facility');
                      setValue('healthcare_facility', option);
                    }}
                    value={value as OptionType}
                    error={!!error?.message}
                  />
                  {errors?.healthcare_facility?.message && (
                    <FormErrorMessage>
                      {errors?.healthcare_facility?.message}
                    </FormErrorMessage>
                  )}
                </FormControl>
              );
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default UserOperatorFormInfo;

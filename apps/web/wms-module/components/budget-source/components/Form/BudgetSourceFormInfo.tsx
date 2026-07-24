import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '@repo/ui/components/form-control';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Input } from '@repo/ui/components/input';
import { TextArea } from '@repo/ui/components/text-area';
import { BudgetSourceFormData } from '../../schema/BudgetSourceSchemaForm';

const BudgetSourceFormInfo: React.FC = () => {
  const { t } = useTranslation(['budgetSource', 'common']);

  const { control } = useFormContext<BudgetSourceFormData>();

  return (
    <div className="ui-flex ui-flex-col">
      <div className="ui-p-4 ui-border ui-rounded">
        <div className="ui-flex ui-flex-col ui-space-y-5">
          <Controller
            name="name"
            control={control}
            render={({
              field: { onChange, value, ...field },
              fieldState: { error },
            }) => {
              return (
                <FormControl>
                  <FormLabel required>
                    {t('budgetSource:form.budget_source.label')}
                  </FormLabel>
                  <Input
                    {...field}
                    id="input-asset-id"
                    type="text"
                    placeholder={t(
                      'budgetSource:form.budget_source.placeholder'
                    )}
                    error={!!error?.message}
                    value={value ?? ''}
                    onChange={(e) => {
                      onChange(e.target.value);
                    }}
                  />
                  {error?.message && (
                    <FormErrorMessage>
                      {error?.message as string}
                    </FormErrorMessage>
                  )}
                </FormControl>
              );
            }}
          />

          <Controller
            name="description"
            control={control}
            render={({
              field: { onChange, value, ...field },
              fieldState: { error },
            }) => {
              return (
                <FormControl>
                  <FormLabel required>
                    {t('budgetSource:form.description.label')}
                  </FormLabel>
                  <TextArea
                    {...field}
                    id="input-asset-id"
                    placeholder={t('budgetSource:form.description.placeholder')}
                    error={!!error?.message}
                    value={value ?? ''}
                    onChange={(e) => {
                      onChange(e.target.value);
                    }}
                  />
                  {error?.message && (
                    <FormErrorMessage>
                      {error?.message as string}
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

export default BudgetSourceFormInfo;

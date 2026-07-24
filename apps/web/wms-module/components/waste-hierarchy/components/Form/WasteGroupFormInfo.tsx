import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '@repo/ui/components/form-control';
import { Input } from '@repo/ui/components/input';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { loadWasteByParentHierarchyId } from '@/services/waste-hierarchy';
import { OptionType, ReactSelect } from '@repo/ui/components/react-select';
import { TextArea } from '@repo/ui/components/text-area';
import { useQuery } from '@tanstack/react-query';
import { WasteGroupFormData } from '../../schema/WasteHierarchySchemaForm';

const WasteGroupFormInfo: React.FC = () => {
  const { t } = useTranslation(['wasteHierarchy', 'common']);

  const { i18n } = useTranslation();

  const { data: wasteTypeOption } = useQuery({
    queryKey: ['wasteTypeOptions', i18n.language],
    queryFn: () =>
      loadWasteByParentHierarchyId('', null, {
        page: 1,
        parent_hierarchy_id: null,
      }),
    select: (res) => res.options,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const {
    register,
    setValue,
    formState: { errors },
    clearErrors,
    control,
  } = useFormContext<WasteGroupFormData>();

  return (
    <div className="ui-flex ui-flex-col">
      <div className="ui-p-4 ui-border ui-rounded">
        <div className="ui-grid ui-grid-cols-1 ui-gap-x-6 ui-gap-y-6">
          <Controller
            name="waste_type"
            control={control}
            render={({
              field: { onChange, value, ...field },
              fieldState: { error },
            }) => {
              return (
                <FormControl>
                  <FormLabel htmlFor="select-manufacturer" required>
                    {t('wasteHierarchy:form.waste_type.label')}
                  </FormLabel>
                  <ReactSelect
                    {...field}
                    id="select-waste-type"
                    placeholder={t(
                      'wasteHierarchy:form.waste_type.placeholder'
                    )}
                    options={wasteTypeOption}
                    onChange={(option: OptionType) => {
                      setValue('waste_type', option);
                      clearErrors('waste_type');
                    }}
                    value={wasteTypeOption?.find((x) => {
                      const valueId = value as unknown as OptionType;

                      return x.value === valueId.value;
                    })}
                    isClearable
                  />
                  {error?.message && (
                    <FormErrorMessage>{error?.message}</FormErrorMessage>
                  )}
                </FormControl>
              );
            }}
          />
          <FormControl>
            <FormLabel required>
              {t('wasteHierarchy:form.waste_group.label')}
            </FormLabel>
            <Input
              {...register('waste_group')}
              id="input-waste-source-group"
              type="text"
              placeholder={t('wasteHierarchy:form.waste_group.placeholder')}
              error={!!errors?.waste_group}
            />
            <FormErrorMessage>
              {errors?.waste_group?.message as string}
            </FormErrorMessage>
          </FormControl>
          <FormControl>
            <FormLabel required>
              {t('wasteHierarchy:form.description.label')}
            </FormLabel>
            <TextArea
              {...register('description')}
              id="input-description"
              placeholder={t('wasteHierarchy:form.description.placeholder')}
              error={!!errors?.description}
            />
            <FormErrorMessage>
              {errors?.description?.message as string}
            </FormErrorMessage>
          </FormControl>
        </div>
      </div>
    </div>
  );
};

export default WasteGroupFormInfo;

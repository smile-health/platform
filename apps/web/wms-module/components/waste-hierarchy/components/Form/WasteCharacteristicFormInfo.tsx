import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '@repo/ui/components/form-control';
import { Input } from '@repo/ui/components/input';
import React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { loadWasteByParentHierarchyId } from '@/services/waste-hierarchy';
import { OptionType, ReactSelect } from '@repo/ui/components/react-select';
import { Switch } from '@repo/ui/components/switch';
import { TextArea } from '@repo/ui/components/text-area';
import { useQuery } from '@tanstack/react-query';
import { WasteCharacteristicFormData } from '../../schema/WasteHierarchySchemaForm';

const WasteCharacteristicFormInfo: React.FC = () => {
  const { t } = useTranslation(['wasteHierarchy', 'common']);

  const {
    register,
    setValue,
    formState: { errors },
    clearErrors,
    control,
  } = useFormContext<WasteCharacteristicFormData>();

  const wasteTypeId = useWatch({ name: 'waste_type' });

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

  const { data: wasteGroupOption } = useQuery({
    queryKey: ['wasteGroupOptions', wasteTypeId, i18n.language],
    queryFn: () =>
      loadWasteByParentHierarchyId('', null, {
        page: 1,
        parent_hierarchy_id: wasteTypeId?.value,
      }),
    select: (res) => res.options,
    retry: false,
    refetchOnWindowFocus: false,
    enabled: Boolean(
      typeof wasteTypeId === 'object' && wasteTypeId !== null
        ? wasteTypeId.value
        : wasteTypeId
    ),
  });

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
                  <FormLabel htmlFor="select-waste-type" required>
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
                      setValue('waste_group', {
                        value: 0,
                        label: '',
                      });
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
          <Controller
            name="waste_group"
            control={control}
            render={({
              field: { onChange, value, ...field },
              fieldState: { error },
            }) => {
              return (
                <FormControl>
                  <FormLabel htmlFor="select-waste-group" required>
                    {t('wasteHierarchy:form.waste_group.label')}
                  </FormLabel>
                  <ReactSelect
                    {...field}
                    id="select-waste-group"
                    placeholder={t(
                      'wasteHierarchy:form.waste_group.placeholder'
                    )}
                    options={wasteGroupOption}
                    onChange={(option: OptionType) => {
                      setValue('waste_group', option);
                      clearErrors('waste_group');
                    }}
                    value={wasteGroupOption?.find((x) => {
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
              {t('wasteHierarchy:form.waste_characteristic.label')}
            </FormLabel>
            <Input
              {...register('waste_characteristic')}
              id="input-waste-characteristic"
              type="text"
              placeholder={t(
                'wasteHierarchy:form.waste_characteristic.placeholder'
              )}
              error={!!errors?.waste_characteristic}
            />
            <FormErrorMessage>
              {errors?.waste_characteristic?.message as string}
            </FormErrorMessage>
          </FormControl>
          <Controller
            name="is_active"
            control={control}
            render={({ field: { value, onChange } }) => (
              <FormControl>
                <FormLabel required>
                  {t('wasteHierarchy:form.status.label')}
                </FormLabel>
                <Switch
                  labelInside={{
                    on: t('wasteHierarchy:form.status.active'),
                    off: t('wasteHierarchy:form.status.non_active'),
                  }}
                  checked={value}
                  onCheckedChange={onChange}
                  size="lg"
                />
              </FormControl>
            )}
          />
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

export default WasteCharacteristicFormInfo;

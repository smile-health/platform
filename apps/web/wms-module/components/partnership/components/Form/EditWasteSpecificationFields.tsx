import { WasteCassificationPartnership } from '@/types/partnership';
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '@repo/ui/components/form-control';
import {
  OptionType,
  OptionTypeWithData,
  ReactSelect,
} from '@repo/ui/components/react-select';
import {
  Controller,
  FieldErrors,
  UseFormClearErrors,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PartnershipFormData } from '../../schema/PartnershipSchemaForm';

interface EditWasteSpecificationFieldsProps {
  control: any;
  watch: UseFormWatch<PartnershipFormData>;
  setValue: UseFormSetValue<PartnershipFormData>;
  clearErrors: UseFormClearErrors<PartnershipFormData>;
  errors: FieldErrors<PartnershipFormData>;
  wasteTypeOption?: OptionType[];
  wasteGroupOption?: OptionType[];
  wasteCharacteristicOption?: OptionType[];
}

export const EditWasteSpecificationFields = ({
  control,
  watch,
  setValue,
  clearErrors,
  errors,
  wasteTypeOption,
  wasteGroupOption,
  wasteCharacteristicOption,
}: EditWasteSpecificationFieldsProps) => {
  const { t } = useTranslation(['partnership', 'common']);

  return (
    <>
      <Controller
        name="wasteTypeId"
        control={control}
        render={({
          field: { onChange, value, ...field },
          fieldState: { error },
        }) => {
          return (
            <FormControl>
              <FormLabel htmlFor="select-waste-type" required>
                {t('partnership:form.waste_type.label')}
              </FormLabel>
              <ReactSelect
                {...field}
                id="select-waste-type"
                placeholder={t('partnership:form.waste_type.placeholder')}
                options={wasteTypeOption}
                onChange={(option: OptionType) => {
                  setValue('wasteTypeId', option?.value);
                  clearErrors('wasteTypeId');

                  setValue('wasteGroupId', 0);
                  clearErrors('wasteGroupId');

                  setValue('wasteCharacteristicsId', 0);
                  clearErrors('wasteCharacteristicsId');
                }}
                value={wasteTypeOption?.find(
                  (x) => x.value === watch('wasteTypeId')
                )}
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
        name="wasteGroupId"
        control={control}
        render={({
          field: { onChange, value, ...field },
          fieldState: { error },
        }) => {
          return (
            <FormControl>
              <FormLabel htmlFor="select-waste-group" required>
                {t('partnership:form.waste_group.label')}
              </FormLabel>
              <ReactSelect
                {...field}
                id="select-waste-group"
                placeholder={t('partnership:form.waste_group.placeholder')}
                options={wasteGroupOption}
                onChange={(option: OptionType) => {
                  setValue('wasteGroupId', option?.value);
                  clearErrors('wasteGroupId');

                  setValue('wasteCharacteristicsId', 0);
                  clearErrors('wasteCharacteristicsId');
                }}
                value={
                  wasteGroupOption?.find(
                    (x) => x.value === watch('wasteGroupId')
                  ) ?? null
                }
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
        name="wasteCharacteristicsId"
        control={control}
        render={({
          field: { onChange, value, ...field },
          fieldState: { error },
        }) => {
          return (
            <FormControl>
              <FormLabel htmlFor="select-waste-characteristic" required>
                {t('partnership:form.waste_characteristic.label')}
              </FormLabel>
              <ReactSelect
                {...field}
                id="select-waste-characteristic"
                placeholder={t(
                  'partnership:form.waste_characteristic.placeholder'
                )}
                options={wasteCharacteristicOption}
                onChange={(
                  option: OptionTypeWithData<WasteCassificationPartnership>
                ) => {
                  setValue(
                    'wasteClassificationId',
                    option?.data?.wasteClassificationId
                  );
                  setValue('wasteCharacteristicsId', option?.value);
                  clearErrors('wasteCharacteristicsId');
                }}
                value={
                  wasteCharacteristicOption?.find(
                    (x) => x.value === watch('wasteCharacteristicsId')
                  ) ?? null
                }
                isClearable
              />
              {error?.message && (
                <FormErrorMessage>{error?.message}</FormErrorMessage>
              )}
            </FormControl>
          );
        }}
      />
    </>
  );
};

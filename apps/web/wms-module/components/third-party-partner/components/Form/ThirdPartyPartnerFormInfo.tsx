import { parseDate } from '@internationalized/date';
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '@repo/ui/components/form-control';
import {
  OptionType,
  OptionTypeWithData,
  ReactSelect,
  ReactSelectAsync,
} from '@repo/ui/components/react-select';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ThirdPartyPartnerFormData } from '../../schema/ThirdPartyPartnerSchemaForm';

import { PartnershipStatusOption } from '@/components/partnership/constants/partnership';
import { getPartnershipStatusOptions } from '@/components/partnership/utils/helper';
import { getEntityWmsDetail, loadEntityList } from '@/services/entity';
import { loadWasteCassificationList } from '@/services/partnership';
import { WasteCassificationPartnership } from '@/types/partnership';
import { Button } from '@repo/ui/components/button';
import { DateRangePicker } from '@repo/ui/components/date-picker';
import { Input } from '@repo/ui/components/input';
import { Switch } from '@repo/ui/components/switch';
import { WasteSpecificationTable } from '../../constants/WasteSpecificationTable';
import {
  getDefaultProviderType,
  getProviderTypeOptions,
} from '../../utils/helper';
import { WasteCharacteristicModal } from '../Modal/WasteCharacteristicModal';
import { useHealthcarePatner } from '@/components/partnership/hooks/useHealthcarePatner';

const ThirdPartyPartnerFormInfo: React.FC = () => {
  const { t } = useTranslation(['thirdPartyPartner', 'common']);
  const params = useParams();
  const [isEmptyClassification, setIsEmptyClassification] = useState<boolean>(
    false
  );

  const { options: healthcarePatnerOptions } = useHealthcarePatner();

  const isEdit = Boolean(params?.id);
  const {
    register,
    watch,
    setValue,
    resetField,
    formState: { errors },
    clearErrors,
    control,
    trigger,
  } = useFormContext<ThirdPartyPartnerFormData>();

  const isSameCompany = useWatch({ name: 'isSameCompany' });
  const healthcarePartner = useWatch({ name: 'healthcarePartner' });
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [modalForm, setModalForm] = useState({
    characteristicId: '',
    characteristicLabel: '',
    providerType: '',
  });

  const { data: wasteClassificationOption, isFetching } = useQuery({
    queryKey: [
      'wasteClassificationOption',
      isSameCompany,
      healthcarePartner?.value,
    ],
    queryFn: () =>
      loadWasteCassificationList(
        isSameCompany ? 1 : 0,
        healthcarePartner?.value
      ),
    select: (res) => res.options || [],
    retry: false,
    refetchOnWindowFocus: false,
    enabled: Boolean(healthcarePartner?.value),
  });

  useEffect(() => {
    if (!healthcarePartner?.value) {
      setIsEmptyClassification(false);
      return;
    }

    if (wasteClassificationOption && Array.isArray(wasteClassificationOption)) {
      setIsEmptyClassification(wasteClassificationOption.length === 0);
    }
  }, [wasteClassificationOption, healthcarePartner?.value]);

  // Handle adding/editing waste specification (only for Create)
  const handleAddSpecification = () => {
    setModalForm({
      characteristicId: '',
      characteristicLabel: '',
      providerType: '',
    });
    setEditIndex(null);
    setShowModal(true);
  };

  // Handle editing an existing waste specification (only for Create)
  const handleEditSpecification = (index: number) => {
    const wasteClassification = watch('wasteClassification');
    const spec = wasteClassification?.[index];
    setModalForm({
      characteristicId: spec?.characteristicId || '',
      characteristicLabel: spec?.characteristicLabel || '',
      providerType: spec?.providerType || '',
    });
    setEditIndex(index);
    setShowModal(true);
  };

  // Handle removing a waste specification (only for Create)
  const handleRemoveSpecification = (index: number) => {
    const wasteClassification = watch('wasteClassification');
    setValue(
      'wasteClassification',
      wasteClassification?.filter((_, i) => i !== index)
    );
    // Trigger validation to update error state
    setTimeout(() => {
      trigger('wasteClassification');
    }, 0);
  };

  // Handle saving waste specification from modal (only for Create)
  const handleSaveSpecification = () => {
    const wasteClassification = watch('wasteClassification') || [];
    const newSpec = {
      characteristicId: modalForm.characteristicId,
      characteristicLabel: modalForm.characteristicLabel,
      providerType: modalForm.providerType,
    };

    if (editIndex !== null) {
      // Edit existing
      const updatedSpecs = [...wasteClassification];
      updatedSpecs[editIndex] = newSpec;
      setValue('wasteClassification', updatedSpecs);
    } else {
      // Add new
      setValue('wasteClassification', [...wasteClassification, newSpec]);
    }

    // Trigger validation to clear any previous errors
    setTimeout(() => {
      trigger('wasteClassification');
    }, 0);

    setShowModal(false);
  };

  // Get waste specifications data
  const wasteSpecificationsData = watch('wasteClassification') || [];

  const partnershipStatusOptions = getPartnershipStatusOptions();

  const selectedValue = partnershipStatusOptions.find(
    (option) => option.value === watch('partnershipStatus')
  );

  const thirdPartyPartnerDetail = watch('thirdPartyPartner');

  const { data: thirdPartyPartnerDetailData } = useQuery({
    queryKey: ['getEntityDetail', thirdPartyPartnerDetail?.value],
    queryFn: () => getEntityWmsDetail(Number(thirdPartyPartnerDetail.value)),
    enabled: Boolean(thirdPartyPartnerDetail?.value),
  });

  return (
    <div className="ui-flex ui-flex-col">
      <div className="ui-p-4 ui-border ui-rounded">
        <div className="ui-grid ui-grid-cols-1 ui-gap-x-6 ui-gap-y-6">
          {!isEdit && (
            <Controller
              name="isSameCompany"
              control={control}
              render={({ field: { value } }) => (
                <FormControl>
                  <FormLabel required>
                    {t('thirdPartyPartner:form.is_same_company.label')}
                  </FormLabel>
                  <Switch
                    labelInside={{ on: 'Yes', off: 'No' }}
                    checked={value}
                    onCheckedChange={(checked) => {
                      setValue('isSameCompany', checked);
                      resetField('wasteClassificationId');
                      resetField('providerType');
                      resetField('contractDate');
                      resetField('contractId');
                    }}
                    size="lg"
                  />
                </FormControl>
              )}
            />
          )}
          <Controller
            name="healthcarePartner"
            control={control}
            render={({
              field: { onChange, value, ...field },
              fieldState: { error },
            }) => {
              return (
                <FormControl>
                  <FormLabel htmlFor="select-healthcare-partnership" required>
                    {t('thirdPartyPartner:form.healthcare_partner.label')}
                  </FormLabel>
                  <ReactSelect
                    {...field}
                    id="select-healthcare-partner"
                    options={healthcarePatnerOptions}
                    isClearable
                    placeholder={t(
                      'thirdPartyPartner:form.healthcare_partner.placeholder'
                    )}
                    onChange={(option: OptionType) => {
                      onChange(option);
                      clearErrors('healthcarePartner');
                      setValue('healthcarePartner', option);
                      resetField('wasteClassificationId');
                      resetField('providerType');
                    }}
                    value={value as OptionType}
                    error={!!error?.message}
                    disabled={isEdit}
                  />
                  {errors?.healthcarePartner?.message && (
                    <FormErrorMessage>
                      {errors?.healthcarePartner?.message}
                    </FormErrorMessage>
                  )}
                </FormControl>
              );
            }}
          />
          {isEdit && (
            <>
              <Controller
                name="wasteClassificationId"
                control={control}
                render={({
                  field: { onChange, value, ...field },
                  fieldState: { error },
                }) => {
                  return (
                    <FormControl>
                      <FormLabel htmlFor="select-waste-classification" required>
                        {t('thirdPartyPartner:form.waste_characteristic.label')}
                      </FormLabel>
                      <ReactSelect
                        {...field}
                        id="select-waste-classification"
                        placeholder={t(
                          'thirdPartyPartner:form.waste_characteristic.placeholder'
                        )}
                        options={wasteClassificationOption}
                        onChange={(
                          option: OptionTypeWithData<WasteCassificationPartnership>
                        ) => {
                          setValue('wasteClassificationId', option?.value);
                          clearErrors('wasteClassificationId');

                          if (isSameCompany) {
                            setValue(
                              'contractId',
                              option?.data?.contractId ?? ''
                            );
                            setValue('contractDate', {
                              start: new Date(
                                dayjs(option?.data?.contractStartDate).format(
                                  'YYYY-MM-DD'
                                )
                              ),
                              end: new Date(
                                dayjs(option?.data?.contractEndDate).format(
                                  'YYYY-MM-DD'
                                )
                              ),
                            });

                            setValue(
                              'providerType',
                              getDefaultProviderType(
                                getProviderTypeOptions(),
                                option?.data?.providerType
                              )
                            );
                            clearErrors('providerType');
                          }
                        }}
                        value={
                          wasteClassificationOption?.find(
                            (x) => x.value === watch('wasteClassificationId')
                          ) ?? null
                        }
                        isClearable
                        disabled={!healthcarePartner?.value || isEdit}
                      />
                      {isEmptyClassification && !isFetching && (
                        <p className="ui-text-blue-800">
                          {t('thirdPartyPartner:classification_info')}
                        </p>
                      )}
                      {error?.message && (
                        <FormErrorMessage>{error?.message}</FormErrorMessage>
                      )}
                    </FormControl>
                  );
                }}
              />
              <FormControl>
                <FormLabel required>
                  {t('thirdPartyPartner:form.partnership_type.label')}
                </FormLabel>
                <ReactSelect
                  {...register('providerType')}
                  id="select-asset-status"
                  placeholder={t(
                    'thirdPartyPartner:form.partnership_type.placeholder'
                  )}
                  options={getProviderTypeOptions()}
                  onChange={(option: OptionType) => {
                    setValue('providerType', option?.value);
                    clearErrors('providerType');
                  }}
                  value={getProviderTypeOptions()?.find(
                    (x) => x.value === watch('providerType')
                  )}
                  isClearable
                  disabled={isSameCompany || isEdit}
                />
                {errors?.providerType?.message && (
                  <FormErrorMessage>
                    {errors?.providerType?.message}
                  </FormErrorMessage>
                )}
              </FormControl>
            </>
          )}
          {!isSameCompany && (
            <Controller
              name="thirdPartyPartner"
              control={control}
              render={({
                field: { onChange, value, ...field },
                fieldState: { error },
              }) => {
                return (
                  <FormControl>
                    <FormLabel htmlFor="select-third-partnership" required>
                      {t('thirdPartyPartner:form.company_name.label')}
                    </FormLabel>
                    <ReactSelectAsync
                      {...field}
                      id="select-third-partner"
                      loadOptions={loadEntityList}
                      debounceTimeout={300}
                      isMulti={false}
                      isClearable
                      placeholder={t(
                        'thirdPartyPartner:form.company_name.placeholder'
                      )}
                      additional={{
                        page: 1,
                        type_ids: '6',
                      }}
                      onChange={(option: OptionType) => {
                        onChange(option);
                        clearErrors('thirdPartyPartner');
                        setValue('thirdPartyPartner', option);
                      }}
                      value={value as OptionType}
                      error={!!error?.message}
                      disabled={isEdit}
                    />
                    {errors?.thirdPartyPartner?.message && (
                      <FormErrorMessage>
                        {errors?.thirdPartyPartner?.message}
                      </FormErrorMessage>
                    )}
                  </FormControl>
                );
              }}
            />
          )}
          {!isSameCompany && (
            <FormControl>
              <FormLabel>{t('thirdPartyPartner:form.nib.label')}</FormLabel>
              <Input
                id="input-nib"
                type="text"
                value={
                  thirdPartyPartnerDetail?.value
                    ? thirdPartyPartnerDetailData?.data?.nib || '-'
                    : ''
                }
                placeholder={t('thirdPartyPartner:form.nib.placeholder')}
                disabled
              />
            </FormControl>
          )}

          {!isSameCompany && (
            <>
              <Controller
                control={control}
                name="contractDate"
                render={({
                  field: { value, onChange, ...field },
                  fieldState: { error },
                }) => (
                  <FormControl>
                    <FormLabel htmlFor="select-contract-date" required>
                      {t('thirdPartyPartner:form.contract_date.label')}
                    </FormLabel>
                    <DateRangePicker
                      {...field}
                      value={
                        value?.start && value.end
                          ? {
                              start: parseDate(
                                dayjs(value.start).format('YYYY-MM-DD')
                              ),
                              end: parseDate(
                                dayjs(value.end).format('YYYY-MM-DD')
                              ),
                            }
                          : null
                      }
                      onChange={onChange}
                      id="contract-date"
                      data-testid="contract-date"
                      maxRange={365}
                      multiCalendar
                      minValue={parseDate('2025-01-01')}
                    />
                    {error?.message ||
                      (errors.contractDate?.end?.message && (
                        <FormErrorMessage>
                          {error?.message || errors.contractDate?.end?.message}
                        </FormErrorMessage>
                      ))}
                  </FormControl>
                )}
              />
              <FormControl>
                <FormLabel required>
                  {t('thirdPartyPartner:form.contract_id.label')}
                </FormLabel>
                <Input
                  {...register('contractId')}
                  id="input-contract-id"
                  type="text"
                  placeholder={t(
                    'thirdPartyPartner:form.contract_id.placeholder'
                  )}
                  error={!!errors?.contractId}
                />
                <FormErrorMessage>
                  {errors?.contractId?.message as string}
                </FormErrorMessage>
              </FormControl>
            </>
          )}
          {isEdit && (
            <FormControl>
              <FormLabel required>
                {t('thirdPartyPartner:form.partnership_status.label')}
              </FormLabel>
              <ReactSelect
                {...register('partnershipStatus')}
                id="select-asset-status"
                placeholder={t(
                  'thirdPartyPartner:form.partnership_status.placeholder'
                )}
                options={partnershipStatusOptions}
                onChange={(option: PartnershipStatusOption | null) => {
                  setValue('partnershipStatus', option?.value ?? '');
                  clearErrors('partnershipStatus');
                }}
                value={selectedValue}
                isClearable
              />
              {errors?.partnershipStatus?.message && (
                <FormErrorMessage>
                  {errors?.partnershipStatus?.message}
                </FormErrorMessage>
              )}
            </FormControl>
          )}
          {!isEdit && (
            <>
              {/* Waste Characteristic Section */}
              <div className="ui-p-4 ui-border ui-rounded mt-6">
                <div className="ui-flex ui-justify-between ui-items-center ui-mb-4">
                  <h3 className="ui-text-lg">
                    {t('thirdPartyPartner:form.waste_characteristic.label')}
                  </h3>
                  <Button
                    onClick={handleAddSpecification}
                    type="button"
                    variant="outline"
                    disabled={
                      isEmptyClassification ||
                      isFetching ||
                      !wasteClassificationOption?.length
                    }
                  >
                    <span className="ui-mr-2">+</span>
                    {t('thirdPartyPartner:list.button.add_characteristic')}
                  </Button>
                </div>
                {/* Waste Specifications Table */}
                {wasteSpecificationsData.length > 0 && (
                  <WasteSpecificationTable
                    data={wasteSpecificationsData}
                    onEdit={handleEditSpecification}
                    onRemove={handleRemoveSpecification}
                  />
                )}
                {/* Validation Error for Waste Specifications */}
                {errors?.wasteClassification?.message && (
                  <div className="ui-mt-2 ui-text-danger-500 ui-text-sm">
                    {errors?.wasteClassification?.message as string}
                  </div>
                )}
                {isEmptyClassification && !isFetching && (
                  <p className="ui-text-blue-800">
                    {t('thirdPartyPartner:classification_info')}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      {/* Modal for Create only */}
      {!isEdit && (
        <WasteCharacteristicModal
          showModal={showModal}
          setShowModal={setShowModal}
          editIndex={editIndex}
          modalForm={modalForm}
          setModalForm={setModalForm}
          handleSaveSpecification={handleSaveSpecification}
          wasteCharacteristicOption={wasteClassificationOption}
          control={control}
          setValue={setValue}
          register={register}
          watch={watch}
          isSameCompany={isSameCompany}
        />
      )}
    </div>
  );
};

export default ThirdPartyPartnerFormInfo;

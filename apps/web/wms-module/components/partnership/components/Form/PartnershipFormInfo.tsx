'use client';

import { getEntityWmsDetail, loadEntityList } from '@/services/entity';
import { loadWasteByParentHierarchyId } from '@/services/waste-hierarchy';
import { parseDate } from '@internationalized/date';
import { Button } from '@repo/ui/components/button';
import { DateRangePicker } from '@repo/ui/components/date-picker';
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '@repo/ui/components/form-control';
import dayjs from 'dayjs';
import { Input } from '@repo/ui/components/input';
import { InputNumberV2 } from '@repo/ui/components/input-number-v2';
import {
  OptionType,
  ReactSelect,
  ReactSelectAsync,
} from '@repo/ui/components/react-select';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import React, { useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PartnershipStatusOption } from '../../constants/partnership';
import { WasteSpecificationTable } from '../../constants/WasteSpecificationTable';
import { PartnershipFormData } from '../../schema/PartnershipSchemaForm';
import {
  getPartnershipStatusOptions,
  getProviderTypeOptions,
} from '../../utils/helper';
import { WasteSpecificationModal } from '../Modal/WasteSpecificationModal';
import { EditWasteSpecificationFields } from './EditWasteSpecificationFields';

const PartnershipFormInfo: React.FC = () => {
  const { t } = useTranslation(['partnership']);
  const params = useParams();
  const isEdit = Boolean(params?.id);

  const {
    register,
    watch,
    setValue,
    formState: { errors },
    clearErrors,
    control,
    trigger,
    getValues,
  } = useFormContext<PartnershipFormData>();

  const wasteTypeId = useWatch({ name: 'wasteTypeId' });
  const wasteGroupId = useWatch({ name: 'wasteGroupId' });

  const partnershipStatusOptions = getPartnershipStatusOptions();

  const selectedValue =
    partnershipStatusOptions?.find(
      (option) => option.value === watch('partnershipStatus')
    ) ?? null;

  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [modalForm, setModalForm] = useState({
    type: '',
    typeLabel: '',
    group: '',
    groupLabel: '',
    characteristic: '',
    characteristicLabel: '',
    classification: '',
    pricePerKg: '',
  });

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
    queryKey: ['wasteGroupOptions', modalForm.type, wasteTypeId, i18n.language],
    queryFn: () =>
      loadWasteByParentHierarchyId('', null, {
        page: 1,
        parent_hierarchy_id: modalForm.type || wasteTypeId,
      }),
    select: (res) => res.options,
    retry: false,
    refetchOnWindowFocus: false,
    enabled: Boolean(modalForm.type) || Boolean(wasteTypeId),
  });

  const { data: wasteCharacteristicOption } = useQuery({
    queryKey: [
      'wasteCharacteristicOptions',
      modalForm.group,
      wasteGroupId,
      i18n.language,
    ],
    queryFn: () =>
      loadWasteByParentHierarchyId('', null, {
        page: 1,
        parent_hierarchy_id: modalForm.group || wasteGroupId,
        isWasteCode: true,
      }),
    select: (res) =>
      res.options.filter((item) => item.data.wasteClassificationId),
    retry: false,
    refetchOnWindowFocus: false,
    enabled: Boolean(modalForm.group) || Boolean(wasteGroupId),
  });

  // Handle adding/editing waste specification (only for Create)
  const handleAddSpecification = () => {
    setModalForm({
      type: '',
      typeLabel: '',
      group: '',
      groupLabel: '',
      characteristic: '',
      characteristicLabel: '',
      classification: '',
      pricePerKg: '',
    });
    setEditIndex(null);
    setShowModal(true);
  };

  // Handle editing an existing waste specification (only for Create)
  const handleEditSpecification = (index: number) => {
    const wasteClassification = watch('wasteClassification');
    const spec = wasteClassification?.[index];
    setModalForm({
      type: spec?.type || '',
      typeLabel: spec?.typeLabel || '',
      group: spec?.group || '',
      groupLabel: spec?.groupLabel || '',
      characteristic: spec?.characteristic || '',
      characteristicLabel: spec?.characteristicLabel || '',
      classification: spec?.classification || '',
      pricePerKg: spec?.pricePerKg?.toString() || '',
    });
    setEditIndex(index);
    setShowModal(true);
  };

  // Handle updating price directly in table (only for Create)
  const handlePriceUpdate = (index: number, newPrice: string) => {
    const wasteClassification = watch('wasteClassification');
    if (wasteClassification?.[index]) {
      const updatedSpecs = [...wasteClassification];
      updatedSpecs[index] = {
        ...updatedSpecs[index],
        pricePerKg: newPrice,
      };
      setValue('wasteClassification', updatedSpecs);
      // Trigger validation
      setTimeout(() => {
        trigger('wasteClassification');
      }, 0);
    }
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

    // all characteristics
    if (!modalForm.characteristic && wasteCharacteristicOption?.length) {
      const newSpecs = wasteCharacteristicOption.map((characteristic) => ({
        type: modalForm.type,
        typeLabel: modalForm.typeLabel,
        group: modalForm.group,
        groupLabel: modalForm.groupLabel,
        characteristic: characteristic.value.toString(),
        characteristicLabel: characteristic.label,
        classification: (
          characteristic.data?.wasteClassificationId || ''
        ).toString(),
        pricePerKg: modalForm.pricePerKg,
      }));

      if (editIndex !== null) {
        // Edit existing - replace with all characteristics
        const updatedSpecs = [...wasteClassification];
        updatedSpecs.splice(editIndex, 1, ...newSpecs);
        setValue('wasteClassification', updatedSpecs);
      } else {
        // Add new - add all characteristics
        setValue('wasteClassification', [...wasteClassification, ...newSpecs]);
      }
    } else {
      // specific characteristics
      const newSpec = {
        type: modalForm.type,
        typeLabel: modalForm.typeLabel,
        group: modalForm.group,
        groupLabel: modalForm.groupLabel,
        characteristic: modalForm.characteristic,
        characteristicLabel: modalForm.characteristicLabel,
        classification: modalForm.classification,
        pricePerKg: modalForm.pricePerKg,
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
    }

    // Trigger validation to clear any previous errors
    setTimeout(() => {
      trigger('wasteClassification');
    }, 0);

    setShowModal(false);
  };

  // Get waste specifications data
  const wasteSpecificationsData = watch('wasteClassification') || [];
  const entityDetail = watch('entity');

  const { data: entityDetailData } = useQuery({
    queryKey: ['getEntityDetail', entityDetail?.value],
    queryFn: () => getEntityWmsDetail(Number(entityDetail.value)),
    enabled: Boolean(entityDetail?.value),
  });

  return (
    <div className="ui-flex ui-flex-col">
      <div className="ui-p-4 ui-border ui-rounded">
        <div className="ui-grid ui-grid-cols-1 ui-gap-x-6 ui-gap-y-6">
          {isEdit && (
            <EditWasteSpecificationFields
              control={control}
              watch={watch}
              setValue={setValue}
              clearErrors={clearErrors}
              errors={errors}
              wasteTypeOption={wasteTypeOption}
              wasteGroupOption={wasteGroupOption}
              wasteCharacteristicOption={wasteCharacteristicOption}
            />
          )}
          <FormControl>
            <FormLabel required>
              {t('partnership:form.partnership_type.label')}
            </FormLabel>
            <ReactSelect
              {...register('providerType')}
              id="select-asset-status"
              placeholder={t('partnership:form.partnership_type.placeholder')}
              options={getProviderTypeOptions()}
              onChange={(option: OptionType) => {
                setValue('providerType', option?.value);
                clearErrors('providerType');
              }}
              value={getProviderTypeOptions()?.find(
                (x) => x.value === watch('providerType')
              )}
              isClearable
            />
            {errors?.providerType?.message && (
              <FormErrorMessage>
                {errors?.providerType?.message}
              </FormErrorMessage>
            )}
          </FormControl>
          <Controller
            name="entity"
            control={control}
            render={({
              field: { onChange, value, ...field },
              fieldState: { error },
            }) => {
              return (
                <FormControl>
                  <FormLabel htmlFor="select-partnership" required>
                    {t('partnership:form.company_name.label')}
                  </FormLabel>
                  <ReactSelectAsync
                    {...field}
                    id="select-entity"
                    loadOptions={loadEntityList}
                    debounceTimeout={300}
                    isMulti={false}
                    isClearable
                    placeholder={t('partnership:form.company_name.placeholder')}
                    additional={{
                      page: 1,
                      type_ids: '6',
                    }}
                    onChange={(option: OptionType) => {
                      onChange(option);
                      clearErrors('entity');
                      setValue('entity', option);
                    }}
                    value={value as OptionType}
                    error={!!error?.message}
                    disabled={isEdit}
                  />
                  {errors?.entity?.message && (
                    <FormErrorMessage>
                      {errors?.entity?.message}
                    </FormErrorMessage>
                  )}
                </FormControl>
              );
            }}
          />
          <FormControl>
            <FormLabel>{t('partnership:form.nib.label')}</FormLabel>
            <Input
              id="input-nib"
              type="text"
              value={
                entityDetail?.value ? entityDetailData?.data?.nib ?? '-' : ''
              }
              placeholder={t('partnership:form.nib.placeholder')}
              disabled
            />
          </FormControl>
          <FormControl>
            <FormLabel required>
              {t('partnership:form.pic_name.label')}
            </FormLabel>
            <Input
              {...register('picName')}
              id="input-asset-id"
              type="text"
              placeholder={t('partnership:form.pic_name.placeholder')}
              error={!!errors?.picName}
            />
            <FormErrorMessage>
              {errors?.picName?.message as string}
            </FormErrorMessage>
          </FormControl>
          <FormControl>
            <FormLabel required>
              {t('partnership:form.phone_number.label')}
            </FormLabel>
            <Input
              {...register('picPhoneNumber')}
              id="input-asset-id"
              type="number"
              placeholder={t('partnership:form.phone_number.placeholder')}
              error={!!errors?.picPhoneNumber}
              className="[&::-webkit-outer-spin-button]:ui-appearance-none [&::-webkit-inner-spin-button]:ui-appearance-none"
            />
            <FormErrorMessage>
              {errors?.picPhoneNumber?.message as string}
            </FormErrorMessage>
          </FormControl>
          <FormControl>
            <FormLabel required>
              {t('partnership:form.position.label')}
            </FormLabel>
            <Input
              {...register('picPosition')}
              id="position"
              type="text"
              placeholder={t('partnership:form.position.placeholder')}
              error={!!errors?.picPosition}
            />
            <FormErrorMessage>
              {errors?.picPosition?.message as string}
            </FormErrorMessage>
          </FormControl>
          {isEdit && (
            <FormControl>
              <FormLabel required>
                {t('partnership:form.price_kg.label')}
              </FormLabel>
              <InputNumberV2
                {...register('pricePerKg')}
                id="pricePerKg"
                placeholder="0"
                value={getValues('pricePerKg')}
                min={0}
                onValueChange={(values) => {
                  const { floatValue } = values;
                  setValue('pricePerKg', floatValue?.toString());
                }}
              />
              <FormErrorMessage>
                {errors?.pricePerKg?.message as string}
              </FormErrorMessage>
            </FormControl>
          )}
          <Controller
            control={control}
            name="contractDate"
            render={({
              field: { value, onChange, ...field },
              fieldState: { error },
            }) => (
              <FormControl>
                <FormLabel htmlFor="select-contract-date" required>
                  {t('partnership:form.contract_date.label')}
                </FormLabel>
                <DateRangePicker
                  {...field}
                  value={
                    value?.start && value?.end
                      ? {
                          start: parseDate(
                            dayjs(value.start).format('YYYY-MM-DD')
                          ),
                          end: parseDate(dayjs(value.end).format('YYYY-MM-DD')),
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
                {errors?.contractDate?.end?.message && (
                  <FormErrorMessage>
                    {errors.contractDate?.end?.message}
                  </FormErrorMessage>
                )}
              </FormControl>
            )}
          />
          <FormControl>
            <FormLabel required>
              {t('partnership:form.contract_id.label')}
            </FormLabel>
            <Input
              {...register('contractId')}
              id="input-contract-id"
              type="text"
              placeholder={t('partnership:form.contract_id.placeholder')}
              error={!!errors?.contractId}
            />
            <FormErrorMessage>
              {errors?.contractId?.message as string}
            </FormErrorMessage>
          </FormControl>
          <FormControl>
            <FormLabel required>
              {t('partnership:form.partnership_status.label')}
            </FormLabel>
            <ReactSelect
              {...register('partnershipStatus')}
              id="select-asset-status"
              placeholder={t('partnership:form.partnership_status.placeholder')}
              options={partnershipStatusOptions}
              onChange={(option: PartnershipStatusOption) => {
                setValue('partnershipStatus', option?.value);
                clearErrors('partnershipStatus');
              }}
              value={selectedValue}
              isClearable
            />
            {watch('partnershipStatus') ? (
              <p className="ui-text-blue-800">
                {
                  {
                    ACTIVE: t('partnership:status_partnership_info.ACTIVE'),
                    SUSPENDED: t(
                      'partnership:status_partnership_info.SUSPENDED'
                    ),
                    PENDING: t('partnership:status_partnership_info.PENDING'),
                    TERMINATED: t(
                      'partnership:status_partnership_info.TERMINATED'
                    ),
                    EXPIRED: t('partnership:status_partnership_info.EXPIRED'),
                  }[watch('partnershipStatus') as string]
                }
              </p>
            ) : null}
            {errors?.partnershipStatus?.message && (
              <FormErrorMessage>
                {errors?.partnershipStatus?.message}
              </FormErrorMessage>
            )}
          </FormControl>

          {/* For Create: Multiple Waste Specifications */}
          {!isEdit && (
            <>
              {/* Waste Specifications Section */}
              <div className="ui-p-4 ui-border ui-rounded mt-6">
                <div className="ui-flex ui-justify-between ui-items-center ui-mb-4">
                  <h3 className="ui-text-lg">
                    {t('partnership:form.waste_specification.label')}
                  </h3>
                  <Button
                    onClick={handleAddSpecification}
                    type="button"
                    variant="outline"
                  >
                    <span className="ui-mr-2">+</span>
                    {t('partnership:list.button.add_specification')}
                  </Button>
                </div>

                {/* Waste Specifications Table */}
                {wasteSpecificationsData.length > 0 && (
                  <WasteSpecificationTable
                    data={wasteSpecificationsData}
                    onEdit={handleEditSpecification}
                    onRemove={handleRemoveSpecification}
                    onPriceUpdate={handlePriceUpdate}
                  />
                )}

                {/* Validation Error for Waste Specifications */}
                {errors?.wasteClassification?.message && (
                  <div className="ui-mt-2 ui-text-danger-500 ui-text-sm">
                    {errors?.wasteClassification?.message as string}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal for Create only */}
      {!isEdit && (
        <WasteSpecificationModal
          showModal={showModal}
          setShowModal={setShowModal}
          editIndex={editIndex}
          modalForm={modalForm}
          setModalForm={setModalForm}
          handleSaveSpecification={handleSaveSpecification}
          wasteTypeOption={wasteTypeOption}
          wasteGroupOption={wasteGroupOption}
          wasteCharacteristicOption={wasteCharacteristicOption}
          control={control}
          setValue={setValue}
        />
      )}
    </div>
  );
};

export default PartnershipFormInfo;

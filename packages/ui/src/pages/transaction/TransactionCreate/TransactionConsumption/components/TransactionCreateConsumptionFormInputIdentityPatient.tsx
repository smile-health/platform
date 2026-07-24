import React, { Fragment, useContext } from 'react'
import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { FormControl, FormErrorMessage, FormLabel } from '#components/form-control'
import { Input } from '#components/input'
import { OptionType, ReactSelectAsync } from '#components/react-select'
import { InputPhone } from '#components/input-phone'
import { CommonPlaceSelector } from '#components/modules/CommonPlaceSelector'
import { clearField } from '#components/filter'
import { TextArea } from '#components/text-area'
import {
  loadListEducation,
  loadListEthnic,
  loadListGender,
  loadListMaritalStatus,
  loadListOccupation,
  loadListReligion
} from '../transaction-consumption.service'
import { Checkbox } from '#components/checkbox'
import { ProtocolContext } from '../context/ProtocolContext'
import TransactionCreateConsumptionExistDataPatientIdentity from './TransactionCreateConsumptionExistDataPatientIdentity'
import { useTransactionCreateConsumptionFormInputIdentityPatient } from '../hooks/useTransactionCreateConsumptionFormInputIdentityPatient'
import { DatePicker } from '#components/date-picker'
import { isValidDate } from '#utils/date'
import { parseDate } from '@internationalized/date'

const TransactionCreateConsumptionFormInputIdentityPatient: React.FC = () => {
  const {
    methods,
    index,
    indexItem,
  } = useContext(ProtocolContext)
  const { t, i18n: { language } } = useTranslation('transactionCreateConsumption')
  const { t: tCommon } = useTranslation('common')

  const { control, setValue, watch } = methods

  const {
    disabledResidentialFields,
    dataIdentity,
    handleCheckMathedAddress,
    setKeyField,
    handleChangeLocation,
    hideFieldRelatedIdentityNIK,
  } = useTransactionCreateConsumptionFormInputIdentityPatient({
    methods,
    index
  })

  return (
    <div className="ui-flex ui-flex-col ui-space-y-5 ui-w-full">
      <TransactionCreateConsumptionExistDataPatientIdentity data={watch(`data.${index}`)} />

      <Controller
        key={`full-name-${indexItem}-${index}`}
        control={control}
        name={`data.${index}.identity.full_name`}
        render={({
          field: { value, onChange, ...field },
          fieldState: { error },
        }) => (
          <FormControl>
            <FormLabel required>{t('patient_identity.identity.full_name.label')}</FormLabel>
            <Input
              {...field}
              id={`input-full-name-${indexItem}-${index}`}
              placeholder={t('patient_identity.identity.full_name.placeholder')}
              value={value ?? ''}
              type="text"
              error={!!error?.message}
              onChange={(e) => {
                onChange(e.target.value)
              }}
            />
            {error?.message && (
              <FormErrorMessage>{error?.message}</FormErrorMessage>
            )}
          </FormControl>
        )}
      />

      {!hideFieldRelatedIdentityNIK && (
        <Fragment>
          <Controller
            key={`gender-${indexItem}-${index}`}
            control={control}
            name={`data.${index}.identity.gender`}
            render={({
              field: { onChange, ...field },
              fieldState: { error },
            }) => (
              <FormControl key={language}>
                <FormLabel required>{t('patient_identity.identity.gender.label')}</FormLabel>
                <ReactSelectAsync
                  {...field}
                  placeholder={t('patient_identity.identity.gender.placeholder')}
                  loadOptions={loadListGender}
                  additional={{
                    page: 1,
                  }}
                  onChange={(e) => onChange(e)}
                />
                {error?.message && (
                  <FormErrorMessage>{error?.message}</FormErrorMessage>
                )}
              </FormControl>
            )}
          />

          <Controller
            key={`birdt-date-${indexItem}-${index}`}
            control={control}
            name={`data.${index}.identity.birth_date`}
            render={({
              field: { onChange, value, ...field },
              fieldState: { error },
            }) => {
              return (
                <FormControl>
                  <FormLabel required>
                    {t('patient_identity.identity.birth_date.label')}
                  </FormLabel>
                  <DatePicker
                    {...field}
                    id={`datepicker-birthday-${indexItem}-${index}`}
                    data-testid={`datepicker-birthday-${indexItem}-${index}`}
                    value={
                      value && isValidDate(value) ? parseDate(value) : null
                    }
                    maxValue={parseDate(
                      dayjs(new Date()).format('YYYY-MM-DD')
                    )}
                    onChange={(date) => {
                      if (!date) {
                        onChange('')
                        return
                      }
                      const newDate = new Date(date.toString())
                      onChange(dayjs(newDate).format('YYYY-MM-DD'))
                    }}
                    error={!!error?.message}
                  />
                  {error?.message && (
                    <FormErrorMessage>{error?.message}</FormErrorMessage>
                  )}
                </FormControl>
              )
            }}
          />
        </Fragment>
      )}

      <Controller
        key={`phone-number-${indexItem}-${index}`}
        control={control}
        name={`data.${index}.identity.phone_number`}
        render={({
          field: { value, onChange, ...field },
          fieldState: { error },
        }) => (
          <FormControl>
            <FormLabel required>{t('patient_identity.phone_number')}</FormLabel>

            <InputPhone
              {...field}
              id={`phone-number-${indexItem}-${index}`}
              data-testid={`phone-number-${indexItem}-${index}`}
              error={!!error?.message}
              onChange={(value) => onChange(value || '')}
              value={value ?? ''}
              placeholder={t('patient_identity.phone_number')}
            />
            {error?.message && (
              <FormErrorMessage>{error?.message}</FormErrorMessage>
            )}
          </FormControl>
        )}
      />

      <Controller
        key={`status-${indexItem}-${index}`}
        control={control}
        name={`data.${index}.identity.marital_status`}
        render={({
          field: { onChange, ...field },
          fieldState: { error },
        }) => (
          <FormControl>
            <FormLabel>{t('patient_identity.identity.status.label')}</FormLabel>
            <ReactSelectAsync
              {...field}
              id={`select-status-${indexItem}-${index}`}
              placeholder={t('patient_identity.identity.status.placeholder')}
              loadOptions={loadListMaritalStatus}
              additional={{
                page: 1,
              }}
              onChange={(e) => onChange(e)}
              menuPosition="fixed"
            />
            {error?.message && (
              <FormErrorMessage>{error?.message}</FormErrorMessage>
            )}
          </FormControl>
        )}
      />

      <Controller
        key={`last-education-${indexItem}-${index}`}
        control={control}
        name={`data.${index}.identity.last_education`}
        render={({
          field: { onChange, ...field },
          fieldState: { error },
        }) => (
          <FormControl>
            <FormLabel>{t('patient_identity.identity.last_education.label')}</FormLabel>
            <ReactSelectAsync
              {...field}
              id={`select-last-education-${indexItem}-${index}`}
              placeholder={t('patient_identity.identity.last_education.placeholder')}
              loadOptions={loadListEducation}
              additional={{
                page: 1,
              }}
              onChange={(e) => onChange(e)}
              menuPosition="fixed"
            />
            {error?.message && (
              <FormErrorMessage>{error?.message}</FormErrorMessage>
            )}
          </FormControl>
        )}
      />

      <Controller
        key={`occupation-${indexItem}-${index}`}
        control={control}
        name={`data.${index}.identity.occupation`}
        render={({
          field: { onChange, ...field },
          fieldState: { error },
        }) => (
          <FormControl>
            <FormLabel>{t('patient_identity.identity.work.label')}</FormLabel>
            <ReactSelectAsync
              {...field}
              id={`select-work-${indexItem}-${index}`}
              placeholder={t('patient_identity.identity.work.placeholder')}
              loadOptions={loadListOccupation}
              additional={{
                page: 1,
              }}
              onChange={(e) => onChange(e)}
              menuPosition="fixed"
            />
            {error?.message && (
              <FormErrorMessage>{error?.message}</FormErrorMessage>
            )}
          </FormControl>
        )}
      />

      <Controller
        key={`religion-${indexItem}-${index}`}
        control={control}
        name={`data.${index}.identity.religion`}
        render={({
          field: { onChange, ...field },
          fieldState: { error },
        }) => (
          <FormControl>
            <FormLabel>{t('patient_identity.identity.religion.label')}</FormLabel>
            <ReactSelectAsync
              {...field}
              id={`select-religion-${indexItem}-${index}`}
              placeholder={t('patient_identity.identity.religion.placeholder')}
              loadOptions={loadListReligion}
              additional={{
                page: 1,
              }}
              onChange={(e) => onChange(e)}
              menuPosition="fixed"
            />
            {error?.message && (
              <FormErrorMessage>{error?.message}</FormErrorMessage>
            )}
          </FormControl>
        )}
      />

      <Controller
        key={`ethnic-${indexItem}-${index}`}
        control={control}
        name={`data.${index}.identity.ethnic`}
        render={({
          field: { onChange, ...field },
          fieldState: { error },
        }) => (
          <FormControl>
            <FormLabel>{t('patient_identity.identity.ethnic.label')}</FormLabel>
            <ReactSelectAsync
              {...field}
              id={`select-ethnic-${indexItem}-${index}`}
              placeholder={t('patient_identity.identity.ethnic.placeholder')}
              loadOptions={loadListEthnic}
              additional={{
                page: 1,
              }}
              onChange={(e) => onChange(e)}
              menuPosition="fixed"
            />
            {error?.message && (
              <FormErrorMessage>{error?.message}</FormErrorMessage>
            )}
          </FormControl>
        )}
      />

      <Controller
        key={`province-${indexItem}-${index}`}
        control={control}
        name={`data.${index}.identity.province`}
        render={(
          {
            field: { onChange, ...field },
            fieldState: { error }
          }
        ) => (
          <FormControl>
            <FormLabel>{tCommon('form.province.label')}</FormLabel>
            <CommonPlaceSelector
              {...field}
              id={`select-province-${indexItem}-${index}`}
              level="province"
              additional={{
                page: 1,
              }}
              isClearable
              onChange={(option) => {
                onChange(option)
                clearField({
                  setValue,
                  name: [
                    `data.${index}.identity.regency`,
                    `data.${index}.identity.sub_district`,
                    `data.${index}.identity.village`,
                  ],
                })
                handleChangeLocation(option as OptionType, 'province_residential')
              }}
              menuPosition='fixed'
            />

            {error?.message && (
              <FormErrorMessage>{error?.message}</FormErrorMessage>
            )}
          </FormControl>
        )}
      />

      <Controller
        key={`regency-${setKeyField([indexItem, index, dataIdentity.province?.value])}`}
        control={control}
        name={`data.${index}.identity.regency`}
        render={(
          {
            field: { onChange, ...field },
            fieldState: { error }
          }
        ) => (
          <FormControl>
            <FormLabel>{tCommon('form.city.label')}</FormLabel>
            <CommonPlaceSelector
              {...field}
              id={`select-regency-${indexItem}-${index}`}
              level="regency"
              additional={{
                page: 1,
                parent_id: dataIdentity.province?.value,
              }}
              isClearable
              onChange={(option) => {
                onChange(option)
                clearField({
                  setValue,
                  name: [
                    `data.${index}.identity.sub_district`,
                    `data.${index}.identity.village`,
                  ],
                })
                handleChangeLocation(option as OptionType, 'regency_residential')
              }}
              menuPosition='fixed'
            />

            {error?.message && (
              <FormErrorMessage>{error?.message}</FormErrorMessage>
            )}
          </FormControl>
        )}
      />

      {/* 
      // TODO: feedback from UNDP (enabled when needed)
      <Controller
        key={`sub-district-${setKeyField([indexItem, index, dataIdentity.regency?.value])}`}
        control={control}
        name={`data.${index}.identity.sub_district`}
        render={(
          {
            field: { onChange, ...field },
            fieldState: { error }
          }
        ) => (
          <FormControl>
            <FormLabel>{tCommon('form.subdistrict.label')}</FormLabel>
            <CommonPlaceSelector
              {...field}
              id={`select-subdistrict-${indexItem}-${index}`}
              level="subdistrict"
              additional={{
                page: 1,
                parent_id: dataIdentity.regency?.value,
              }}
              isClearable
              onChange={(option) => {
                onChange(option)
                clearField({
                  setValue,
                  name: [
                    `data.${index}.identity.village`,
                  ],
                })
                handleChangeLocation(option as OptionType, 'sub_district_residential')
              }}
              menuPosition='fixed'
            />

            {error?.message && (
              <FormErrorMessage>{error?.message}</FormErrorMessage>
            )}
          </FormControl>
        )}
      />

      <Controller
        key={`vilage-${setKeyField([indexItem, index, dataIdentity.sub_district?.value])}`}
        control={control}
        name={`data.${index}.identity.village`}
        render={(
          {
            field: { onChange, ...field },
            fieldState: { error }
          }
        ) => (
          <FormControl>
            <FormLabel>{tCommon('form.village.label')}</FormLabel>
            <CommonPlaceSelector
              {...field}
              id={`select-village-${indexItem}-${index}`}
              level="village"
              additional={{
                page: 1,
                parent_id: dataIdentity.sub_district?.value,
              }}
              isClearable
              onChange={(option) => {
                onChange(option)
                handleChangeLocation(option as OptionType, 'village_residential')
              }}
              menuPosition='fixed'
            />

            {error?.message && (
              <FormErrorMessage>{error?.message}</FormErrorMessage>
            )}
          </FormControl>
        )}
      /> */}

      <Controller
        key={`registered-address-${indexItem}-${index}`}
        control={control}
        name={`data.${index}.identity.registered_address`}
        render={(
          {
            field: { onChange, ...field },
            fieldState: { error }
          }
        ) => (
          <FormControl>
            <FormLabel>{t('patient_identity.identity.registered_address.label')}</FormLabel>
            <TextArea
              {...field}
              id={`registered-address-${indexItem}-${index}`}
              placeholder={t('patient_identity.identity.registered_address.placeholder')}
              error={!!error?.message}
              value={field.value ?? ''}
              onChange={(e) => {
                onChange(e.target.value)
                handleChangeLocation(e.target.value, 'residential_address')
              }}
            />

            {error?.message && (
              <FormErrorMessage>{error?.message}</FormErrorMessage>
            )}
          </FormControl>
        )}
      />

      <Controller
        key={`resedential-${indexItem}-${index}`}
        control={control}
        name={`data.${index}.identity.is_matched_address`}
        render={(
          {
            field: { onChange, value, ...field },
            fieldState: { error }
          }
        ) => (
          <FormControl>
            <Checkbox
              {...field}
              data-testid="cbx-is-matched-address"
              label={t('patient_identity.identity.is_matched_address.label')}
              checked={!!value}
              onChange={e => {
                onChange(e.target.checked ? 1 : 0)
                handleCheckMathedAddress(!!e.target.checked)
              }}
            />

            {error?.message && (
              <FormErrorMessage>{error?.message}</FormErrorMessage>
            )}
          </FormControl>
        )}
      />

      <Controller
        key={`province-residential-${indexItem}-${index}`}
        control={control}
        name={`data.${index}.identity.province_residential`}
        render={(
          {
            field: { onChange, ...field },
            fieldState: { error }
          }
        ) => (
          <FormControl>
            <FormLabel>{tCommon('form.province.label')}</FormLabel>
            <CommonPlaceSelector
              {...field}
              id={`select-province-residential-${indexItem}-${index}`}
              level="province"
              additional={{
                page: 1,
              }}
              isClearable
              onChange={(option) => {
                onChange(option)
                clearField({
                  setValue,
                  name: [
                    `data.${index}.identity.regency_residential`,
                    `data.${index}.identity.sub_district_residential`,
                    `data.${index}.identity.village_residential`,
                  ],
                })
              }}
              menuPosition='fixed'
              disabled={disabledResidentialFields}
            />

            {error?.message && (
              <FormErrorMessage>{error?.message}</FormErrorMessage>
            )}
          </FormControl>
        )}
      />

      <Controller
        key={`regency-residential-${setKeyField([indexItem, index, dataIdentity.province_residential?.value])}`}
        control={control}
        name={`data.${index}.identity.regency_residential`}
        render={(
          {
            field: { onChange, ...field },
            fieldState: { error }
          }
        ) => (
          <FormControl>
            <FormLabel>{tCommon('form.city.label')}</FormLabel>
            <CommonPlaceSelector
              {...field}
              id={`select-regency-residential-${indexItem}-${index}`}
              level="regency"
              additional={{
                page: 1,
                parent_id: dataIdentity.province_residential?.value,
              }}
              isClearable
              onChange={(option) => {
                onChange(option)
                clearField({
                  setValue,
                  name: [
                    `data.${index}.identity.sub_district_residential`,
                    `data.${index}.identity.village_residential`,
                  ],
                })
              }}
              menuPosition='fixed'
              disabled={disabledResidentialFields}
            />

            {error?.message && (
              <FormErrorMessage>{error?.message}</FormErrorMessage>
            )}
          </FormControl>
        )}
      />

      {/* 
      // TODO: feedback from UNDP (enabled when needed)
      <Controller
        key={`sub-district-residential-${setKeyField([indexItem, index, dataIdentity.regency_residential?.value])}`}
        control={control}
        name={`data.${index}.identity.sub_district_residential`}
        render={(
          {
            field: { onChange, ...field },
            fieldState: { error }
          }
        ) => (
          <FormControl>
            <FormLabel>{tCommon('form.subdistrict.label')}</FormLabel>
            <CommonPlaceSelector
              {...field}
              id={`select-subdistrict-residential-${indexItem}-${index}`}
              level="subdistrict"
              additional={{
                page: 1,
                parent_id: dataIdentity.regency_residential?.value,
              }}
              isClearable
              onChange={(option) => {
                onChange(option)
                clearField({
                  setValue,
                  name: [
                    `data.${index}.identity.village_residential`,
                  ],
                })
              }}
              menuPosition='fixed'
              disabled={disabledResidentialFields}
            />

            {error?.message && (
              <FormErrorMessage>{error?.message}</FormErrorMessage>
            )}
          </FormControl>
        )}
      />

      <Controller
        key={`vilage-residential-${setKeyField([indexItem, index, dataIdentity.sub_district_residential?.value])}`}
        control={control}
        name={`data.${index}.identity.village_residential`}
        render={(
          {
            field: { onChange, ...field },
            fieldState: { error }
          }
        ) => (
          <FormControl>
            <FormLabel>{tCommon('form.village.label')}</FormLabel>
            <CommonPlaceSelector
              {...field}
              id={`select-village-${indexItem}-${index}`}
              level="village"
              additional={{
                page: 1,
                parent_id: dataIdentity.sub_district_residential?.value,
              }}
              isClearable
              onChange={(option) => {
                onChange(option)
              }}
              menuPosition='fixed'
              disabled={disabledResidentialFields}
            />

            {error?.message && (
              <FormErrorMessage>{error?.message}</FormErrorMessage>
            )}
          </FormControl>
        )}
      /> */}

      <Controller
        key={`resedential-address-description-${indexItem}-${index}`}
        control={control}
        name={`data.${index}.identity.residential_address`}
        render={(
          {
            field: { onChange, ...field },
            fieldState: { error }
          }
        ) => (
          <FormControl>
            <FormLabel>{t('patient_identity.identity.residential_address_description.label')}</FormLabel>
            <TextArea
              {...field}
              id={`residential-address-${indexItem}-${index}`}
              placeholder={t('patient_identity.identity.residential_address_description.placeholder')}
              error={!!error?.message}
              value={field.value ?? ''}
              onChange={(e) =>
                onChange(e.target.value)
              }
              disabled={disabledResidentialFields}
            />

            {error?.message && (
              <FormErrorMessage>{error?.message}</FormErrorMessage>
            )}
          </FormControl>
        )}
      />
    </div>
  )
}

export default TransactionCreateConsumptionFormInputIdentityPatient
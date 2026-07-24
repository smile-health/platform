import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '@repo/ui/components/form-control';
import { Input } from '@repo/ui/components/input';
import { OptionType } from '@repo/ui/components/react-select';
import { TextArea } from '@repo/ui/components/text-area';
import React, { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { clearField } from '@repo/ui/components/filter';
import { CommonPlaceSelector } from '@repo/ui/components/modules/CommonPlaceSelector';
import { TreatmentLocationFormData } from '../../schema/TreatmentLocationFormSchema';
import { ModalYoutubeLatLong } from '@/components/ModalYoutubeLatLong';
import { Button } from '@repo/ui/components/button';

const TreatmentLocationFormInfo: React.FC = () => {
  const { t } = useTranslation(['treatmentLocation', 'common']);
  const [openModalYoutube, setOpenModalYoutube] = useState(false);

  const {
    control,
    setValue,
    clearErrors,
    watch,
    formState: { errors },
  } = useFormContext<TreatmentLocationFormData>();

  const { province } = watch();

  return (
    <div className="ui-flex ui-flex-col">
      <div className="ui-p-4 ui-border ui-rounded">
        <div className="ui-grid ui-grid-cols-1 ui-gap-x-6 ui-gap-y-6">
          <Controller
            name="locationName"
            control={control}
            render={({
              field: { onChange, value, ...field },
              fieldState: { error },
            }) => {
              return (
                <FormControl>
                  <FormLabel required>
                    {t('treatmentLocation:form.location_name.label')}
                  </FormLabel>
                  <Input
                    {...field}
                    id="input-location-name"
                    type="text"
                    placeholder={t(
                      'treatmentLocation:form.location_name.placeholder'
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

          <div className="ui-flex ui-flex-row ui-gap-2 ui-justify-between">
            <Controller
              name="latitude"
              control={control}
              render={({
                field: { onChange, value, ...field },
                fieldState: { error },
              }) => {
                return (
                  <FormControl className="ui-flex-1">
                    <FormLabel required>
                      {t('treatmentLocation:form.latitude.label')}
                    </FormLabel>
                    <Input
                      {...field}
                      id="input-latitude"
                      type="text"
                      placeholder={t(
                        'treatmentLocation:form.latitude.placeholder'
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
              name="longitude"
              control={control}
              render={({
                field: { onChange, value, ...field },
                fieldState: { error },
              }) => {
                return (
                  <FormControl className="ui-flex-1">
                    <FormLabel required>
                      {t('treatmentLocation:form.longitude.label')}
                    </FormLabel>
                    <Input
                      {...field}
                      id="input-longitude"
                      type="text"
                      placeholder={t(
                        'treatmentLocation:form.longitude.placeholder'
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
          </div>
          {/* setting lat long */}
          <Button
            variant="light"
            type="button"
            className="w-fit"
            onClick={() => setOpenModalYoutube(true)}
          >
            {t('common:setting_latlong.title')}
          </Button>
          <Controller
            name="address"
            control={control}
            render={({
              field: { onChange, value, ...field },
              fieldState: { error },
            }) => {
              return (
                <FormControl>
                  <FormLabel>
                    {t('treatmentLocation:form.address.label')}
                  </FormLabel>
                  <TextArea
                    {...field}
                    id="input-address"
                    placeholder={t(
                      'treatmentLocation:form.address.placeholder'
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
            name="province"
            control={control}
            render={({ field: { value, onChange, ...field } }) => (
              <FormControl>
                <FormLabel>{t('common:form.province.label')}</FormLabel>
                <CommonPlaceSelector
                  {...field}
                  id="select-province"
                  level="province"
                  additional={{
                    page: 1,
                  }}
                  isClearable
                  value={value as OptionType}
                  onChange={(option: OptionType) => {
                    onChange(option);
                    setValue('province', option);
                    clearErrors('province');
                    clearField({
                      setValue,
                      name: ['city'],
                    });
                  }}
                />

                {errors.province?.message && (
                  <FormErrorMessage>
                    {errors.province?.message}
                  </FormErrorMessage>
                )}
              </FormControl>
            )}
          />

          <Controller
            name="city"
            control={control}
            render={({ field: { value, onChange, ...field } }) => (
              <FormControl>
                <FormLabel>{t('common:form.city.label')}</FormLabel>
                <CommonPlaceSelector
                  {...field}
                  id="select-city"
                  level="regency"
                  disabled={!province}
                  additional={{
                    page: 1,
                    parent_id: Number(province?.value),
                  }}
                  value={value as OptionType}
                  isClearable
                  onChange={(option: OptionType) => {
                    onChange(option);
                    setValue('city', option);
                    clearErrors('city');
                  }}
                />
                {errors.city?.message && (
                  <FormErrorMessage>{errors.city?.message}</FormErrorMessage>
                )}
              </FormControl>
            )}
          />
        </div>
      </div>
      <ModalYoutubeLatLong
        openModalYoutube={openModalYoutube}
        setOpenModalYoutube={setOpenModalYoutube}
      />
    </div>
  );
};

export default TreatmentLocationFormInfo;

import React, { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { TEntityLocation } from '@/types/entity-location';
import { getUserStorage } from '@/utils/storage/user';
import { Button } from '@repo/ui/components/button';
import { clearField } from '@repo/ui/components/filter';
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '@repo/ui/components/form-control';
import { Input } from '@repo/ui/components/input';
import { CommonPlaceSelector } from '@repo/ui/components/modules/CommonPlaceSelector';
import { OptionType } from '@repo/ui/components/react-select';
import { TextArea } from '@repo/ui/components/text-area';
import { HealthcareStorageLocationSchemaFormData } from '../../schema/HealthcareStorageLocationSchemaForm';
import { isFacilityAdmin } from '@/utils/getUserRole';
import { ModalYoutubeLatLong } from '@/components/ModalYoutubeLatLong';

interface HealthcareStorageLocationFormInfoProps {
  entityLocation?: TEntityLocation;
  isFound: boolean;
  isLoading: boolean;
  isEditMode: boolean;
  setIsEditMode: (value: boolean) => void;
}

const HealthcareStorageLocationFormInfo: React.FC<HealthcareStorageLocationFormInfoProps> = ({
  entityLocation,
  isFound,
  isLoading,
  isEditMode,
  setIsEditMode,
}) => {
  const user = getUserStorage();
  const { t } = useTranslation(['healthcareStorageLocation', 'common']);
  const [openModalYoutube, setOpenModalYoutube] = useState(false);

  const {
    control,
    setValue,
    clearErrors,
    watch,
    formState: { errors },
  } = useFormContext<HealthcareStorageLocationSchemaFormData>();

  const { province } = watch();

  return (
    <>
      {!isEditMode && (
        <div className="ui-p-4 ui-mt-6 ui-border ui-border-neutral-300 ui-rounded ui-space-y-4">
          <div className="ui-flex ui-flex-col ui-gap-5">
            {isFacilityAdmin() && (
              <Button
                variant="outline"
                type="button"
                className="ui-self-end ui-w-fit"
                onClick={() => setIsEditMode(true)}
              >
                Edit
              </Button>
            )}

            <div className="ui-flex ui-flex-row ui-gap-10 ui-items-center">
              <div className="ui-w-1/5">
                <p className="ui-w-fit ui-text-gray-400">
                  {t('healthcareStorageLocation:form.facility_name.label')}
                </p>
              </div>
              <span>:</span>

              <p>
                {isFound
                  ? entityLocation?.entityName || user?.entity?.name
                  : '-'}
              </p>
            </div>
            <div className="ui-flex ui-flex-row ui-gap-10 ui-items-center">
              <div className="ui-w-1/5">
                <p className="ui-w-fit ui-text-gray-400">
                  {t('healthcareStorageLocation:form.location_name.label')}
                </p>
              </div>
              <span>:</span>

              <p>{isFound ? entityLocation?.locationName : '-'}</p>
            </div>
            <div className="ui-flex ui-flex-row ui-gap-10 ui-items-center">
              <div className="ui-w-1/5">
                <p className="ui-w-fit ui-text-gray-400">
                  {t('healthcareStorageLocation:form.latitude.label')}
                </p>
              </div>
              <span>:</span>

              <p>{isFound ? entityLocation?.latitude : '-'}</p>
            </div>
            <div className="ui-flex ui-flex-row ui-gap-10 ui-items-center">
              <div className="ui-w-1/5">
                <p className="ui-w-fit ui-text-gray-400">
                  {t('healthcareStorageLocation:form.longitude.label')}
                </p>
              </div>
              <span>:</span>

              <p>{isFound ? entityLocation?.longitude : '-'}</p>
            </div>
            <div className="ui-flex ui-flex-row ui-gap-10 ui-items-center">
              <div className="ui-w-1/5">
                <p className="ui-w-fit ui-text-gray-400">
                  {t('healthcareStorageLocation:form.address.label')}
                </p>
              </div>
              <span>:</span>

              <p>{isFound ? entityLocation?.address : '-'}</p>
            </div>
            <div className="ui-flex ui-flex-row ui-gap-10 ui-items-center">
              <div className="ui-w-1/5">
                <p className="ui-w-fit ui-text-gray-400">
                  {t('healthcareStorageLocation:form.province.label')}
                </p>
              </div>
              <span>:</span>

              <p>{isFound ? entityLocation?.provinceName : '-'}</p>
            </div>
            <div className="ui-flex ui-flex-row ui-gap-10 ui-items-center">
              <div className="ui-w-1/5">
                <p className="ui-w-fit ui-text-gray-400">
                  {t('healthcareStorageLocation:form.city.label')}
                </p>
              </div>
              <span>:</span>

              <p>{isFound ? entityLocation?.cityName : '-'}</p>
            </div>
            <div className="ui-flex ui-flex-row ui-gap-10 ui-items-center">
              <div className="ui-w-1/5">
                <p className="ui-w-fit ui-text-gray-400">
                  {t('healthcareStorageLocation:form.distance_limit.label')}
                </p>
              </div>
              <span>:</span>

              <p>
                {isFound
                  ? entityLocation?.distanceLimitInMeters + ' meters'
                  : '-'}
              </p>
            </div>
          </div>
        </div>
      )}

      {isEditMode && (
        <div className="ui-w-full ui-space-y-6 ui-max-w-form ui-mx-auto">
          <div className="ui-flex ui-flex-col">
            <div className="ui-p-4 ui-border ui-rounded">
              <div className="ui-grid ui-grid-cols-1 ui-gap-x-6 ui-gap-y-6">
                <Controller
                  name="facilityName"
                  control={control}
                  render={({ field: { value, ...field } }) => {
                    return (
                      <FormControl>
                        <FormLabel required>
                          {t(
                            'healthcareStorageLocation:form.facility_name.label'
                          )}
                        </FormLabel>
                        <Input
                          {...field}
                          id="input-facility-name"
                          type="text"
                          placeholder={t(
                            'healthcareStorageLocation:form.facility_name.placeholder'
                          )}
                          value={
                            entityLocation?.entityName || user?.entity?.name
                          }
                          disabled
                        />
                      </FormControl>
                    );
                  }}
                />

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
                          {t(
                            'healthcareStorageLocation:form.location_name.label'
                          )}
                        </FormLabel>
                        <Input
                          {...field}
                          id="input-location-name"
                          type="text"
                          placeholder={t(
                            'healthcareStorageLocation:form.location_name.placeholder'
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
                            {t('healthcareStorageLocation:form.latitude.label')}
                          </FormLabel>
                          <Input
                            {...field}
                            id="input-latitude"
                            type="text"
                            placeholder={t(
                              'healthcareStorageLocation:form.latitude.placeholder'
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
                            {t(
                              'healthcareStorageLocation:form.longitude.label'
                            )}
                          </FormLabel>
                          <Input
                            {...field}
                            id="input-longitude"
                            type="text"
                            placeholder={t(
                              'healthcareStorageLocation:form.longitude.placeholder'
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
                          {t('healthcareStorageLocation:form.address.label')}
                        </FormLabel>
                        <TextArea
                          {...field}
                          id="input-address"
                          placeholder={t(
                            'healthcareStorageLocation:form.address.placeholder'
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
                        <FormErrorMessage>
                          {errors.city?.message}
                        </FormErrorMessage>
                      )}
                    </FormControl>
                  )}
                />

                <Controller
                  name="distanceLimitInMeters"
                  control={control}
                  render={({
                    field: { onChange, value, ...field },
                    fieldState: { error },
                  }) => {
                    return (
                      <FormControl>
                        <FormLabel>
                          {t(
                            'healthcareStorageLocation:form.distance_limit.label'
                          )}
                        </FormLabel>
                        <Input
                          {...field}
                          id="input-distance-limit"
                          type="number"
                          placeholder={t(
                            'healthcareStorageLocation:form.distance_limit.placeholder'
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
            </div>
          </div>

          <div className="ui-flex ui-justify-end">
            <div className="ui-grid ui-grid-cols-2 ui-w-[300px] ui-gap-2">
              <Button
                id="btn-back"
                type="button"
                variant="outline"
                onClick={() => setIsEditMode(false)}
              >
                {t('common:back')}
              </Button>
              <Button id="btn-submit" type="submit" loading={isLoading}>
                {t('common:save')}
              </Button>
            </div>
          </div>
        </div>
      )}
      <ModalYoutubeLatLong
        openModalYoutube={openModalYoutube}
        setOpenModalYoutube={setOpenModalYoutube}
      />
    </>
  );
};

export default HealthcareStorageLocationFormInfo;

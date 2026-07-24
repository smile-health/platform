import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { Input } from '#components/input'
import { CommonPlaceSelector } from '#components/modules/CommonPlaceSelector'
import { OptionType } from '#components/react-select'
import { getReactSelectValue } from '#utils/react-select'
import { clearField } from '#utils/form'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { TFormData, TFormValidationKeys } from '../../hooks/useEntityForm'

const EntityFormLocation = () => {
  const { t } = useTranslation(['entity', 'common'])

  const {
    control,
    register,
    formState: { errors },
    setValue,
    watch,
    clearErrors,
  } = useFormContext<TFormData>()

  const { province, regency, sub_district } = watch()

  return (
    <div className="ui-p-4 ui-border ui-border-neutral-300 ui-rounded">
      <div className="ui-mb-4 ui-font-bold">
        {t('entity:form.location.title')}
      </div>

      <div className="ui-grid ui-grid-cols-1 ui-gap-x-6 ui-gap-y-6">
        <Controller
          name="province"
          control={control}
          render={({ field: { onChange, ...field } }) => (
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
                onChange={(option: OptionType) => {
                  onChange(option)
                  setValue('province_id', option?.value)
                  clearErrors('province_id')
                  clearField({
                    setValue,
                    name: [
                      'regency',
                      'regency_id',
                      'sub_district',
                      'sub_district_id',
                      'village',
                      'village_id',
                    ],
                  })
                }}
              />

              {errors.province?.message && (
                <FormErrorMessage>{errors.province?.message}</FormErrorMessage>
              )}
            </FormControl>
          )}
        />
        <div className="ui-grid ui-grid-cols-2 ui-gap-x-6 ui-gap-y-6">
          <Controller
            name="regency"
            control={control}
            render={({ field: { onChange, ...field } }) => (
              <FormControl>
                <FormLabel>{t('common:form.city.label')}</FormLabel>
                <CommonPlaceSelector
                  {...field}
                  id="select-regency"
                  level="regency"
                  disabled={!province}
                  additional={{
                    page: 1,
                    parent_id: getReactSelectValue(province),
                  }}
                  isClearable
                  onChange={(option: OptionType) => {
                    onChange(option)
                    setValue('regency_id', option?.value)
                    clearErrors('regency_id')
                    clearField({
                      setValue,
                      name: [
                        'sub_district',
                        'sub_district_id',
                        'village',
                        'village_id',
                      ],
                    })
                  }}
                />
                {errors.regency_id?.message && (
                  <FormErrorMessage>
                    {errors.regency_id?.message}
                  </FormErrorMessage>
                )}
              </FormControl>
            )}
          />
          <Controller
            name="sub_district"
            control={control}
            render={({ field: { onChange, ...field } }) => (
              <FormControl>
                <FormLabel>{t('common:form.subdistrict.label')}</FormLabel>
                <CommonPlaceSelector
                  {...field}
                  id="select-subdistrict"
                  level="subdistrict"
                  disabled={!regency}
                  additional={{
                    page: 1,
                    parent_id: getReactSelectValue(regency),
                  }}
                  isClearable
                  onChange={(option: OptionType) => {
                    onChange(option)
                    setValue('sub_district_id', option?.value)
                    clearErrors('sub_district_id')
                    clearField({
                      setValue,
                      name: ['village', 'village_id'],
                    })
                  }}
                />
                {errors.sub_district_id?.message && (
                  <FormErrorMessage>
                    {errors.sub_district_id?.message}
                  </FormErrorMessage>
                )}
              </FormControl>
            )}
          />
          <Controller
            name="village"
            control={control}
            render={({ field: { onChange, ...field } }) => (
              <FormControl>
                <FormLabel>{t('common:form.village.label')}</FormLabel>
                <CommonPlaceSelector
                  {...field}
                  id="select-village"
                  level="village"
                  disabled={!sub_district}
                  additional={{
                    page: 1,
                    parent_id: getReactSelectValue(sub_district),
                  }}
                  isClearable
                  onChange={(option: OptionType) => {
                    onChange(option)
                    clearErrors('village_id')
                    setValue('village_id', option?.value)
                  }}
                />
                {errors.village_id?.message && (
                  <FormErrorMessage>
                    {errors.village_id?.message}
                  </FormErrorMessage>
                )}
              </FormControl>
            )}
          />
          <FormControl>
            <FormLabel>{t('entity:form.location.label.postal')}</FormLabel>
            <Input
              {...register('postal_code')}
              id="input-postal-code"
              placeholder={`${t('common:example')} : 61234`}
              maxLength={255}
            />
          </FormControl>
        </div>
        <FormControl>
          <FormLabel required>
            {t('entity:form.location.label.address')}
          </FormLabel>
          <Input
            {...register('address')}
            id="input-address"
            placeholder={t('entity:form.location.label.address')}
            maxLength={255}
          />
          {errors?.address?.message && (
            <FormErrorMessage>
              {t(errors?.address?.message as TFormValidationKeys)}
            </FormErrorMessage>
          )}
        </FormControl>
        <div className="ui-grid ui-grid-cols-2 ui-gap-x-6">
          <FormControl>
            <FormLabel>Latitude</FormLabel>
            <Input
              {...register('lat')}
              id="input-lat"
              placeholder={`${t('common:example')} : -6.1856307`}
              maxLength={255}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Longitude</FormLabel>
            <Input
              {...register('lng')}
              id="input-lng"
              placeholder={`${t('common:example')} : 106.8195533`}
              maxLength={255}
            />
          </FormControl>
        </div>
      </div>
    </div>
  )
}

export default EntityFormLocation

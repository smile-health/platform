import { Fragment } from 'react'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { Input } from '#components/input'
import { OptionType, ReactSelectAsync } from '#components/react-select'
import { TextArea } from '#components/text-area'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { loadAssetVendorType } from '../asset-vendor.service'
import { CreateAssetVendorBody } from '../asset-vendor.type'

const AssetVendorFormDetail = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation('assetVendor')
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CreateAssetVendorBody>()
  return (
    <div className="ui-p-4 ui-border ui-rounded">
      <div className="ui-mb-4 ui-font-bold ui-text-primary ui-text-dark-blue">
        {t('form.title.detail')}
      </div>
      <div className="ui-flex ui-flex-col ui-space-y-5">
        <div className="ui-grid ui-grid-cols-2 ui-gap-5">
          <FormControl>
            <FormLabel required>{t('form.detail.label.name')}</FormLabel>
            <Input
              {...register('name')}
              id="input-asset-vendor-name"
              placeholder={t('form.detail.placeholder.name')}
              error={!!errors?.name?.message}
            />
            {errors?.name?.message && (
              <FormErrorMessage>{errors?.name?.message}</FormErrorMessage>
            )}
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="select-vendor-type" required>
              {t('form.detail.label.type')}
            </FormLabel>
            <Controller
              name="asset_vendor_type_id"
              control={control}
              render={({
                field: { onChange, value, ...field },
                fieldState: { error },
              }) => {
                return (
                  <Fragment>
                    <ReactSelectAsync
                      {...field}
                      key={language}
                      id="select-vendor-type"
                      isClearable
                      value={value}
                      loadOptions={loadAssetVendorType}
                      placeholder={t('form.detail.placeholder.type')}
                      onChange={(option: OptionType) => {
                        onChange(option)
                      }}
                      additional={{
                        page: 1,
                      }}
                      error={!!error?.message}
                    />
                    {error?.message && (
                      <FormErrorMessage>{error?.message}</FormErrorMessage>
                    )}
                  </Fragment>
                )
              }}
            />
          </FormControl>
        </div>
        <FormControl>
          <FormLabel>{t('form.detail.label.description')}</FormLabel>
          <TextArea
            {...register('description')}
            id="input-asset-vendor-description"
            placeholder={t('form.detail.placeholder.description')}
          />
          {errors?.description?.message && (
            <FormErrorMessage>{errors?.description?.message}</FormErrorMessage>
          )}
        </FormControl>
      </div>
    </div>
  )
}

export default AssetVendorFormDetail

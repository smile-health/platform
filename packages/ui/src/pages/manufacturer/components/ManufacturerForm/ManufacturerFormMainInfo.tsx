import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { Input } from '#components/input'
import { InputPhone } from '#components/input-phone'
import { OptionType, ReactSelect } from '#components/react-select'
import { TextArea } from '#components/text-area'
import { capitalizeFirstLetter } from '#utils/strings'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import useManufacturerTypeOptions from '../../hooks/useManufacturerTypeOptions'
import { FormType } from './ManufacturerForm'

export default function ManufacturerFormMainInfo() {
  const { t } = useTranslation(['common', 'manufacturer'])

  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<FormType>()

  const manufacturerTypes = useManufacturerTypeOptions()

  return (
    <div className="ui-p-4 ui-border ui-border-neutral-300 ui-rounded ui-space-y-6">
      <h5 className="font-bold">{t('manufacturer:title.detail')}</h5>
      <div className="ui-space-y-6">
        <FormControl>
          <FormLabel htmlFor="input-name" required>
            {t('manufacturer:form.name.label')}
          </FormLabel>
          <Input
            {...register('name')}
            data-testid="input-name"
            type="text"
            placeholder={t('manufacturer:form.name.placeholder')}
            error={Boolean(errors?.name)}
          />
          {errors?.name && (
            <FormErrorMessage>{errors?.name?.message}</FormErrorMessage>
          )}
        </FormControl>

        <Controller
          control={control}
          name="type"
          render={({
            field: { value, onChange, ...field },
            fieldState: { error },
          }) => (
            <FormControl>
              <FormLabel htmlFor="select-type" required>
                {t('type')}
              </FormLabel>
              <ReactSelect
                {...field}
                data-testid="select-type"
                placeholder={t('common:select_type')}
                options={manufacturerTypes}
                value={
                  value
                    ? manufacturerTypes?.find(
                        (item) => item?.value === Number(value)
                      )
                    : null
                }
                onChange={(option: OptionType) => onChange(option?.value)}
              />
              {error?.message && (
                <FormErrorMessage>{error?.message}</FormErrorMessage>
              )}
            </FormControl>
          )}
        />

        <FormControl>
          <FormLabel htmlFor="textarea-description">
            {t('common:description')}
          </FormLabel>
          <TextArea
            {...register('description')}
            data-testid="textarea-description"
            placeholder={t('common:description')}
            error={Boolean(errors?.description)}
          />
          {errors?.description && (
            <FormErrorMessage>{errors?.description?.message}</FormErrorMessage>
          )}
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="input-contact-name">
            {t('common:contact_name')}
          </FormLabel>
          <Input
            {...register('contact_name')}
            data-testid="input-contact_name"
            type="text"
            placeholder={capitalizeFirstLetter(t('common:contact_name'))}
            error={Boolean(errors.contact_name)}
          />
          {errors?.contact_name && (
            <FormErrorMessage>{errors?.contact_name?.message}</FormErrorMessage>
          )}
        </FormControl>

        <Controller
          name="phone_number"
          control={control}
          render={({
            field: { value, onChange, ...field },
            fieldState: { error },
          }) => (
            <FormControl>
              <FormLabel htmlFor="input-phone-number">
                {t('common:phone_number')}
              </FormLabel>
              <InputPhone
                {...field}
                data-testid="input-phone-number"
                error={Boolean(error?.message)}
                onChange={onChange}
                value={value}
                placeholder={capitalizeFirstLetter(t('common:phone_number'))}
              />
              {error?.message && (
                <FormErrorMessage>{error?.message}</FormErrorMessage>
              )}
            </FormControl>
          )}
        />

        <FormControl>
          <FormLabel htmlFor="email">Email</FormLabel>
          <Input
            {...register('email')}
            type="text"
            placeholder="Email"
            data-testid="email"
            error={Boolean(errors?.email)}
          />
          {errors?.email && (
            <FormErrorMessage>{errors?.email?.message}</FormErrorMessage>
          )}
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="textarea-address">
            {t('common:address')}
          </FormLabel>
          <TextArea
            {...register('address')}
            placeholder={t('common:address')}
            error={Boolean(errors.address)}
            data-testid="textarea-address"
          />
          {errors?.address && (
            <FormErrorMessage>{errors?.address?.message}</FormErrorMessage>
          )}
        </FormControl>
      </div>
    </div>
  )
}

import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { Input } from '#components/input'
import { InputPhone } from '#components/input-phone'
import { ReactSelectAsync } from '#components/react-select'
import { USER_ROLE } from '#constants/roles'
import { loadCoreEntities } from '#services/entity'
import { GetProfileResponse } from '#services/profile'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

type AssetInventoryEntitySectionProps = {
  profile?: GetProfileResponse
  errors: any
}

export const AssetInventoryEntitySection = ({
  errors,
  profile,
}: AssetInventoryEntitySectionProps) => {
  const { t } = useTranslation(['common', 'assetInventory'])
  const { control, setValue } = useFormContext()
  const isSuperadmin =
    profile?.role === USER_ROLE.SUPERADMIN || profile?.role === USER_ROLE.ADMIN

  return (
    <div className="ui-w-full ui-grid ui-grid-cols-1 ui-gap-4 ui-border ui-rounded-md ui-p-6 ui-mb-6">
      <div className="ui-font-bold ui-text-primary ui-text-dark-blue">
        {t('assetInventory:form.title.entity')}
      </div>
      <FormControl className="ui-w-full">
        <FormLabel htmlFor="entity" required>
          {t('common:tab.entity')}
        </FormLabel>
        <Controller
          name="entity"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <ReactSelectAsync
              {...field}
              key={`entity__${field.value?.value}`}
              id="entity"
              isClearable
              value={field?.value}
              disabled={!isSuperadmin}
              loadOptions={loadCoreEntities}
              onChange={(selected) => {
                field.onChange(selected)
                setValue('maintainers', null)
              }}
              placeholder={t('assetInventory:type_to_search')}
              additional={{
                page: 1,
              }}
              error={!!error?.message}
            />
          )}
        />
        {errors?.entity?.message && (
          <FormErrorMessage>{errors?.entity?.message}</FormErrorMessage>
        )}
      </FormControl>
      {['first', 'second', 'third'].map((val: string, index) => {
        return (
          <div className="ui-grid ui-grid-cols-2 ui-gap-4" key={val}>
            <FormControl className="ui-w-full">
              <FormLabel
                htmlFor={`contact_person_user_${index + 1}_name`}
                required={val === 'first'}
              >
                {t('assetInventory:columns.contact_person.label', {
                  number: index + 1,
                })}
              </FormLabel>
              <Controller
                name={`contact_person_user_${index + 1}_name`}
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Input
                    {...field}
                    id={`contact_person_user_${index + 1}_name`}
                    placeholder={t(
                      'assetInventory:columns.contact_person.placeholder'
                    )}
                    error={!!error?.message}
                  />
                )}
              />
              {val === 'first' &&
                errors?.[`contact_person_user_${index + 1}_name`]?.message && (
                  <FormErrorMessage>
                    {errors?.[`contact_person_user_${index + 1}_name`]?.message}
                  </FormErrorMessage>
                )}
            </FormControl>
            <FormControl className="ui-w-full">
              <FormLabel htmlFor="phone-number" required={val === 'first'}>
                {t('assetInventory:columns.phone_number.label', {
                  number: index + 1,
                })}
              </FormLabel>
              <Controller
                name={`contact_person_user_${index + 1}_number`}
                control={control}
                render={({
                  field: { value, onChange, ...field },
                  fieldState: { error },
                }) => (
                  <InputPhone
                    {...field}
                    id="input-phone-number"
                    error={Boolean(error?.message)}
                    onChange={onChange}
                    value={value as string}
                    placeholder={t(
                      'assetInventory:columns.phone_number.placeholder'
                    )}
                  />
                )}
              />
              {errors?.[`contact_person_user_${index + 1}_number`]?.message && (
                <FormErrorMessage>
                  {errors?.[`contact_person_user_${index + 1}_number`]?.message}
                </FormErrorMessage>
              )}
            </FormControl>
          </div>
        )
      })}
    </div>
  )
}

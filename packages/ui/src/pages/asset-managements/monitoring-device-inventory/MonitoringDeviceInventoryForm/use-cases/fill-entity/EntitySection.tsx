import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { Input } from '#components/input'
import { InputPhone } from '#components/input-phone'
import { ReactSelectAsync } from '#components/react-select'
import { loadEntities } from '#services/entity'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useMonitoringDeviceInventoryForm } from '../../MonitoringDeviceInventoryFormContext'

export const EntitySection = () => {
  const { t } = useTranslation(['common', 'monitoringDeviceInventoryForm'])
  const { isGlobal } = useMonitoringDeviceInventoryForm()
  const {
    control,
    formState: { errors },
  } = useFormContext()

  return (
    <div className="ui-w-full ui-grid ui-grid-cols-1 ui-gap-4 ui-border ui-rounded-md ui-p-6 ui-mb-6">
      <div className="ui-font-bold ui-text-primary ui-text-dark-blue">
        {t('monitoringDeviceInventoryForm:section.entity.title')}
      </div>

      <FormControl className="ui-w-full">
        <FormLabel htmlFor="entity_id" required>
          {t('monitoringDeviceInventoryForm:field.entity.label')}
        </FormLabel>
        <Controller
          name="entity_id"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <ReactSelectAsync
              {...field}
              key={`entity_id__${field.value?.value}`}
              id="entity_id"
              isClearable
              value={field?.value}
              loadOptions={loadEntities}
              placeholder={t(
                'monitoringDeviceInventoryForm:field.entity.placeholder'
              )}
              additional={{
                page: 1,
                isGlobal,
              }}
              error={!!error?.message}
            />
          )}
        />
        {errors?.entity_id?.message && (
          <FormErrorMessage>
            {String(errors?.entity_id?.message)}
          </FormErrorMessage>
        )}
      </FormControl>

      {[1, 2, 3].map((index) => {
        const nameField = `contact_person_user_${index}_name`
        const phoneField = `contact_person_user_${index}_number`
        const isRequired = index === 1

        return (
          <div className="ui-grid ui-grid-cols-2 ui-gap-4" key={index}>
            <FormControl className="ui-w-full">
              <FormLabel htmlFor={nameField} required={isRequired}>
                {index === 1
                  ? t(
                      'monitoringDeviceInventoryForm:field.contact_person.label',
                      {
                        number: '',
                      }
                    ).trim()
                  : t(
                      'monitoringDeviceInventoryForm:field.contact_person.label',
                      {
                        number: index,
                      }
                    )}
              </FormLabel>
              <Controller
                name={nameField}
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Input
                    {...field}
                    id={nameField}
                    placeholder={t(
                      'monitoringDeviceInventoryForm:field.contact_person.placeholder'
                    )}
                    error={!!error?.message}
                  />
                )}
              />
              {errors?.[nameField]?.message && (
                <FormErrorMessage>
                  {String(errors?.[nameField]?.message)}
                </FormErrorMessage>
              )}
            </FormControl>

            <FormControl className="ui-w-full">
              <FormLabel htmlFor={phoneField} required={isRequired}>
                {index === 1
                  ? t(
                      'monitoringDeviceInventoryForm:field.phone_number.label',
                      {
                        number: '',
                      }
                    ).trim()
                  : t(
                      'monitoringDeviceInventoryForm:field.phone_number.label',
                      {
                        number: index,
                      }
                    )}
              </FormLabel>
              <Controller
                name={phoneField}
                control={control}
                render={({
                  field: { value, onChange, ...field },
                  fieldState: { error },
                }) => (
                  <InputPhone
                    {...field}
                    id={phoneField}
                    error={Boolean(error?.message)}
                    onChange={onChange}
                    value={value as string}
                    placeholder={t(
                      'monitoringDeviceInventoryForm:field.phone_number.placeholder'
                    )}
                  />
                )}
              />
              {errors?.[phoneField]?.message && (
                <FormErrorMessage>
                  {String(errors?.[phoneField]?.message)}
                </FormErrorMessage>
              )}
            </FormControl>
          </div>
        )
      })}
    </div>
  )
}

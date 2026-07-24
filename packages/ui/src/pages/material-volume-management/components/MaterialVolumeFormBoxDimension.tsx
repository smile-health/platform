import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { InputNumber } from '#components/input-number'
import {
  CreateBoxDimensionInput,
  CreateMaterialVolumeInput,
} from '#services/material-volume'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

const MaterialVolumeFormBoxDimension = () => {
  const { t } = useTranslation('materialVolume')
  const {
    control,
    formState: { errors },
  } = useFormContext<CreateMaterialVolumeInput>()

  const fields = [
    {
      label: t('form.box_length.label'),
      name: 'box_length',
      placeholder: t('form.box_length.placeholder'),
    },
    {
      label: t('form.box_width.label'),
      name: 'box_width',
      placeholder: t('form.box_width.placeholder'),
    },
    {
      label: t('form.box_height.label'),
      name: 'box_height',
      placeholder: t('form.box_height.placeholder'),
    },
  ]

  return (
    <div className="ui-p-4 ui-border ui-rounded">
      <div className="ui-mb-4 ui-font-bold ui-text-primary ui-text-dark-blue">
        {t('detail.section.box_dimension.header')}
      </div>
      <div className="ui-grid ui-grid-cols-3 ui-gap-5">
        {fields.map(({ label, name, placeholder }) => (
          <FormControl className="ui-w-full" key={name}>
            <FormLabel htmlFor={name} required>
              {label}
            </FormLabel>
            <Controller
              name={name as keyof CreateBoxDimensionInput}
              control={control}
              render={({
                fieldState: { error },
                field: { value, onChange },
              }) => (
                <InputNumber
                  hideStepper
                  id={name}
                  name={name}
                  defaultValue={value ?? undefined}
                  placeholder={placeholder}
                  onChange={(value) => {
                    onChange(value)
                  }}
                  error={!!error?.message}
                />
              )}
            />
            {errors?.[name as keyof CreateBoxDimensionInput]?.message && (
              <FormErrorMessage>
                {typeof errors?.[name as keyof CreateBoxDimensionInput]
                  ?.message === 'string' &&
                  errors?.[name as keyof CreateBoxDimensionInput]?.message}
              </FormErrorMessage>
            )}
          </FormControl>
        ))}
      </div>
    </div>
  )
}

export default MaterialVolumeFormBoxDimension

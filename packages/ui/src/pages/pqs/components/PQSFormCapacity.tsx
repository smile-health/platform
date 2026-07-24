import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import Warning from '#components/icons/Warning'
import { InputNumber } from '#components/input-number'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { CreatePQSFormCapacityInput, CreatePQSFormInput } from '../pqs.types'

const PQSFormCapacity = ({
  defaultValue,
  isEdit,
}: Readonly<{
  defaultValue?: CreatePQSFormInput
  isEdit: boolean
}>) => {
  const { t } = useTranslation(['pqs', 'common'])
  const {
    control,
    trigger,
    formState: { errors },
  } = useFormContext<CreatePQSFormInput>()

  const fields = [
    {
      label: `${t('form.capacity.label', { temperature: '+5°C' })} (${t('common:litre')})`,

      name: 'net_capacity5',
      placeholder: t('form.capacity.placeholder'),
    },
    {
      label: `${t('form.capacity.label', { temperature: '-20°C' })} (${t('common:litre')})`,
      name: 'net_capacityMin20',
      placeholder: t('form.capacity.placeholder'),
    },
    {
      label: `${t('form.capacity.label', { temperature: '-86°C' })} (${t('common:litre')})`,
      name: 'net_capacityMin86',
      placeholder: t('form.capacity.placeholder'),
    },
  ]

  return (
    <div className="ui-p-4 ui-border ui-rounded">
      <div className="ui-mb-4 ui-font-bold ui-text-primary ui-text-dark-blue">
        {t('detail.section.capacity.header')}
      </div>
      {!!defaultValue?.is_related_asset && (
        <div className="ui-rounded ui-bg-slate-100 ui-px-4 ui-py-[9px] ui-flex ui-gap-2 ui-items-center my-4">
          <Warning />
          <p className="ui-text-xs ui-font-normal">
            {t('detail.section.detail.warning')}
          </p>
        </div>
      )}
      <div className="ui-grid ui-grid-cols-3 ui-gap-5">
        {fields.map(({ label, name, placeholder }) => (
          <FormControl className="ui-w-full" key={name}>
            <FormLabel htmlFor={name}>{label}</FormLabel>
            <Controller
              name={name as keyof CreatePQSFormCapacityInput}
              control={control}
              render={({
                fieldState: { error },
                field: { value, onChange },
              }) => (
                <InputNumber
                  hideStepper
                  id={name}
                  disabled={isEdit && !!defaultValue?.is_related_asset}
                  name={name}
                  minValue={0}
                  formatOptions={{
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }}
                  step={0.01}
                  value={
                    value === null || value === undefined
                      ? undefined
                      : Number(value)
                  }
                  placeholder={placeholder}
                  onChange={(val) => {
                    const formatted =
                      val === null || val === undefined
                        ? undefined
                        : Number(val).toFixed(2)
                    onChange(formatted)
                    for (const field of fields) {
                      trigger(field.name as keyof CreatePQSFormCapacityInput)
                    }
                  }}
                  error={!!error?.message}
                />
              )}
            />
            {errors?.[name as keyof CreatePQSFormCapacityInput]?.message && (
              <FormErrorMessage>
                {typeof errors?.[name as keyof CreatePQSFormCapacityInput]
                  ?.message === 'string' &&
                  errors?.[name as keyof CreatePQSFormCapacityInput]?.message}
              </FormErrorMessage>
            )}
          </FormControl>
        ))}
      </div>
    </div>
  )
}

export default PQSFormCapacity

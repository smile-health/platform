import { Fragment, useMemo } from 'react'
import { DatePicker } from '#components/date-picker'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { ReactSelectAsync } from '#components/react-select'
import { DateValue } from 'react-aria'
import { Control, Controller, UseFormTrigger } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

export type AssetInventoryGroupSectionProps = {
  fields: {
    id: string
    name: string
    label: string
    type: string
    trigger_fields: string[]
    watch_fields?: string[]
    loadOptions?: any
    minValue?: DateValue
    maxValue?: DateValue
    isVendor?: boolean
    additional?: any
  }[]
  title: string
  control: Control<any>
  trigger: UseFormTrigger<any>
  errors: any
}

export default function AssetInventoryGroupSection({
  fields,
  title,
  control,
  trigger,
  errors,
}: Readonly<AssetInventoryGroupSectionProps>) {
  const { t } = useTranslation(['assetInventory'])
  const vendorField = useMemo(() => {
    return fields.filter((field) => field.isVendor)
  }, [fields])
  const nonVendorFields = useMemo(() => {
    return fields.filter((field) => !field.isVendor)
  }, [fields])

  const renderField = ({
    type,
    label,
    name,
    trigger_fields,
    minValue,
    maxValue,
    loadOptions,
    additional,
  }: {
    type: string
    label: string
    name: string
    trigger_fields: string[]
    watch_fields?: string[]
    minValue?: DateValue
    maxValue?: DateValue
    isVendor?: boolean
    loadOptions?: any
    additional?: any
  }) => {
    switch (type) {
      case 'select-async-paginate':
        return (
          <FormControl className="ui-w-full">
            <FormLabel htmlFor={name}>{label}</FormLabel>
            <Controller
              name={name}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <ReactSelectAsync
                  {...field}
                  key={`${name}__${field.value?.value}`}
                  id={name}
                  isClearable
                  disabled={false}
                  error={!!error?.message}
                  loadOptions={loadOptions ?? undefined}
                  onChange={(data) => {
                    field.onChange(data)
                    for (const field of trigger_fields) {
                      trigger(field)
                    }
                  }}
                  placeholder={t('assetInventory:type_to_search')}
                  additional={additional}
                />
              )}
            />
            {errors?.[name]?.message && (
              <FormErrorMessage>{errors?.[name]?.message}</FormErrorMessage>
            )}
          </FormControl>
        )
      case 'date-picker':
        return (
          <FormControl className="ui-w-full">
            <FormLabel htmlFor={name}>{label}</FormLabel>
            <Controller
              name={name}
              control={control}
              render={({
                field: { value, onChange, ...field },
                fieldState: { error },
              }) => {
                return (
                  <DatePicker
                    {...field}
                    clearable
                    value={value}
                    maxValue={maxValue ?? undefined}
                    minValue={minValue ?? undefined}
                    error={!!error?.message}
                    onChange={(date) => {
                      onChange(date)
                      for (const field of trigger_fields) {
                        trigger(field)
                      }
                    }}
                  />
                )
              }}
            />
            <FormErrorMessage>{errors?.[name]?.message}</FormErrorMessage>
          </FormControl>
        )
    }
  }
  return (
    <div className="ui-w-full ui-grid ui-grid-cols-1 ui-gap-4 ui-border ui-rounded-md ui-p-6 ui-mb-6">
      <div className="ui-font-bold ui-text-primary ui-text-dark-blue">
        {title}
      </div>
      <div className="ui-w-full ui-grid ui-grid-cols-2 ui-gap-4">
        {nonVendorFields.map((field) => (
          <Fragment key={field.id}>
            {!field?.isVendor && renderField(field)}
          </Fragment>
        ))}
      </div>
      {vendorField.map((field) => (
        <div key={field.id} className="ui-w-full">
          {renderField(field)}
        </div>
      ))}
    </div>
  )
}

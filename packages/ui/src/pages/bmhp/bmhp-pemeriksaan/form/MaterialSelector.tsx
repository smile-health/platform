import { useQuery } from '@tanstack/react-query'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { ReactSelectWithQuery } from '#components/react-select'
import { Controller, useFieldArray, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { loadBmhpMaterialOptions } from '../../bmhp-material/list/master.service'
import { loadSasaranOptions } from './form.service'

interface Material {
  template_id: number
  sasaran_ids: number[]
}

interface MaterialField extends Material {
  id: string
}

interface OptionType {
  value: number
  label: string
}

interface MaterialSelectorProps {
  name?: string
  label?: string
  year_id: number
}

export default function MaterialSelector({
  name = 'materials',
  label,
  year_id,
}: MaterialSelectorProps) {
  const { t, i18n } = useTranslation(['masterBmhp', 'common'])
  const {
    control,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext()

  const language = i18n?.language

  const { data: sasaranOptions = [] } = useQuery({
    queryKey: ['react-select', 'sasaran_ids', language],
    queryFn: () => loadSasaranOptions(year_id),
    enabled: true,
    staleTime: 1000 * 60 * 5,
  })

  const { data: materialOptions = [] } = useQuery({
    queryKey: ['react-select', 'material_options', language],
    queryFn: () => loadBmhpMaterialOptions(year_id),
    enabled: true,
    staleTime: 1000 * 60 * 5,
  })

  const { fields } = useFieldArray({ control, name })

  const getOptionByValue = (
    options: Array<{ value: number; label: string }>,
    value?: number | { value?: number; label?: string } | null
  ) => {
    if (!value) return null
    if (typeof value === 'object') return value
    return options.find((option) => option.value === value) ?? null
  }

  const mapIdsToOptions = (
    options: Array<{ value: number; label: string }>,
    values?: Array<number | { value?: number; label?: string } | undefined>
  ) =>
    (values ?? [])
      .filter(
        (value): value is number | { value?: number; label?: string } =>
          value !== undefined
      )
      .map((value) => getOptionByValue(options, value))
      .filter(Boolean) as Array<{ value: number; label: string }>

  const handleMaterialChange = (selected: OptionType[]) => {
    const currentFields = (watch(name) || []) as Material[]
    const newMaterials = selected.map((s) => {
      const existing = currentFields.find((f) => f.template_id === s.value)
      return existing
        ? { template_id: s.value, sasaran_ids: existing.sasaran_ids }
        : { template_id: s.value, sasaran_ids: [] }
    })
    setValue(name, newMaterials, { shouldValidate: true })
  }

  const errorMessage = errors?.materials?.message as string | undefined

  // Get currently selected materials based on fields
  const selectedMaterials = materialOptions.filter((option) =>
    (fields as MaterialField[]).some((f) => f.template_id === option.value)
  )

  return (
    <FormControl className="ui-mb-4">
      <FormLabel htmlFor={name} required>
        {label || t('masterBmhp:label.materials')}
      </FormLabel>
      <ReactSelectWithQuery
        key={`materials-${materialOptions.length}-${selectedMaterials.length}`}
        id={name}
        name={name}
        isMulti
        placeholder={t('masterBmhp:placeholder.materials')}
        loadOptions={() => loadBmhpMaterialOptions(year_id)}
        value={selectedMaterials}
        onChange={(selected) =>
          handleMaterialChange((selected as OptionType[]) || [])
        }
        multiSelectOptionStyle="checkbox"
        multiSelectCounterStyle="counter"
        closeMenuOnSelect={false}
      />
      {errorMessage && <FormErrorMessage>{errorMessage}</FormErrorMessage>}
      {fields.length > 0 && (
        <div className="ui-mt-3 ui-border ui-border-gray-200 ui-rounded">
          <div className="ui-flex ui-items-center ui-px-3 ui-py-2 ui-bg-gray-50 ui-text-sm ui-font-medium ui-text-gray-600 ui-border-b ui-border-gray-200">
            <span className="ui-w-1/3">
              {label || t('masterBmhp:label.materials')}
            </span>
            <span className="ui-flex-1">
              {t('masterBmhp:label.target_group')}
            </span>
          </div>
          {(fields as MaterialField[]).map((field, index: number) => {
            const template = materialOptions.find(
              (t) => t.value === field.template_id
            )
            return (
              <div
                key={field.id}
                className="ui-flex ui-items-start ui-gap-3 ui-px-3 ui-py-2 ui-border-b last:ui-border-b-0 ui-border-gray-100"
              >
                <span className="ui-w-1/3 ui-text-sm ui-pt-2 ui-text-gray-700">
                  {template?.label}
                </span>
                <Controller
                  control={control}
                  name={`${name}.${index}.sasaran_ids`}
                  render={({
                    field: { value, onChange, ...restField },
                    fieldState: { error },
                  }) => {
                    const selectedSasarans = mapIdsToOptions(
                      sasaranOptions,
                      (value as number[]) || []
                    )

                    return (
                      <FormControl className="ui-flex-1">
                        <ReactSelectWithQuery
                          key={`sasaran-${index}-${sasaranOptions.length}-${selectedSasarans.length}`}
                          {...restField}
                          id={`${name}.${index}.sasaran_ids`}
                          isMulti
                          placeholder={t('masterBmhp:placeholder.target_group')}
                          options={sasaranOptions}
                          value={selectedSasarans}
                          onChange={(selected) =>
                            onChange(
                              ((selected as OptionType[]) ?? []).map(
                                (item) => item.value
                              )
                            )
                          }
                          multiSelectOptionStyle="checkbox"
                          multiSelectCounterStyle="counter"
                          closeMenuOnSelect={false}
                        />
                        {error?.message && (
                          <FormErrorMessage>{error.message}</FormErrorMessage>
                        )}
                      </FormControl>
                    )
                  }}
                />
              </div>
            )
          })}
        </div>
      )}
    </FormControl>
  )
}

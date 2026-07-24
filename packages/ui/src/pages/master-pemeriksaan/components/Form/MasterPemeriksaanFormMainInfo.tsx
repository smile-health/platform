import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { Input } from '#components/input'
import { Radio, RadioGroup } from '#components/radio'
import { ReactSelectWithQuery } from '#components/react-select'
import { TextArea } from '#components/text-area'
import { Controller, useFieldArray, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { loadBmhpMaterialOptions } from '../../../bmhp/bmhp-material/list/master.service'
import { MasterPemeriksaanFormType } from '../../schema/MasterPemeriksaanSchemaForm'
import {
  loadJenisPemeriksaanOptions,
  loadMetodeOptions,
  loadParameterOptions,
  loadSasaranOptions,
} from '../../services/master-pemeriksaan.service'

export default function MasterPemeriksaanFormMainInfo() {
  const { t, i18n } = useTranslation() as any
  const {
    control,
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<MasterPemeriksaanFormType>()

  const language = i18n?.language

  const { data: jenisOptions = [] } = useQuery({
    queryKey: ['react-select', 'jenis_pemeriksaan_id', language],
    queryFn: loadJenisPemeriksaanOptions,
    enabled: true,
    staleTime: 1000 * 60 * 1,
  })

  const { data: parameterOptions = [] } = useQuery({
    queryKey: ['react-select', 'parameter_ids', language],
    queryFn: loadParameterOptions,
    enabled: true,
    staleTime: 1000 * 60 * 1,
  })

  const { data: metodeOptions = [] } = useQuery({
    queryKey: ['react-select', 'metode_ids', language],
    queryFn: loadMetodeOptions,
    enabled: true,
    staleTime: 1000 * 60 * 1,
  })

  const { data: sasaranOptions = [] } = useQuery({
    queryKey: ['react-select', 'sasaran_ids', language],
    queryFn: loadSasaranOptions,
    enabled: true,
    staleTime: 1000 * 60 * 1,
  })

  const { fields } = useFieldArray({ control, name: 'materials' })

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

  const handleMaterialChange = (
    selected: { value: number; label: string }[]
  ) => {
    const currentFields = watch('materials') || []
    const newMaterials = selected.map((s) => {
      const existing = currentFields.find((f) => f.template_id === s.value)
      return existing
        ? { template_id: s.value, sasaran_ids: existing.sasaran_ids }
        : { template_id: s.value, sasaran_ids: [] }
    })
    setValue('materials', newMaterials, { shouldValidate: true })
  }

  const [keepLoadBmhpMaterialOptions, setKeepLoadBmhpMaterialOptions] =
    useState<{ value: number; label: string }[]>([])

  useEffect(() => {
    loadBmhpMaterialOptions().then((options) => {
      setKeepLoadBmhpMaterialOptions(options)
    })
  }, [])

  return (
    <div className="ui-p-4 ui-pb-4 ui-mt-6 ui-border ui-border-gray-300 ui-rounded">
      <div className="ui-mb-5 ui-font-bold ui-text-primary ui-text-dark-blue">
        {t('master-pemeriksaan:title.detail')}
      </div>

      <div className="ui-flex ui-flex-col ui-space-y-5">
        {/* Nama Pemeriksaan */}
        <FormControl>
          <FormLabel htmlFor="name" required>
            {t('master-pemeriksaan:form.name.label')}
          </FormLabel>
          <Input
            id="name"
            placeholder={t('master-pemeriksaan:form.name.placeholder')}
            {...register('name')}
          />
          {errors?.name && (
            <FormErrorMessage>{errors.name.message}</FormErrorMessage>
          )}
        </FormControl>

        {/* Deskripsi */}
        <FormControl>
          <FormLabel htmlFor="description">
            {t('master-pemeriksaan:form.description.label') || 'Deskripsi'}
          </FormLabel>
          <TextArea
            id="description"
            placeholder={
              t('master-pemeriksaan:form.description.placeholder') ||
              'Masukkan deskripsi pemeriksaan'
            }
            rows={4}
            {...register('description')}
          />
          {errors?.description && (
            <FormErrorMessage>{errors.description.message}</FormErrorMessage>
          )}
        </FormControl>

        {/* Status Aktif */}
        <Controller
          control={control}
          name="is_active"
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <FormControl>
              <FormLabel htmlFor="is_active" required>
                {t('master-pemeriksaan:form.is_active.label')}
              </FormLabel>
              <RadioGroup>
                <Radio
                  name="is_active"
                  label={t('master-pemeriksaan:form.is_active.active')}
                  value="true"
                  checked={value === true}
                  onChange={() => onChange(true)}
                />
                <Radio
                  name="is_active"
                  label={t('master-pemeriksaan:form.is_active.inactive')}
                  value="false"
                  checked={value === false}
                  onChange={() => onChange(false)}
                />
              </RadioGroup>
              {error?.message && (
                <FormErrorMessage>{error.message}</FormErrorMessage>
              )}
            </FormControl>
          )}
        />

        {/* Jenis Pemeriksaan */}
        <Controller
          control={control}
          name="jenis_pemeriksaan_id"
          render={({
            field: { value, onChange, ...field },
            fieldState: { error },
          }) => (
            <FormControl>
              <FormLabel htmlFor="jenis_pemeriksaan_id" required>
                {t('master-pemeriksaan:form.jenis_pemeriksaan.label')}
              </FormLabel>
              <ReactSelectWithQuery
                {...field}
                id="jenis_pemeriksaan_id"
                name="jenis_pemeriksaan_id"
                placeholder={t(
                  'master-pemeriksaan:form.jenis_pemeriksaan.placeholder'
                )}
                loadOptions={loadJenisPemeriksaanOptions}
                value={getOptionByValue(jenisOptions, value)}
                onChange={(option: any) => onChange(option?.value ?? null)}
              />
              {error?.message && (
                <FormErrorMessage>{error.message}</FormErrorMessage>
              )}
            </FormControl>
          )}
        />

        {/* Parameter (Multiple Select) */}
        <Controller
          control={control}
          name="parameter_ids"
          render={({
            field: { value, onChange, ...field },
            fieldState: { error },
          }) => (
            <FormControl>
              <FormLabel htmlFor="parameter_ids" required>
                {t('master-pemeriksaan:form.parameter.label')}
              </FormLabel>
              <ReactSelectWithQuery
                {...field}
                id="parameter_ids"
                name="parameter_ids"
                isMulti
                placeholder={t('master-pemeriksaan:form.parameter.placeholder')}
                loadOptions={loadParameterOptions}
                value={mapIdsToOptions(parameterOptions, value)}
                onChange={(selected: any) =>
                  onChange((selected ?? []).map((item: any) => item.value))
                }
                multiSelectOptionStyle="checkbox"
                multiSelectCounterStyle="counter"
                closeMenuOnSelect={false}
              />
              {error?.message && (
                <FormErrorMessage>{error.message}</FormErrorMessage>
              )}
            </FormControl>
          )}
        />

        {/* Metode (Multiple) */}
        <Controller
          control={control}
          name="metode_ids"
          render={({
            field: { value, onChange, ...field },
            fieldState: { error },
          }) => (
            <FormControl>
              <FormLabel htmlFor="metode_ids" required>
                {t('master-pemeriksaan:form.metode.label')}
              </FormLabel>
              <ReactSelectWithQuery
                {...field}
                id="metode_ids"
                name="metode_ids"
                isMulti
                placeholder={t('master-pemeriksaan:form.metode.placeholder')}
                loadOptions={loadMetodeOptions}
                value={mapIdsToOptions(metodeOptions, value)}
                onChange={(selected: any) =>
                  onChange((selected ?? []).map((item: any) => item.value))
                }
                multiSelectOptionStyle="checkbox"
                multiSelectCounterStyle="counter"
                closeMenuOnSelect={false}
              />
              {error?.message && (
                <FormErrorMessage>{error.message}</FormErrorMessage>
              )}
            </FormControl>
          )}
        />

        {/* Pilihan Material + Sasaran per Material */}
        {/* {JSON.stringify(
          keepLoadBmhpMaterialOptions.filter((option) =>
            fields.some((f) => f.template_id === option.value)
          )
        )} */}
        <FormControl>
          <FormLabel htmlFor="materials" required>
            {t('master-pemeriksaan:form.pilihan_material.label')}
          </FormLabel>
          <ReactSelectWithQuery
            id="materials"
            name="materials"
            isMulti
            placeholder={t(
              'master-pemeriksaan:form.pilihan_material.placeholder'
            )}
            loadOptions={loadBmhpMaterialOptions}
            value={keepLoadBmhpMaterialOptions.filter((option) =>
              fields.some((f) => f.template_id === option.value)
            )}
            onChange={(selected: any) => handleMaterialChange(selected || [])}
            multiSelectOptionStyle="checkbox"
            multiSelectCounterStyle="counter"
            closeMenuOnSelect={false}
          />
          {errors?.materials?.message && (
            <FormErrorMessage>{errors.materials.message}</FormErrorMessage>
          )}
          {fields.length > 0 && (
            <div className="ui-mt-3 ui-border ui-border-gray-200 ui-rounded">
              <div className="ui-flex ui-items-center ui-px-3 ui-py-2 ui-bg-gray-50 ui-text-sm ui-font-medium ui-text-gray-600 ui-border-b ui-border-gray-200">
                <span className="ui-w-1/3">
                  {t('master-pemeriksaan:form.pilihan_material.label')}
                </span>
                <span className="ui-flex-1">
                  {t('master-pemeriksaan:form.sasaran.label')}
                </span>
              </div>
              {fields.map((field, index) => {
                const template = keepLoadBmhpMaterialOptions.find(
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
                    {/* {JSON.stringify(watch().materials)} */}
                    {/* {JSON.stringify(sasaranOptions[index])} */}
                    <Controller
                      control={control}
                      name={`materials.${index}.sasaran_ids`}
                      render={({
                        field: { value, onChange, ...restField },
                        fieldState: { error },
                      }) => (
                        <FormControl className="ui-flex-1">
                          <ReactSelectWithQuery
                            {...restField}
                            id={`materials.${index}.sasaran_ids`}
                            isMulti
                            placeholder={t(
                              'master-pemeriksaan:form.sasaran.placeholder'
                            )}
                            loadOptions={loadSasaranOptions}
                            value={mapIdsToOptions(sasaranOptions, value)}
                            onChange={(selected: any) =>
                              onChange(
                                (selected ?? []).map((item: any) => item.value)
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
                      )}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </FormControl>
      </div>
    </div>
  )
}

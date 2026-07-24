'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Button } from '#components/button'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { Input } from '#components/input'
import { ReactSelect } from '#components/react-select'
import useSmileRouter from '#hooks/useSmileRouter'
import { useTranslation } from 'react-i18next'
import { Controller } from 'react-hook-form'

import { listUnits } from '../analysis-parameter.service'
import { AnalysisParameterFormProps } from '../analysis-parameter.type'
import { useAnalysisParameterCreateEdit } from '../hooks/useAnalysisParameterCreateEdit'

export default function AnalysisParameterForm({
  isEdit,
  defaultValues,
  isDetail,
}: Readonly<AnalysisParameterFormProps>) {
  const { t } = useTranslation(['common', 'analysisParameter'])
  const router = useSmileRouter()
  const {
    register,
    handleSubmit,
    errors,
    onValid,
    control,
    watch,
    FREE_TEXT_VALUE,
  } = useAnalysisParameterCreateEdit({
    isEdit,
    defaultValues,
  })

  // Fetch units for dropdown
  const { data: unitsData } = useQuery<{ data: { id: number; name: string }[] }>({
    queryKey: ['units'],
    queryFn: listUnits,
    refetchOnWindowFocus: false,
  })

  const unitOptions = [
    ...(unitsData?.data?.map((unit) => ({
      value: unit.id,
      label: unit.name,
    })) || []),
    { value: FREE_TEXT_VALUE, label: t('common:other') },
  ]

  const selectedUnitId = watch('unit_id')

  return (
    <form onSubmit={handleSubmit(onValid)} className="ui-mt-6">
      <div className="ui-max-w-form ui-mx-auto ui-p-4 ui-border ui-border-gray-300 ui-rounded ui-bg-white">
        <div className="ui-font-bold ui-mb-6">
          {t('analysisParameter:form.detail_title')}
        </div>
        <div className="ui-flex ui-flex-col ui-space-y-6">
          {/* Name */}
          <FormControl>
            <FormLabel htmlFor="input-name" required>
              {t('analysisParameter:form.name.label')}
            </FormLabel>
            <Input
              {...register('name')}
              id="input-name"
              placeholder={t('analysisParameter:form.name.placeholder')}
              disabled={isDetail}
              error={!!errors?.name?.message}
            />
            <FormErrorMessage>{errors?.name?.message}</FormErrorMessage>
          </FormControl>

          {/* Unit */}
          <Controller
            control={control}
            name="unit_id"
            render={({ field: { value, onChange, ...field } }) => (
              <FormControl>
                <FormLabel htmlFor="select-unit" required>
                  {t('analysisParameter:form.unit.label')}
                </FormLabel>
                <ReactSelect
                  {...field}
                  id="select-unit"
                  options={unitOptions}
                  placeholder={t('analysisParameter:form.unit.placeholder')}
                  value={unitOptions.find((opt) => opt.value === value) || null}
                  onChange={(option: { value: number; label: string } | null) =>
                    onChange(option?.value ?? null)
                  }
                  isDisabled={isDetail}
                  error={!!errors?.unit_id?.message}
                />
                <FormErrorMessage>{errors?.unit_id?.message}</FormErrorMessage>
              </FormControl>
            )}
          />

          {/* Custom Unit Name (shown when "Lainnya" is selected) */}
          {selectedUnitId === FREE_TEXT_VALUE && (
            <FormControl>
              <FormLabel htmlFor="input-custom-unit" required>
                {t('analysisParameter:form.custom_unit.label')}
              </FormLabel>
              <Input
                {...register('custom_unit_name')}
                id="input-custom-unit"
                placeholder={t('analysisParameter:form.custom_unit.placeholder')}
                disabled={isDetail}
                error={!!errors?.custom_unit_name?.message}
              />
              <FormErrorMessage>{errors?.custom_unit_name?.message}</FormErrorMessage>
            </FormControl>
          )}
        </div>
      </div>

      <div className="ui-max-w-form ui-mx-auto ui-mt-6">
        <div className="ui-flex ui-space-x-3 ui-justify-end">
          <Button asChild variant="outline" className="ui-w-32">
            <Link href={router.getAsLink('/v5/analysis-parameter')}>
              {t('common:back')}
            </Link>
          </Button>
          {!isDetail && (
            <Button className="ui-w-32" type="submit">
              {t('common:save')}
            </Button>
          )}
        </div>
      </div>
    </form>
  )
}

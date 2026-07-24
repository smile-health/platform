'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '#components/button'
import ProgramSelection from '#components/modules/ProgramSelection'
import { toast } from '#components/toast'
import {
  createMaterial,
  CreateMaterialInput,
  GetMaterialRelation,
  MaterialDetailGlobalResponse,
  updateMaterial,
} from '#services/material'
import { ErrorResponse } from '#types/common'
import { AxiosError } from 'axios'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  MaterialGlobalFormData,
  materialGlobalFormSchema,
} from '../schema/MaterialSchemaForm'
import { handleDefaultValue } from '../utils/helper'
import MaterialFormGlobalInformation from './Form/MaterialFormGlobalInfo'

type MaterialFormGlobalProps = {
  defaultValues?: MaterialDetailGlobalResponse
  materialRelation?: GetMaterialRelation
  isGlobal?: boolean
}

const MaterialFormGlobal = ({
  materialRelation,
  defaultValues,
  isGlobal,
}: MaterialFormGlobalProps) => {
  const router = useRouter()
  const params = useParams()
  const { t, i18n } = useTranslation(['common', 'material'])
  const locale = i18n.language
  const isEdit = Boolean(params?.id)
  const queryClient = useQueryClient()

  const methods = useForm<MaterialGlobalFormData>({
    resolver: yupResolver(materialGlobalFormSchema(t)),
    mode: 'onChange',
    defaultValues: handleDefaultValue(
      'global',
      defaultValues,
      materialRelation
    ),
  })
  const { handleSubmit, setError, watch, setValue } = methods

  const { program_ids, is_hierarchy, material_level_id, material_parent_ids } =
    watch()

  useEffect(() => {
    if (material_level_id && isEdit) {
      setValue('material_level_id', defaultValues?.material_level_id as number)
    }
  }, [material_level_id, isEdit])

  useEffect(() => {
    if (isEdit) {
      setValue('is_hierarchy', defaultValues?.hierarchy_code ? 1 : 0)
    }
  }, [isEdit])

  useEffect(() => {
    if (material_parent_ids && isEdit && material_level_id === 3) {
      setValue(
        'material_parent_ids',
        materialRelation
          ? materialRelation?.material_hierarchy?.[1]?.materials?.map(
              (item) => ({
                label: item.name,
                value: item.id,
              })
            )
          : undefined
      )
    }
  }, [isEdit])

  useEffect(() => {
    if (isEdit) {
      setValue(
        'is_managed_in_batch',
        defaultValues?.is_managed_in_batch as number
      )
    }
  }, [isEdit])

  useEffect(() => {
    if (isEdit) {
      setValue(
        'is_temperature_sensitive',
        defaultValues?.is_temperature_sensitive as number
      )
    }
  }, [isEdit])

  const { mutate, isPending } = useMutation({
    mutationFn: (data: unknown) =>
      isEdit
        ? updateMaterial(
            data as CreateMaterialInput,
            params?.id?.toString(),
            isGlobal
          )
        : createMaterial(data as CreateMaterialInput, isGlobal),
    onSuccess: () => {
      isEdit &&
        queryClient.invalidateQueries({
          queryKey: ['material', params?.id, locale],
        })
      toast.success({
        description: t(
          isEdit
            ? 'common:message.success.update'
            : 'common:message.success.create',
          {
            type: t('material:title.material')?.toLowerCase(),
          }
        ),
      })

      router.push(`/${locale}/v5/global-settings/material/data`)
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const response = error.response?.data as ErrorResponse
        toast.danger({ description: response.message })
        for (const item of Object.keys(response?.errors || {})) {
          setError(item as keyof MaterialGlobalFormData, {
            message: response?.errors?.[item][0].replaceAll('_', ' '),
          })
        }
      }
    },
  })

  const onValid: SubmitHandler<MaterialGlobalFormData> = (formData) => {
    const payload = {
      name: formData?.name,
      description: formData?.description ?? undefined,
      material_level_id: !Number(material_level_id)
        ? 3
        : Number(formData?.material_level_id),
      code: formData?.code,
      is_hierarchy: formData?.is_hierarchy,
      material_parent_ids: (
        formData?.material_parent_ids as { value: number }[]
      )?.[0]?.value
        ? [(formData?.material_parent_ids as { value: number }[])?.[0]?.value]
        : undefined,
      hierarchy_code: formData?.hierarchy_code
        ? formData?.hierarchy_code
        : undefined,
      unit_of_consumption_id: (
        formData?.unit_of_consumption_id as { value: number }
      )?.value,
      unit_of_distribution_id: (
        formData?.unit_of_distribution_id as { value: number }
      )?.value,
      consumption_unit_per_distribution_unit: Number(
        formData?.consumption_unit_per_distribution_unit
      ),
      min_temperature: formData?.is_temperature_sensitive
        ? Number(formData?.min_temperature)
        : 0,
      max_temperature: formData?.is_temperature_sensitive
        ? Number(formData?.max_temperature)
        : 0,
      is_temperature_sensitive: formData?.is_temperature_sensitive,
      min_retail_price: Number(formData?.min_retail_price),
      max_retail_price: Number(formData?.max_retail_price),
      material_type_id: (formData?.material_type_id as { value: number })
        ?.value,
      material_subtype_id:
        (formData?.material_subtype_id as { value?: number })?.value ?? null,
      is_managed_in_batch: formData?.is_managed_in_batch,
      is_stock_opname_mandatory: formData?.is_stock_opname_mandatory,
      program_ids: formData?.program_ids,
    }

    if (formData?.material_level_id === 2) {
      payload.hierarchy_code = formData?.hierarchy_code
      payload.material_parent_ids = undefined
    }
    if (formData?.material_level_id === 3 && formData?.is_hierarchy === 0) {
      payload.material_parent_ids = undefined
    }

    mutate(payload)
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onValid)}>
        <div className="ui-w-full ui-space-y-6 ui-max-w-form ui-mx-auto">
          <MaterialFormGlobalInformation isEdit={isEdit} />
          <ProgramSelection
            isMaterialHierarchyEnabled={is_hierarchy}
            selected={program_ids as number[]}
            onChange={(ids) => setValue('program_ids', ids)}
            forbiddenUncheckIds={defaultValues?.programs?.map(
              (program) => program?.id
            )}
          />
          <div className="ui-flex ui-justify-end">
            <div className="ui-grid ui-grid-cols-2 ui-w-[300px] ui-gap-2">
              <Button
                id="btn-back"
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                {t('common:back')}
              </Button>
              <Button id="btn-submit" type="submit" loading={isPending}>
                {t('common:save')}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}

export default MaterialFormGlobal

'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '#components/button'
import { OptionType } from '#components/react-select'
import { toast } from '#components/toast'
import useSmileRouter from '#hooks/useSmileRouter'
import {
  createMaterial,
  CreateMaterialInput,
  GetMaterialRelation,
  MaterialDetailProgramResponse,
  updateMaterial,
} from '#services/material'
import { ErrorResponse } from '#types/common'
import { AxiosError } from 'axios'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  MaterialProgramFormData,
  materialProgramFormSchema,
} from '../schema/MaterialSchemaForm'
import { handleDefaultValue } from '../utils/helper'
import MaterialFormProgramsInfo from './Form/MaterialFormProgramInfo'

type MaterialFormGlobalProps = {
  defaultValues?: MaterialDetailProgramResponse
  isGlobal?: boolean
  materialRelation?: GetMaterialRelation
}

const MaterialFormProgram = ({
  materialRelation,
  defaultValues,
  isGlobal,
}: MaterialFormGlobalProps) => {
  const router = useSmileRouter()
  const params = useParams()
  const { t, i18n } = useTranslation(['common', 'material'])
  const isEdit = Boolean(params?.id)
  const queryClient = useQueryClient()

  const methods = useForm<any>({
    resolver: yupResolver(
      materialProgramFormSchema(t, defaultValues?.material_level_id)
    ),
    mode: 'onBlur',
    defaultValues: handleDefaultValue(
      'program',
      defaultValues,
      materialRelation
    ),
  })
  const { handleSubmit, setError, watch, setValue } = methods
  const { companion_material } = watch()

  useEffect(() => {
    if (
      !companion_material &&
      isEdit &&
      defaultValues?.material_level_id === 3
    ) {
      setValue(
        'companion_material',
        materialRelation
          ? materialRelation?.material_hierarchy?.[2]?.materials?.map(
              (item) => ({
                label: item.name,
                value: item.id,
              })
            )
          : undefined
      )
    }
  }, [companion_material])

  const { mutate, isPending } = useMutation({
    mutationFn: (data: unknown) =>
      isEdit
        ? updateMaterial(data as CreateMaterialInput, params?.id?.toString())
        : createMaterial(data as CreateMaterialInput),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['material', params?.id, i18n?.language],
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

      router.push('/v5/material')
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const response = error.response?.data as ErrorResponse
        toast.danger({ description: response.message })
        for (const item of Object.keys(response?.errors || {})) {
          setError(item as keyof MaterialProgramFormData, {
            message: response?.errors?.[item]?.[0]?.replaceAll('_', ' ') ?? '',
          })
        }
      }
    },
  })

  const onValid: SubmitHandler<MaterialProgramFormData> = (formData) => {
    const payload = {
      material_companion: formData?.material_companion?.map(
        (item: OptionType) => item.value
      ),
      is_addremove: Number(formData?.is_addremove) || undefined,
      addremove: {
        entity_types: formData?.entity_types?.map((x) => x.value),
        roles: formData?.roles,
      },
      activities: formData?.activities?.map((item) => ({
        id: item.value,
        is_patient_needed: item.isPatientNeeded ? 1 : 0,
      })),
      manufactures: formData?.manufactures?.map((item: OptionType) =>
        Number(item.value)
      ),
    }

    mutate(payload)
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onValid)}>
        <div className="ui-w-full ui-space-y-6 ui-max-w-form ui-mx-auto">
          <MaterialFormProgramsInfo
            detailProgram={defaultValues as MaterialDetailProgramResponse}
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

export default MaterialFormProgram

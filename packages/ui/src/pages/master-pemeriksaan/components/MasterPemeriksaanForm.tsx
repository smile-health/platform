import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation } from '@tanstack/react-query'
import { Button } from '#components/button'
import { toast } from '#components/toast'
import useSmileRouter from '#hooks/useSmileRouter'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  masterPemeriksaanFormSchema,
  MasterPemeriksaanFormType,
} from '../schema/MasterPemeriksaanSchemaForm'
import {
  createMasterPemeriksaan,
  MasterPemeriksaanCreateData,
} from '../services/master-pemeriksaan.service'
import MasterPemeriksaanFormMainInfo from './Form/MasterPemeriksaanFormMainInfo'

type Props = {
  defaultValues?: Partial<MasterPemeriksaanFormType>
  isEdit?: boolean
}

export default function MasterPemeriksaanForm({
  defaultValues,
  // isEdit,
}: Props) {
  const { t } = useTranslation() as any
  const router = useSmileRouter()

  const methods = useForm<MasterPemeriksaanFormType>({
    resolver: yupResolver(masterPemeriksaanFormSchema(t)),
    defaultValues: defaultValues || {
      name: '',
      description: '',
      is_active: undefined,
      materials: [],
      jenis_pemeriksaan_id: null as any,
      parameter_ids: [],
      metode_ids: [],
    },
  })

  const createMutation = useMutation({
    mutationFn: createMasterPemeriksaan,
    onSuccess: () => {
      toast.success({
        description: t('common:success_create'),
      })
      router.push('/v5/master-pemeriksaan')
    },
    onError: (error: any) => {
      toast.danger({
        description: error?.response?.data?.message || t('common:error_create'),
      })
    },
  })

  const ExaminationFormFormatter = (
    data: MasterPemeriksaanFormType
  ): MasterPemeriksaanCreateData => {
    return {
      name: data.name,
      examination_type_id: data.jenis_pemeriksaan_id ?? 0,
      description: data.description || '',
      is_active: data.is_active,
      method_ids: data.metode_ids.filter(
        (id): id is number => id !== undefined
      ),
      parameters: data.parameter_ids
        .filter((id): id is number => id !== undefined)
        .map((id, index) => ({
          id: id,
          sort_order: index + 1,
        })),
      materials: data.materials.map((material) => ({
        material_id: material.template_id,
        target_group_ids: material.sasaran_ids.filter(
          (id): id is number => id !== undefined
        ),
      })),
    }
  }

  const onSubmit = async (data: MasterPemeriksaanFormType) => {
    const formattedData = ExaminationFormFormatter(data)
    await createMutation.mutateAsync(formattedData)
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="ui-mt-6 ui-space-y-6 ui-max-w-form ui-mx-auto"
      >
        <MasterPemeriksaanFormMainInfo />

        <div className="ui-flex ui-justify-end">
          <div className="ui-grid ui-grid-cols-2 ui-w-[300px] ui-gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={createMutation.isPending}
            >
              {t('common:back')}
            </Button>
            <Button type="submit" loading={createMutation.isPending}>
              {t('common:save')}
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}

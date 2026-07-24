import { FormProvider, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '#components/button'
import { toast } from '#components/toast'
import {
  masterParameterFormSchema,
  MasterParameterFormType,
} from '../schema/MasterParameterSchemaForm'
import MasterParameterFormMainInfo from './Form/MasterParameterFormMainInfo'
import useSmileRouter from '#hooks/useSmileRouter'
import {
  createMasterParameter,
  updateMasterParameter,
} from '../services/master-parameter.service'

type Props = {
  defaultValues?: Partial<MasterParameterFormType>
  isEdit?: boolean
  id?: number
}

export default function MasterParameterForm({
  defaultValues,
  isEdit,
  id,
}: Props) {
  const { t } = useTranslation() as any
  const router = useSmileRouter()
  const queryClient = useQueryClient()

  const methods = useForm<MasterParameterFormType>({
    resolver: yupResolver(masterParameterFormSchema(t)),
    defaultValues: defaultValues || {
      name: '',
      unit: '',
      description: '',
    },
  })

  const createMutation = useMutation({
    mutationFn: createMasterParameter,
    onSuccess: () => {
      toast.success({
        description: t('common:success_create'),
      })
      queryClient.invalidateQueries({
        queryKey: ['master-parameter'],
      })
      router.push('/v5/master-parameter')
    },
    onError: (error: any) => {
      toast.danger({
        description:
          error?.response?.data?.message || t('common:error_create'),
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: MasterParameterFormType) =>
      updateMasterParameter(id!, data),
    onSuccess: () => {
      toast.success({
        description: t('common:success_update'),
      })
      queryClient.invalidateQueries({
        queryKey: ['master-parameter'],
      })
      router.push('/v5/master-parameter')
    },
    onError: (error: any) => {
      toast.danger({
        description:
          error?.response?.data?.message || t('common:error_update'),
      })
    },
  })

  const onSubmit = (data: MasterParameterFormType) => {
    if (isEdit) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="ui-mt-6 ui-space-y-6 ui-max-w-form ui-mx-auto"
      >
        <MasterParameterFormMainInfo />

        <div className="ui-flex ui-justify-end">
          <div className="ui-grid ui-grid-cols-2 ui-w-[300px] ui-gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              {t('common:back')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('common:saving') : t('common:save')}
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}

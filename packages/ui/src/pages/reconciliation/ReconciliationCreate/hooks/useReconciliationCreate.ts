import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useProgram } from '#hooks/program/useProgram'
import useSmileRouter from '#hooks/useSmileRouter'
import { hasPermission } from '#shared/permission/index'
import { ErrorResponse } from '#types/common'
import { getUserStorage } from '#utils/storage/user'
import { AxiosError } from 'axios'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { createReconciliation } from '../reconciliation-create.services'
import {
  ReconciliationCreateForm,
  ReconciliationPayload,
} from '../reconciliation-create.type'
import { schemaCreate } from '../schema/ReconciliationCreateSchemaValidation'

export const useReconciliationCreate = () => {
  const isSuperAdmin = hasPermission('reconciliation-enable-select-entity')
  const userStorage = getUserStorage()
  const { activeProgram } = useProgram()
  const { t } = useTranslation(['reconciliation', 'common'])
  const router = useSmileRouter()
  const methods = useForm<ReconciliationCreateForm>({
    resolver: yupResolver(schemaCreate(t)),
    mode: 'onChange',
    defaultValues: {
      material: null,
      entity: isSuperAdmin
        ? null
        : { label: userStorage?.entity?.name, value: activeProgram?.entity_id },
      activity: null,
      period_date: null,
      opname_stock_items: [],
    },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ReconciliationPayload) => createReconciliation(data),
    onSuccess: () => {
      toast.success({
        description: t('common:message.success.create', {
          type: t('reconciliation:title.reconciliation')?.toLowerCase(),
        }),
      })
      router.push('v5/reconciliation')
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const response = error.response?.data as ErrorResponse
        toast.danger({ description: response.message })
      }
    },
  })

  const onValid: SubmitHandler<ReconciliationCreateForm> = (formData) => {
    const { period_date, activity, entity, material, opname_stock_items } =
      formData
    const start_date = period_date?.start?.toString()
    const end_date = period_date?.end?.toString()
    const items = opname_stock_items?.map((i) => ({
      ...i,
      actual_qty : Number(i?.actual_qty),
      reasons : i?.reasons ? i.reasons?.map((i) => ({ id : i?.id})) : [],
      actions : i?.actions ? i.actions?.map((i) => ({ id : i?.id})) : []
    }))
    const payload: ReconciliationPayload = {
      entity_id: entity?.value,
      activity_id: activity?.value,
      start_date,
      end_date,
      material_id: material?.id,
      items: items,
    }
    mutate(payload)
  }

  return {
    methods,
    onSubmit: methods.handleSubmit(onValid),
    isSuperAdmin,
    isPending,
  }
}

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { getReconciliationGenerate } from '../reconciliation-create.services'
import {
  ReconciliationCreateForm,
  ReconciliationGenerateParams,
} from '../reconciliation-create.type'

export const useReconciliationTable = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation('reconciliation')
  const {
    watch,
    setValue,
    control,
    formState: { errors },
    clearErrors,
  } = useFormContext<ReconciliationCreateForm>()
  const { period_date, entity, material, activity } = watch()
  const start_date = period_date?.start?.toString()
  const end_date = period_date?.end?.toString()

  const params: ReconciliationGenerateParams = {
    entity_id: entity?.value,
    material_id: material?.id ?? null,
    activity_id: activity?.value,
    start_date: start_date,
    end_date: end_date,
  }
  const enabledQuery = Boolean(
    entity?.value && material?.id && activity?.value && period_date
  )

  const { data, isLoading, isFetching, isSuccess } = useQuery({
    queryKey: ['reconciliation-generate', params, language],
    queryFn: () => getReconciliationGenerate(params),
    enabled: enabledQuery,
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (isSuccess) {
      const items = data.data?.map((item) => ({
        ...item,
        actual_qty: 0,
        actions: null,
        reasons: null,
      }))
      setValue('opname_stock_items', items)
    } else {
      setValue('opname_stock_items', [])
    }
    clearErrors('opname_stock_items')
  }, [isFetching, isLoading, isSuccess])

  const columns = [
    {
      header: t('list.table.column.no'),
      id: 'no',
      size: 20,
    },
    {
      header: t('list.table.description'),
      id: 'reconciliation_category_label',
    },
    {
      header: 'SMILE',
      id: 'recorded_qty',
      size: 96,
    },
    {
      header: t('list.table.real'),
      size: 184,
      id: 'actual_qty',
    },
    {
      header: t('list.table.reason_action'),
      id: 'reason_action',
    },
  ]

  return {
    data,
    isLoading: isLoading || isFetching,
    watch,
    control,
    enabledQuery,
    columns,
    setValue,
    errors,
    clearErrors,
  }
}

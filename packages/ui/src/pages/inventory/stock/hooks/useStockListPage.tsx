import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import { useFilter, UseFilter } from '#components/filter'
import { toast } from '#components/toast'
import { ENTITY_TYPE } from '#constants/entity'
import { useSetExportPopupStore } from '#hooks/useSetExportPopup'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { exportStock, listStock } from '#services/stock'
import { hasPermission } from '#shared/permission/index'
import { Stock } from '#types/stock'
import { getReactSelectValue } from '#utils/react-select'
import { getProgramStorage } from '#utils/storage/program'
import { getUserStorage } from '#utils/storage/user'
import { AxiosError } from 'axios'
import { parseAsInteger, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { createFilterSchema } from '../schema/StockSchemaList'

type InititalFilter = {
  province: { value: number; label: string } | null
  regency: { value: number; label: string } | null
}

export const useStockListPage = (isHierarchical: boolean) => {
  const { t } = useTranslation(['stock', 'common'])
  const { t: tDashboard } = useTranslation('dashboard')

  const params = useSearchParams()
  const onlyHaveQty = params.get('only_have_qty')

  const { push, getAsLink } = useSmileRouter()
  const [pagination, setPagination] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      paginate: parseAsInteger.withDefault(10),
    },
    {
      history: 'push',
    }
  )

  const user = getUserStorage()
  const program = getProgramStorage()
  const isManager = hasPermission('stock-view-filter-entity')
  const entityType = useMemo(() => user?.entity.type ?? 0, [user?.entity])
  const optionUserEntity = useMemo(
    () => [{ label: user?.entity.name ?? '', value: program?.entity_id }],
    [user?.entity, program]
  )
  const initialFilter: InititalFilter = { province: null, regency: null }
  if (isManager && entityType && user) {
    if (entityType >= ENTITY_TYPE.PROVINSI && user.entity.province)
      initialFilter.province = {
        value: Number(user.entity.province?.id),
        label: user.entity.province?.name,
      }
    if (entityType >= ENTITY_TYPE.KOTA && user.entity.regency)
      initialFilter.regency = {
        value: Number(user.entity.regency?.id),
        label: user.entity.regency?.name,
      }
  }
  const filterSchema = useMemo<UseFilter>(
    () =>
      createFilterSchema({
        t,
        tDashboard,
        isHierarchical,
        optionUserEntity,
        isManager,
        entityType,
        initialFilter,
      }),
    [isManager, entityType, optionUserEntity]
  )
  const filter = useFilter(filterSchema)

  const createParams = (isExport: boolean = false) => {
    const {
      keyword,
      entity_user_id,
      activity_id,
      material_type_id,
      material_id,
      entity_tag_id,
      province_id,
      regency_id,
      entity_id,
      date_range,
      primary_vendor_id,
      batch_ids,
    } = filter.query

    const params = {
      ...(!isExport && {
        page: pagination.page || 1,
        paginate: pagination.paginate || 10,
      }),
      keyword: keyword,
      only_have_qty: onlyHaveQty ?? 1,
      ...(activity_id && { activity_id: getReactSelectValue(activity_id) }),
      ...(material_type_id && {
        material_type_id: getReactSelectValue(material_type_id),
      }),
      ...(material_id && { material_id: getReactSelectValue(material_id) }),
      ...(entity_user_id && { entity_id: getReactSelectValue(entity_user_id) }),
      ...(entity_tag_id && {
        entity_tag_id: getReactSelectValue(entity_tag_id),
      }),
      ...(province_id && { province_id: getReactSelectValue(province_id) }),
      ...(regency_id && { regency_id: getReactSelectValue(regency_id) }),
      ...(entity_id && { entity_id: getReactSelectValue(entity_id) }),
      ...(material_id && { material_id: getReactSelectValue(material_id) }),
      ...(primary_vendor_id && {
        entity_id: getReactSelectValue(primary_vendor_id),
      }),
      ...(batch_ids && { batch_ids: getReactSelectValue(batch_ids) }),
      ...(date_range && {
        expired_start_date: date_range.start,
        expired_end_date: date_range.end,
      }),
    }

    return params
  }

  const { data: datasource, isFetching } = useQuery({
    queryKey: ['stocks', filter.query, pagination],
    queryFn: () => {
      const params = createParams()

      return listStock(params)
    },
    placeholderData: keepPreviousData,
  })

  const {
    mutate: mutateExport,
    isPending: isPendingExport,
    isSuccess: isSuccessExport,
  } = useMutation({
    mutationKey: ['export-stocks'],
    mutationFn: () => {
      const params = createParams(true)

      return exportStock(params)
    },
    onError: (err: AxiosError) => {
      const { message } = err.response?.data as { message: string }
      toast.danger({ description: message })
    },
  })

  const handleChangePage = (page: number) => setPagination({ page })

  const handleChangePaginate = (paginate: number) =>
    setPagination({ paginate, page: 1 })

  const handleSelectRow = (data: Stock) => {
    const { date_range, batch_ids, activity_id } = filter.query
    const params = {
      ...(data.entity && { entity_id: String(data.entity.id) }),
      ...(data.material && { material_id: String(data.material.id) }),
      ...(batch_ids && { batch_ids: getReactSelectValue(batch_ids) }),
      ...(activity_id && { activity_id: getReactSelectValue(activity_id) }),
      ...(date_range && {
        expired_start_date: date_range.start,
        expired_end_date: date_range.end,
      }),
    }

    if (params.entity_id && params.material_id)
      push('/v5/stock/detail', undefined, params)
  }

  const createUrlDetail = (data: Stock): string => {
    const { date_range, batch_ids, activity_id } = filter.query
    const params = {
      ...(data.entity && { entity_id: String(data.entity.id) }),
      ...(data.material && { material_id: String(data.material.id) }),
      ...(batch_ids && { batch_ids: getReactSelectValue(batch_ids) }),
      ...(activity_id && { activity_id: getReactSelectValue(activity_id) }),
      ...(date_range && {
        expired_start_date: date_range.start,
        expired_end_date: date_range.end,
      }),
    }

    return getAsLink('/v5/stock/detail', undefined, params)
  }

  useSetLoadingPopupStore(isFetching || isPendingExport)
  useSetExportPopupStore(isSuccessExport)

  return {
    filter,
    pagination,
    datasource,
    isFetching,
    handleChangePage,
    handleChangePaginate,
    setPagination,
    handleExport: mutateExport,
    handleSelectRow,
    createUrlDetail,
  }
}

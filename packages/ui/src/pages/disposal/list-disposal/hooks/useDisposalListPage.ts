import { useEffect, useMemo, useState } from 'react'
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import { useFilter, UseFilter } from '#components/filter'
import { toast } from '#components/toast'
import { ENTITY_TYPE } from '#constants/entity'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { hasPermission } from '#shared/permission/index'
import { getReactSelectValue } from '#utils/react-select'
import { getProgramStorage } from '#utils/storage/program'
import { getUserStorage } from '#utils/storage/user'
import { AxiosError } from 'axios'
import { parseAsInteger, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { createFilterSchema } from '../schemas/DisposalSchemaList'
import { exportDisposal, listDisposal } from '../services/disposal-list'
import { Disposal } from '../types/disposal'

type InititalFilter = {
  province: { value: number; label: string } | null
  regency: { value: number; label: string } | null
}

export const useDisposalListPage = () => {
  const isHierarchical =
    getProgramStorage()?.config?.material?.is_hierarchy_enabled
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'disposalList'])

  const { t: tDashboard } = useTranslation('dashboard')

  const { push } = useSmileRouter()
  const [isNavigating, setIsNavigating] = useState(false)
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
  const isAdmin = hasPermission('disposal-list-view')
  const entityType = useMemo(() => user?.entity.type ?? 0, [user?.entity])
  const optionUserEntity = useMemo(
    () => [{ label: user?.entity.name ?? '', value: program?.entity_id }],
    [user?.entity, program]
  )
  let initialFilter: InititalFilter = { province: null, regency: null }
  if (!isAdmin && entityType && user) {
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
        isAdmin,
        entityType,
        initialFilter,
      }),
    [isAdmin, entityType, optionUserEntity, t, tDashboard, language]
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
      primary_vendor_id,
      batch_ids,
      expired_date,
    } = filter.query

    const params = {
      ...(!isExport && {
        page: String(pagination.page || 1),
        paginate: String(pagination.paginate || 10),
      }),
      keyword: keyword,
      only_have_qty: '1',
      ...(activity_id && {
        activity_id: String(getReactSelectValue(activity_id)),
      }),
      ...(material_type_id && {
        material_type_id: String(getReactSelectValue(material_type_id)),
      }),
      ...(material_id && {
        material_id: String(getReactSelectValue(material_id)),
      }),
      ...(entity_user_id && {
        entity_id: String(getReactSelectValue(entity_user_id)),
      }),
      ...(entity_id && { entity_id: String(getReactSelectValue(entity_id)) }),
      ...(entity_tag_id && {
        entity_tag_id: String(getReactSelectValue(entity_tag_id)),
      }),
      ...(province_id && {
        province_id: String(getReactSelectValue(province_id)),
      }),
      ...(regency_id && {
        regency_id: String(getReactSelectValue(regency_id)),
      }),
      ...(batch_ids && { batch_ids: String(getReactSelectValue(batch_ids)) }),
      ...(primary_vendor_id && {
        entity_id: String(getReactSelectValue(primary_vendor_id)),
      }),
      ...(expired_date && {
        expired_from: expired_date.start,
        expired_to: expired_date.end,
      }),
    }

    return params
  }

  const handleChangePage = (page: number) => setPagination({ page })

  const handleChangePaginate = (paginate: number) =>
    setPagination({ paginate, page: 1 })

  const handleSelectRow = (disposal: Disposal) => {
    setIsNavigating(true)
    const { activity_id, material_id, batch_ids, expired_date } = filter.query

    const params = {
      material_id: String(disposal.material_id || disposal.material_id),
      entity_id: String(disposal.entity_id),
      ...(activity_id && {
        activity_id: String(getReactSelectValue(activity_id)),
      }),
      ...(material_id && {
        material_id: String(getReactSelectValue(material_id)),
      }),
      ...(batch_ids && { batch_ids: String(getReactSelectValue(batch_ids)) }),
      ...(expired_date && {
        expired_from: expired_date.start,
        expired_to: expired_date.end,
      }),
    }

    push(`/v5/stock-pemusnahan/detail`, null, params)
  }

  const { data: datasource, isFetching } = useQuery({
    queryKey: ['disposal-list', filter.query, pagination],
    queryFn: () => {
      const params = createParams()
      return listDisposal(params)
    },
    placeholderData: keepPreviousData,
    enabled: !isNavigating,
  })

  const { mutate: mutateExport, isPending: isPendingExport } = useMutation({
    mutationKey: [],
    mutationFn: () => {
      const params = createParams(true)

      return exportDisposal(params)
    },
    onError: (err: AxiosError) => {
      const { message } = err.response?.data as { message: string }
      toast.danger({ description: message })
    },
  })

  useSetLoadingPopupStore(isFetching || isPendingExport)

  // No debug log, but keep effect if needed for side-effects in future

  useEffect(() => {
    // Reset flag isNavigating saat unmount (keluar dari halaman list)
    return () => setIsNavigating(false)
  }, [])

  return {
    t,
    language,
    filter,
    pagination,
    setPagination,
    handleChangePage,
    handleChangePaginate,
    handleExport: mutateExport,
    datasource,
    isFetching,
    handleSelectRow,
  }
}

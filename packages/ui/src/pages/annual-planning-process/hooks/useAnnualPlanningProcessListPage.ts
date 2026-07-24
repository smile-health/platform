import { useMemo, useCallback, useState } from "react"
import { useTranslation } from "react-i18next"

import { ENTITY_TYPE } from "#constants/entity"
import { getUserStorage } from "#utils/storage/user"
import { parseAsInteger, useQueryStates } from "nuqs"
import { useFilter, UseFilter } from "#components/filter"
import { createFilterSchema } from "../annual-planning-process.schemas"
import { useMutation, useQuery } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { toast } from "#components/toast"
import { useSetLoadingPopupStore } from "#hooks/useSetLoading"
import {
  activateMinMaxDistrictAnnualPlanningProcess,
  activateMinMaxProvinceAnnualPlanningProcess,
  listAnnualPlanningProcessDistrict,
  listAnnualPlanningProcessProvince
} from "../annual-planning-process.services"
import { AnnualNeedsDataProvince, AnnualPlanningProcessDataDistrict, UserTag } from "../annual-planning-process.types"
import { hasPermission } from "#shared/permission/index"
import { getReactSelectLabel, getReactSelectValue } from "#utils/react-select"
import useSmileRouter from "#hooks/useSmileRouter"
import { AnnualPlanningProcessStatus, MinMaxStatus } from "../annual-planning-process.constants"
import { columnsDistrict, columnsProvince } from "../annual-planning-process.table-list"
import { getProgramStorage } from "#utils/storage/program"

export const useAnnualPlanningProcessListPage = () => {
  const { t } = useTranslation(['annualPlanningProcess', 'common'])
  const user = getUserStorage()
  const isViewOnly = !!user?.view_only
  const program = getProgramStorage()
  const { push, getAsLink } = useSmileRouter()
  const isSuperadmin = hasPermission('annual-planning-process-view-superadmin')
  const [pagination, setPagination] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      paginate: parseAsInteger.withDefault(10),
    },
    {
      history: 'push',
    }
  )
  const [activateMinMaxDistrict, setActivateMinMaxDistrict] = useState<{
    open: boolean
    ids: number[]
  }>({
    open: false,
    ids: []
  })
  const [activateMinMaxProvince, setActivateMinMaxProvince] = useState(false)

  const defaultValueProvince = useMemo(() => {
    if (!isSuperadmin && user?.entity.province && user?.entity.type === ENTITY_TYPE.PROVINSI) {
      return {
        label: user?.entity.province?.name,
        value: user?.entity.province?.id,
      }
    }
    return null
  }, [user, isSuperadmin])

  const filterSchema = useMemo<UseFilter>(() => createFilterSchema({
    t, defaultValueProvince, isSuperadmin
  }), [t, defaultValueProvince, isSuperadmin])
  const filter = useFilter(filterSchema)
  const { program_plan_year, province_id, status } = filter.query

  const userTag: UserTag = useMemo(() => {
    if (user?.entity.type === ENTITY_TYPE.PROVINSI) return ENTITY_TYPE.PROVINSI
    if (user?.entity.type === ENTITY_TYPE.KOTA) return ENTITY_TYPE.KOTA
    if (user?.entity.type === ENTITY_TYPE.PRIMARY_VENDOR) return ENTITY_TYPE.PRIMARY_VENDOR
    return null
  }, [user])

  const shouldFetchProvince = useMemo(() => {
    if (
      isSuperadmin ||
      userTag === ENTITY_TYPE.PROVINSI ||
      userTag === ENTITY_TYPE.PRIMARY_VENDOR
    ) return !!(filter.query?.province_id?.value && filter.query?.program_plan_year?.value)

    return false
  }, [filter.query, isSuperadmin, userTag])
  const shouldFetchDistrict = userTag === ENTITY_TYPE.KOTA && !!program?.entity_id

  const {
    data: datasourceProvince,
    isFetching: isFetchingProvince,
    refetch: refetchProvince,
  } = useQuery({
    queryKey: ['annual-planning-process-province', filter.query, pagination],
    queryFn: () => {
      const params = {
        page: pagination.page || 1,
        paginate: pagination.paginate || 10,
        ...program_plan_year && { program_plan_year: getReactSelectValue(program_plan_year) },
        ...province_id && { province_id: getReactSelectValue(province_id) },
        ...status && { status: getReactSelectValue(status) },
      }
      setActivateMinMaxDistrict(prev => ({ ...prev, open: false, ids: [] }))
      return listAnnualPlanningProcessProvince(params)
    },
    enabled: shouldFetchProvince,
  })

  const {
    data: datasourceDistrict,
    isFetching: isFetchingDistrict,
  } = useQuery({
    queryKey: ['annual-planning-process-district'],
    queryFn: () => listAnnualPlanningProcessDistrict(program?.entity_id ?? 0),
    enabled: shouldFetchDistrict,
  })

  const {
    mutate: mutateActivateMinMaxProvince,
    isPending: isPendingActivateMinMaxProvince,
  } = useMutation({
    mutationKey: ['activate-min-max-province-annual-planning-process'],
    mutationFn: () => {
      const payload = {
        province_id: Number(getReactSelectValue(province_id)),
        program_plan_id: Number(program_plan_year?.id),
      }

      return activateMinMaxProvinceAnnualPlanningProcess(payload)
    },
    onSuccess: () => {
      refetchProvince()
      toast.success({ description: t('annualPlanningProcess:list.min_max.toast.success') })
    },
    onError: (err: AxiosError) => {
      const { message } = err.response?.data as { message: string }
      toast.danger({ description: message })
    },
  })

  const {
    mutate: mutateActivateMinMaxDistrict,
    isPending: isPendingActivateMinMaxDistrict,
  } = useMutation({
    mutationKey: ['activate-min-max-district-annual-planning-process'],
    mutationFn: () => {
      const payload = {
        annual_need_ids: activateMinMaxDistrict.ids,
        program_plan_id: Number(program_plan_year?.id),
      }

      return activateMinMaxDistrictAnnualPlanningProcess(payload)
    },
    onSuccess: () => {
      refetchProvince()
      setActivateMinMaxDistrict({ open: false, ids: [] })
      toast.success({ description: t('annualPlanningProcess:list.min_max.toast.success') })
    },
    onError: (err: AxiosError) => {
      const { message } = err.response?.data as { message: string }
      toast.danger({ description: message })
    },
  })

  const handleActivateMinMaxDistrict = () => {
    if (activateMinMaxDistrict.ids.length === 0) return
    mutateActivateMinMaxDistrict()
  }

  const handleSelectRow = useCallback((data: AnnualPlanningProcessDataDistrict | AnnualNeedsDataProvince) => {
    const { status, id } = data
    if (isViewOnly) {
      if (status === AnnualPlanningProcessStatus.DRAFT) return

      return push(`/v5/annual-planning/${id}`)
    }

    if (userTag === ENTITY_TYPE.PROVINSI || userTag === ENTITY_TYPE.PRIMARY_VENDOR) {
      if (status === AnnualPlanningProcessStatus.DESK) {
        return push(`/v5/annual-planning/${id}/review`)
      } else if (status === AnnualPlanningProcessStatus.DRAFT || status === AnnualPlanningProcessStatus.REVISION) {
        return
      }
    } else if (userTag === ENTITY_TYPE.KOTA) {
      if (status === AnnualPlanningProcessStatus.REVISION) {
        return push(`/v5/annual-planning/${id}/revision`)
      } else if (status === AnnualPlanningProcessStatus.DRAFT) {
        return push(`/v5/annual-planning/${id}/draft`)
      }
    }
    return push(`/v5/annual-planning/${id}`)
  }, [userTag, push, isViewOnly])

  const createUrlDetail = useCallback((data: AnnualPlanningProcessDataDistrict | AnnualNeedsDataProvince): string => {
    const { status, id } = data
    if (isViewOnly) {
      if (status === AnnualPlanningProcessStatus.DRAFT) return ''

      return getAsLink(`/v5/annual-planning/${id}`)
    }

    if (userTag === ENTITY_TYPE.PROVINSI || userTag === ENTITY_TYPE.PRIMARY_VENDOR) {
      if (status === AnnualPlanningProcessStatus.DESK) {
        return getAsLink(`/v5/annual-planning/${id}/review`)
      } else if (status === AnnualPlanningProcessStatus.DRAFT) {
        return ''
      }
    } else if (userTag === ENTITY_TYPE.KOTA) {
      if (status === AnnualPlanningProcessStatus.REVISION) {
        return getAsLink(`/v5/annual-planning/${id}/revision`)
      } else if (status === AnnualPlanningProcessStatus.DRAFT) {
        return getAsLink(`/v5/annual-planning/${id}/draft`)
      }
    }

    return getAsLink(`/v5/annual-planning/${id}`)
  }, [userTag, getAsLink, isViewOnly])

  const handleCreate = () => push('/v5/annual-planning/create')

  const emptyMessage: null | { title: string; description: string } = useMemo(() => {
    if (userTag === ENTITY_TYPE.PROVINSI || userTag === ENTITY_TYPE.PRIMARY_VENDOR) {
      return {
        title: t('annualPlanningProcess:list.empty.title'),
        description: t('annualPlanningProcess:list.empty.description')
      }
    }
    return null
  }, [userTag, t])

  const metaPagination = useMemo(() => {
    if (userTag === ENTITY_TYPE.PROVINSI || userTag === ENTITY_TYPE.PRIMARY_VENDOR) {
      return {
        list_pagination: datasourceProvince?.list_pagination,
        total_item: datasourceProvince?.total_item,
        total_page: datasourceProvince?.total_page,
      }
    }

    return {
      list_pagination: datasourceDistrict?.list_pagination,
      total_item: datasourceDistrict?.total_item,
      total_page: datasourceDistrict?.total_page,
    }
  }, [datasourceProvince, datasourceDistrict, userTag])

  const handleCheckIds = (type: string, id?: number) => {
    if (type === 'all') {
      const ids: number[] = []

      if (activateMinMaxDistrict.ids.length === 0) {
        datasourceProvince?.data?.annual_needs.forEach((item) => {
          if (item?.id && item.status === AnnualPlanningProcessStatus.APPROVED && item.min_max_status !== MinMaxStatus.ACTIVE) ids.push(item.id)
        })
      }

      setActivateMinMaxDistrict(prev => ({ ...prev, ids }))
    } else {
      const ids = id && !activateMinMaxDistrict.ids.includes(id) ?
        [...activateMinMaxDistrict.ids, id] :
        activateMinMaxDistrict.ids.filter((item) => item !== id)

      setActivateMinMaxDistrict(prev => ({ ...prev, ids }))
    }
  }

  const minMaxAnnualNeedIdsActivated: number[] = useMemo(() => {
    return datasourceProvince?.data?.annual_needs.filter(
      (item) => item.min_max_status === MinMaxStatus.ACTIVE
    ).map(
      (item) => item.id as number
    ) ?? []
  }, [datasourceProvince])

  const memoizedColumnsProvince = useMemo(() => columnsProvince({
    onClickRow: handleSelectRow,
    t,
    no: (pagination.page - 1) * pagination.paginate,
    createUrlDetail,
    showCheckbox: activateMinMaxDistrict.open,
    selectedIds: activateMinMaxDistrict.ids,
    onCheckedChange: (type: string, id?: number) => handleCheckIds(type, id),
    isViewOnly,
    minMaxAnnualNeedIdsActivated
  }), [
    handleSelectRow,
    t,
    createUrlDetail,
    pagination.page,
    pagination.paginate,
    isViewOnly,
    minMaxAnnualNeedIdsActivated,
  ])

  const memoizedColumnsDistrict = useMemo(() => columnsDistrict({
    onClickRow: handleSelectRow,
    t,
    no: (pagination.page - 1) * pagination.paginate,
    createUrlDetail,
    isViewOnly
  }), [handleSelectRow, t, createUrlDetail, pagination.page, pagination.paginate, isViewOnly])

  useSetLoadingPopupStore(
    isFetchingDistrict ||
    isFetchingProvince ||
    isPendingActivateMinMaxProvince ||
    isPendingActivateMinMaxDistrict
  )

  const provinceName = getReactSelectLabel(province_id)
  const contextValue = useMemo(() => ({
    setPagination,
    activateMinMaxDistrict,
    setActivateMinMaxDistrict,
    setActivateMinMaxProvince,
    handleActivateMinMaxDistrict,
    datasourceProvince,
    program_plan_year,
    province_id,
    provinceName,
    filter: {
      getValues: filter.getValues,
      handleSubmit: filter.handleSubmit,
      renderActiveFilter: filter.renderActiveFilter,
      renderField: filter.renderField,
      reset: filter.reset,
    },
  }), [
    setPagination,
    activateMinMaxDistrict,
    setActivateMinMaxDistrict,
    setActivateMinMaxProvince,
    handleActivateMinMaxDistrict,
    datasourceProvince,
    filter.getValues,
    filter.handleSubmit,
    filter.renderActiveFilter,
    filter.renderField,
    filter.reset,
    program_plan_year,
    province_id,
    provinceName,
  ])

  return {
    t,
    userTag,
    isFetchingDistrict,
    isFetchingProvince,
    datasourceDistrict,
    datasourceProvince,
    metaPagination,
    pagination,
    emptyMessage,
    setPagination,
    handleCreate,
    memoizedColumnsProvince,
    memoizedColumnsDistrict,
    provinceName,
    activateMinMaxProvince,
    setActivateMinMaxProvince,
    mutateActivateMinMaxProvince,
    contextValue,
  }
}
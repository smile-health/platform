import { useEffect, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { SortingState } from '@tanstack/react-table'
import { useFilter, UseFilter } from '#components/filter'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'
import { loadCoreEntities, loadEntities } from '#services/entity'
import { loadProvinces, loadRegencies } from '#services/location'
import { listEnvironmentalHealthHistory } from '../environmental-health-history.service'
import { listParameterCategoryOptions } from '../../analysis-parameter/analysis-parameter.service'

export const useEnvironmentalHealthHistoryList = () => {
  const { t } = useTranslation(['common', 'environmentalHealthHistory'])
  const [pagination, setPagination] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      paginate: parseAsInteger.withDefault(10),
    },
    {
      history: 'push',
    }
  )

  const [querySorting, setQuerySorting] = useQueryStates(
    {
      sort_by: parseAsString.withDefault('created_at'),
      sort_type: parseAsString.withDefault('desc'),
    },
    {
      history: 'push',
    }
  )
  const [sorting, setSorting] = useState<SortingState>(
    querySorting?.sort_by
      ? [
        {
          desc: querySorting?.sort_type === 'desc',
          id: querySorting?.sort_by,
        },
      ]
      : [{ desc: true, id: 'created_at' }]
  )
  useEffect(() => {
    setQuerySorting(
      sorting.length
        ? {
          sort_by: sorting[0].id,
          sort_type: sorting[0].desc ? 'desc' : 'asc',
        }
        : { sort_by: 'created_at', sort_type: 'desc' }
    )
  }, [sorting])

  const statusOptions = [
    { label: t('environmentalHealthHistory:filter.status_completed'), value: 'completed' },
    { label: t('environmentalHealthHistory:filter.status_pending'), value: 'pending' },
  ]

  const sampleCollectedByOptions = [
    { label: t('environmentalHealthHistory:filter.sample_collected_by_lab'), value: 'lab' },
    { label: t('environmentalHealthHistory:filter.sample_collected_by_customer'), value: 'customer' },
  ]

  const hasIklOptions = [
    { label: t('environmentalHealthHistory:filter.has_ikl_yes'), value: 'true' },
    { label: t('environmentalHealthHistory:filter.has_ikl_no'), value: 'false' },
  ]

  const filterSchema: UseFilter = [
    {
      type: 'text',
      name: 'keyword',
      label: t('common:search'),
      placeholder: t('environmentalHealthHistory:filter.search'),
      maxLength: 255,
      id: 'input-history-search',
      defaultValue: '',
    },
    {
      type: 'select-async-paginate',
      name: 'entity',
      label: t('environmentalHealthHistory:filter.entity'),
      placeholder: t('environmentalHealthHistory:filter.entity_placeholder'),
      loadOptions: loadEntities,
      additional: { page: 1, entity_tag_ids: 43, isGlobal: true },
      defaultValue: null,
      id: 'select-history-entity',
    },
    {
      type: 'select',
      name: 'parameter_category',
      label: t('environmentalHealthHistory:filter.parameter_category'),
      placeholder: t('environmentalHealthHistory:filter.parameter_category_placeholder'),
      loadOptions: async () => {
        const res = await listParameterCategoryOptions()
        return res?.data?.map((item) => ({
          label: item.name,
          value: item.id,
        })) ?? []
      },
      isUsingReactQuery: true,
      defaultValue: null,
      id: 'select-history-parameter-category',
    },
    {
      type: 'select',
      name: 'status',
      label: t('environmentalHealthHistory:filter.status'),
      placeholder: t('environmentalHealthHistory:filter.status_placeholder'),
      options: statusOptions,
      defaultValue: null,
      id: 'select-history-status',
    },
    {
      type: 'select',
      name: 'sample_collected_by',
      label: t('environmentalHealthHistory:filter.sample_collected_by'),
      placeholder: t('environmentalHealthHistory:filter.sample_collected_by_placeholder'),
      options: sampleCollectedByOptions,
      defaultValue: null,
      id: 'select-history-sample-collected-by',
    },
    {
      type: 'select',
      name: 'has_ikl',
      label: t('environmentalHealthHistory:filter.has_ikl'),
      placeholder: t('environmentalHealthHistory:filter.has_ikl_placeholder'),
      options: hasIklOptions,
      defaultValue: null,
      id: 'select-history-has-ikl',
    },
    {
      type: 'date-range-picker',
      name: 'date_range',
      label: t('environmentalHealthHistory:filter.date_range'),
      withPreset: true,
      defaultValue: null,
      id: 'date-range-history',
    },
    {
      type: 'select-async-paginate',
      name: 'province_id',
      label: t('common:form.province.label', { defaultValue: 'Provinsi' }),
      placeholder: t('common:form.province.placeholder', { defaultValue: 'Pilih Provinsi' }),
      loadOptions: loadProvinces,
      additional: { page: 1 },
      defaultValue: null,
      id: 'select-history-province',
    },
    {
      type: 'select-async-paginate',
      name: 'regency_id',
      label: t('common:form.city.label', { defaultValue: 'Kabupaten/Kota' }),
      placeholder: t('common:form.city.placeholder', { defaultValue: 'Pilih Kabupaten/Kota' }),
      loadOptions: loadRegencies,
      disabled: ({ getReactSelectValue }) => !getReactSelectValue('province_id'),
      additional: ({ getReactSelectValue }: { getReactSelectValue: any }) => ({
        page: 1,
        ...(getReactSelectValue('province_id') && {
          parent_id: getReactSelectValue('province_id'),
        }),
      }),
      defaultValue: null,
      id: 'select-history-regency',
    },
    {
      type: 'select-async-paginate',
      name: 'health_center_id',
      label: t('environmentalHealthHistory:filter.health_center', { defaultValue: 'Puskesmas' }),
      placeholder: t('environmentalHealthHistory:filter.health_center_placeholder', { defaultValue: 'Pilih Puskesmas' }),
      loadOptions: loadCoreEntities,
      disabled: ({ getReactSelectValue }) => !getReactSelectValue('regency_id'),
      additional: ({ getReactSelectValue }: { getReactSelectValue: any }) => ({
        page: 1,
        isGlobal: true,
        ...(getReactSelectValue('province_id') && {
          province_ids: getReactSelectValue('province_id'),
        }),
        ...(getReactSelectValue('regency_id') && {
          regency_ids: getReactSelectValue('regency_id'),
        }),
      }),
      defaultValue: null,
      id: 'select-history-health-center',
    },
  ]

  const filter = useFilter(filterSchema)

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['environmental-health-history', filter?.query, pagination, querySorting],
    queryFn: () => {
      const entityValue = filter?.query?.entity
      const paramCategoryValue = filter?.query?.parameter_category
      const statusValue = filter?.query?.status
      const sampleCollectedByValue = filter?.query?.sample_collected_by
      const hasIklValue = filter?.query?.has_ikl
      const dateRangeValue = filter?.query?.date_range
      const provinceValue = filter?.query?.province_id
      const regencyValue = filter?.query?.regency_id
      const healthCenterValue = filter?.query?.health_center_id

      return listEnvironmentalHealthHistory({
        keyword: filter?.query?.keyword,
        entity_id: entityValue?.value ?? undefined,
        parameter_category_id: paramCategoryValue?.value ?? undefined,
        status: statusValue?.value ?? undefined,
        sample_collected_by: sampleCollectedByValue?.value ?? undefined,
        has_ikl: hasIklValue?.value ?? undefined,
        start_date: dateRangeValue?.start ?? undefined,
        end_date: dateRangeValue?.end ?? undefined,
        province_id: provinceValue?.value ?? undefined,
        regency_id: regencyValue?.value ?? undefined,
        health_center_id: healthCenterValue?.value ?? undefined,
        sort_by: querySorting.sort_by || 'created_at',
        sort_type: querySorting.sort_type || 'desc',
        ...pagination,
      })
    },
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  })

  const handleChangeLimit = (paginate: number) =>
    setPagination({ paginate, page: 1 })

  return {
    pagination,
    setPagination,
    handleChangeLimit,
    data,
    isLoading: isLoading || isFetching,
    filter,
    setSorting,
    sorting,
  }
}

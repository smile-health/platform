import { useEffect, useState } from 'react'
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import { SortingState } from '@tanstack/react-table'
import { useFilter, UseFilter } from '#components/filter'
import { toast } from '#components/toast'
import { queryClient } from '#provider/query-client'
import { useLoadingPopupStore } from '#store/loading.store'
import { CommonType, ErrorResponse } from '#types/common'
import { getReactSelectValue } from '#utils/react-select'
import { AxiosError } from 'axios'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'

import {
  downloadTemplateAssetVendor,
  exportAssetVendor,
  getCoreAssetVendor,
  importAssetVendor,
  loadAssetVendorType,
  updateStatusAssetVendor,
} from '../asset-vendor.service'
import { ParamData } from '../asset-vendor.type'

type TModalImport = {
  type: 'import' | 'error' | null
  errors?: Record<string, string[]>
}

export const useAssetVendorList = ({ isGlobal = false }: CommonType = {}) => {
  const { t } = useTranslation(['assetVendor', 'common'])
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
      sort_by: parseAsString.withDefault(''),
      sort_type: parseAsString.withDefault(''),
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
      : []
  )
  const [modalImport, setModalImport] = useState<TModalImport>({
    type: null,
  })

  const showModal = (
    type: 'import' | 'error',
    errors?: Record<string, string[]>
  ) => {
    setModalImport({ type, errors })
  }

  const hideModal = () => {
    setModalImport({ type: null })
  }

  const { setLoadingPopup } = useLoadingPopupStore()

  useEffect(() => {
    setQuerySorting(
      sorting.length
        ? {
            sort_by: sorting[0].id,
            sort_type: sorting[0].desc ? 'desc' : 'asc',
          }
        : { sort_by: null, sort_type: null }
    )
  }, [sorting])

  const filterSchema: UseFilter = [
    {
      type: 'text',
      name: 'keyword',
      label: t('assetVendor:list.filter.search.label'),
      placeholder: t('assetVendor:list.filter.search.placeholder'),
      maxLength: 255,
      id: 'input-asset-vendor-search',
      defaultValue: '',
    },
    {
      type: 'select-async-paginate',
      name: 'asset_vendor_type_ids',
      id: 'select-vendor-type',
      isMulti: true,
      label: t('assetVendor:list.filter.type.label'),
      placeholder: t('assetVendor:list.filter.type.placeholder'),
      className: '',
      defaultValue: null,
      loadOptions: loadAssetVendorType,
      additional: {
        page: 1,
      },
    },
  ]

  const filter = useFilter(filterSchema)
  const {
    data: datasource,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['asset-vendor', filter?.query, pagination, querySorting],
    queryFn: () =>
      getCoreAssetVendor(
        {
          keyword: filter?.query?.keyword,
          program_ids: getReactSelectValue(filter?.query?.program_ids),
          asset_vendor_type_ids: getReactSelectValue(
            filter?.query?.asset_vendor_type_ids
          ),
          ...querySorting,
          ...pagination,
        },
        isGlobal
      ),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  })

  const { mutate: onUpdateStatus, isPending: isUpdateStatus } = useMutation({
    mutationFn: (data: ParamData) =>
      updateStatusAssetVendor(data?.id, data?.status, isGlobal),
    onMutate: () => setLoadingPopup(true),
    onSettled: () => {
      setLoadingPopup(false)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['asset-vendor'],
      })
      toast.success({
        description: t('common:message.success.update', {
          type: t('assetVendor:list.status')?.toLowerCase(),
        }),
      })
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const response = error.response?.data as ErrorResponse
        toast.danger({
          description: response.message || t('common:message.common.error'),
        })
      }
    },
  })

  const handleChangeLimit = (paginate: number) =>
    setPagination({ paginate, page: 1 })

  const exportQuery = useQuery({
    queryKey: ['asset-vendor-export', filter?.query],
    queryFn: () =>
      exportAssetVendor(
        {
          keyword: filter?.query?.keyword,
          asset_vendor_type_ids: getReactSelectValue(
            filter?.query?.asset_vendor_type_ids
          ),
          ...querySorting,
          ...pagination,
        },
        isGlobal
      ),
    enabled: false,
  })

  const downloadQuery = useQuery({
    queryKey: ['asset-vendor-download-template'],
    queryFn: downloadTemplateAssetVendor,
    enabled: false,
  })

  const { mutate: onImport, ...importMutation } = useMutation({
    mutationFn: (data: FormData) => importAssetVendor(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['asset-vendor'],
      })
      toast.success({
        description: t('common:message.success.add', {
          type: t('assetVendor:list.title').toLowerCase(),
        }),
      })
    },
    onError: (error: AxiosError) => {
      const { message, errors } = error.response?.data as {
        message: string
        errors?: TModalImport['errors']
      }

      if (
        !errors ||
        error?.response?.status === 500 ||
        errors?.hasOwnProperty('general')
      ) {
        const errMsg = errors?.general?.[0] ?? message
        toast.danger({
          description:
            errMsg ||
            t('common:message.failed.add', {
              type: t('assetVendor:list.title').toLowerCase(),
            }),
        })
      } else {
        showModal('error', errors)
      }
    },
  })

  return {
    datasource,
    isLoading: isLoading || isFetching,
    exportQuery,
    downloadQuery,
    handleChangeLimit,
    onUpdateStatus,
    t,
    filter,
    pagination,
    setPagination,
    sorting,
    setSorting,
    import: {
      modalImport,
      showModal,
      hideModal,
      onImport,
      importMutation,
    },
  }
}

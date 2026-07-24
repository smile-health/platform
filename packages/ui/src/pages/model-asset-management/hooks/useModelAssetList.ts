import { useEffect, useState } from 'react'
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import { SortingState } from '@tanstack/react-table'
import { useFilter, UseFilter } from '#components/filter'
import { PopupImportData } from '#components/modules/ModalImportV2'
import { toast } from '#components/toast'
import { queryClient } from '#provider/query-client'
import { loadAssetType } from '#services/asset-type'
import { loadManufacturers } from '#services/manufacturer'
import { CommonType } from '#types/common'
import { getReactSelectValue } from '#utils/react-select'
import { AxiosError } from 'axios'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { ModalImportErrors } from '../../activity/activity.type'
import { IMPORT_CONFIGS } from '../asset-model.constants'
import {
  downloadTemplateAssetModel,
  exportModelAsset,
  getCoreModelAsset,
  importModelAsset,
} from '../model-asset.service'

type TModalImport = {
  type: 'import' | 'error' | null
  templateType?: number
  errors?: Record<string, string[]>
}

export const useModelAssetList = ({ isGlobal = false }: CommonType = {}) => {
  const { t } = useTranslation(['modelAsset', 'common'])
  const [modalImportErrors, setModalImportErrors] = useState<{
    open: boolean
    errors?: ModalImportErrors
  }>({ open: false, errors: undefined })
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

  const [importType, setImportType] = useState<PopupImportData | undefined>(
    undefined
  )

  const [templateType, setTemplateType] = useState<number | undefined>(
    undefined
  )

  const showModal = (
    type: 'import' | 'error',
    errors?: Record<string, string[]>
  ) => {
    setModalImport({ type, errors })
  }

  const hideModal = () => {
    setModalImport({ type: null })
  }

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

  const handleImport = (config: (typeof IMPORT_CONFIGS)[number]) => {
    setModalImport({
      type: 'import',
      templateType: config.templateType,
      errors: undefined,
    })
    setImportType({
      type: config.type,
      data: {
        id: config.id,
        params: { type: config.templateType },
        header: t(`modelAsset:list.import.${config.type}` as any),
      },
    })
  }

  const handleDownloadTemplate = async (templateType: number) => {
    setTemplateType(templateType)
    setTimeout(() => {
      downloadQuery.refetch()
    }, 100)
  }

  const dropdownList = IMPORT_CONFIGS.map((config) => ({
    id: config.id,
    label: t(`modelAsset:list.import.${config.type}` as any),
    type: ['import', 'download'] as string[],
    onClick: () => handleImport(config),
    onDownloadTemplate: () => handleDownloadTemplate(config.templateType),
  }))

  const filterSchema: UseFilter = [
    {
      type: 'text',
      name: 'keyword',
      label: t('modelAsset:list.filter.search.label'),
      placeholder: t('modelAsset:list.filter.search.placeholder'),
      maxLength: 255,
      id: 'input-model-asset-search',
      defaultValue: '',
    },
    {
      type: 'select-async-paginate',
      name: 'asset_type_ids',
      id: 'select-type',
      isMulti: true,
      label: t('modelAsset:list.filter.asset_type.label'),
      placeholder: t('modelAsset:list.filter.asset_type.placeholder'),
      className: '',
      defaultValue: null,
      loadOptions: loadAssetType,
      additional: {
        page: 1,
      },
    },
    {
      type: 'select-async-paginate',
      name: 'manufacture_ids',
      id: 'select-manufacturer',
      isMulti: true,
      label: t('modelAsset:list.filter.manufacturer.label'),
      placeholder: t('modelAsset:list.filter.manufacturer.placeholder'),
      className: '',
      defaultValue: null,
      loadOptions: loadManufacturers,
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
    queryKey: ['model-asset', filter?.query, pagination, querySorting],
    queryFn: () =>
      getCoreModelAsset(
        {
          keyword: filter?.query?.keyword,
          program_ids: getReactSelectValue(filter?.query?.program_ids),
          asset_type_ids: getReactSelectValue(filter?.query?.asset_type_ids),
          manufacture_ids: getReactSelectValue(filter?.query?.manufacture_ids),
          ...querySorting,
          ...pagination,
        },
        isGlobal
      ),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  })

  const handleChangeLimit = (paginate: number) =>
    setPagination({ paginate, page: 1 })

  const exportQuery = useQuery({
    queryKey: ['model-asset-export', filter?.query],
    queryFn: () =>
      exportModelAsset(
        {
          keyword: filter?.query?.keyword,
          program_ids: getReactSelectValue(filter?.query?.program_ids),
          asset_type_ids: getReactSelectValue(filter?.query?.asset_type_ids),
          manufacture_ids: getReactSelectValue(filter?.query?.manufacture_ids),
          ...querySorting,
          ...pagination,
        },
        isGlobal
      ),
    enabled: false,
  })

  const downloadQuery = useQuery({
    queryKey: ['asset-model-download-template', templateType],
    queryFn: () =>
      downloadTemplateAssetModel({
        type: Number(templateType),
      }),
    refetchOnWindowFocus: false,
    enabled: false,
  })

  const { mutate: onImport, ...importMutation } = useMutation({
    mutationFn: (data: FormData) =>
      importModelAsset(data, { type: Number(modalImport?.templateType ?? 0) }),
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: ['model-asset', filter?.query, pagination, querySorting],
      })
      toast.success({
        description: t('common:message.success.add', {
          type: t('modelAsset:list.title').toLowerCase(),
        }),
      })
    },
    onError: (error: AxiosError) => {
      const { message, errors } = error.response?.data as {
        message: string
        errors?: TModalImport['errors']
      }

      if (!errors || (errors && Object.hasOwn(errors, 'general')))
        toast.danger({ description: errors?.general[0] ?? message })
      else setModalImportErrors({ open: true, errors })
    },
  })

  return {
    dropdownList,
    importType,
    datasource,
    isLoading: isLoading || isFetching,
    exportQuery,
    downloadQuery,
    handleChangeLimit,
    t,
    filter,
    pagination,
    setPagination,
    sorting,
    setSorting,
    import: {
      modalImport,
      showModal,
      setImportType,
      setModalImport,
      hideModal,
      onImport,
      importMutation,
      modalImportErrors,
      setModalImportErrors,
    },
  }
}

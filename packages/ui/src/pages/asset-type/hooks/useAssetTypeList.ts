import { useEffect, useState } from 'react'
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import { SortingState } from '@tanstack/react-table'
import { useFilter, UseFilter } from '#components/filter'
import { PopupImportData } from '#components/modules/ModalImportV2'
import { toast } from '#components/toast'
import { queryClient } from '#provider/query-client'
import { CommonType, ErrorResponse } from '#types/common'
import { getReactSelectValue } from '#utils/react-select'
import { AxiosError } from 'axios'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { ModalImportErrors } from '../../activity/activity.type'
import { IMPORT_CONFIGS } from '../asset-type.constants'
import {
  downloadTemplateAssetType,
  exportAssetType,
  getCoreAssetType,
  importAssetType,
  updateStatusAssetTypeInProgram,
} from '../asset-type.service'
import { ParamData } from '../asset-type.type'

type TModalImport = {
  type: 'import' | 'error' | null
  templateType?: number
  errors?: Record<string, string[]>
}

export const useAssetTypeList = ({ isGlobal = false }: CommonType = {}) => {
  const { t } = useTranslation(['assetType', 'common'])
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

  const filterSchema: UseFilter = [
    {
      type: 'text',
      name: 'keyword',
      label: t('assetType:list.filter.search.label'),
      placeholder: t('assetType:list.filter.search.placeholder'),
      maxLength: 255,
      id: 'input-asset-type-search',
      defaultValue: '',
    },
  ]

  const filter = useFilter(filterSchema)
  const {
    data: datasource,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['asset-type', filter?.query, pagination, querySorting],
    queryFn: () =>
      getCoreAssetType(
        {
          keyword: filter?.query?.keyword,
          program_ids: getReactSelectValue(filter?.query?.program_ids),
          ...querySorting,
          ...pagination,
        },
        isGlobal
      ),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  })

  const { mutate: onUpdateStatus } = useMutation({
    mutationFn: (data: ParamData) =>
      updateStatusAssetTypeInProgram(data?.id, data?.status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['asset-type'],
      })
      toast.success({
        description: t('common:message.success.update', {
          type: t('assetType:list.status')?.toLowerCase(),
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
    queryKey: ['asset-type-export', filter?.query],
    queryFn: () => exportAssetType(filter?.query, isGlobal),
    enabled: false,
  })

  const downloadQuery = useQuery({
    queryKey: ['asset-type-download-template'],
    queryFn: () =>
      downloadTemplateAssetType({ type_download_template: templateType ?? 0 }),
    enabled: false,
  })

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
        params: { type_download_template: config.templateType },
        header: t(`assetType:list.import.${config.type}`),
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
    label: t(`assetType:list.import.${config.type}`),
    type: ['import', 'download'] as string[],
    onClick: () => handleImport(config),
    onDownloadTemplate: () => handleDownloadTemplate(config.templateType),
  }))

  const { mutate: onImport, ...importMutation } = useMutation({
    mutationFn: (data: FormData) =>
      importAssetType(data, {
        type_download_template: Number(modalImport?.templateType ?? 0),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['asset-type'],
      })
      toast.success({
        description: t('common:message.success.add', {
          type: t('assetType:list.title').toLowerCase(),
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
              type: t('assetType:list.title').toLowerCase(),
            }),
        })
      } else {
        setModalImportErrors({ open: true, errors })
      }
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

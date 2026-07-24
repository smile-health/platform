import { useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { ColumnSort } from '@tanstack/react-table'
import { UseFilter, useFilter } from '#components/filter'
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import {
  downloadTemplateMaterial,
  exportMaterial,
  getCoreMaterials,
  getMaterials,
  getMaterialTypes,
  importMaterial,
} from '#services/material'
import { listPrograms } from '#services/program'
import { useLoadingPopupStore } from '#store/loading.store'
import { getReactSelectValue } from '#utils/react-select'
import { getProgramStorage } from '#utils/storage/program'
import { AxiosError } from 'axios'
import { parseAsInteger, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { createFilterSchema } from '../schema/MaterialSchemaList'

export type UseMaterialTableProps = {
  isGlobal?: boolean
  isList?: boolean
}
type ModalImportErrors = { [key: string]: string[] }

const paramsFilter = { page: 1, paginate: 100 }

export const useMaterialTable = ({
  isGlobal = false,
}: UseMaterialTableProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'material'])
  const pathname = usePathname()
  const [program] = useState(getProgramStorage())
  const [levelId, setLevelId] = useState(3)
  const [modalImportErrors, setModalImportErrors] = useState<{
    open: boolean
    errors?: ModalImportErrors
  }>({ open: false, errors: undefined })
  const { setLoadingPopup } = useLoadingPopupStore()
  const queryClient = useQueryClient()

  const [pagination, setPagination] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      paginate: parseAsInteger.withDefault(10),
    },
    {
      history: 'push',
    }
  )
  const [sorting, setSorting] = useState<ColumnSort[]>([])

  const { data: programs, isFetching: isProgramsFetching } = useQuery({
    queryKey: ['programs', paramsFilter],
    queryFn: () => listPrograms(paramsFilter),
    placeholderData: keepPreviousData,
    retry: false,
    refetchOnWindowFocus: false,
  })

  const filterSchema = useMemo<UseFilter>(
    () =>
      createFilterSchema({
        t,
        isGlobal,
        isProgramKFAEnabled: program?.config?.material?.is_hierarchy_enabled,
      }),
    [t]
  )
  const filter = useFilter(filterSchema)

  const getGlobalMaterialTemplateParams = (levelId: number) => ({
    material_level_id: levelId === 5 ? 3 : levelId,
    is_hierarchy: [2, 3].includes(levelId) ? 1 : 0,
  })

  const getProgramMaterialTemplateParams = (
    levelId: number,
    program?: any
  ) => ({
    material_level_id: program?.config?.material?.is_hierarchy_enabled
      ? levelId
      : 3,
  })

  const {
    data: globalDataSource,
    isLoading: isGlobalLoading,
    isFetching: isGlobalFetchingData,
  } = useQuery({
    queryKey: ['global-materials', filter.query, pagination, language, sorting],
    queryFn: () => {
      const { keyword, program_ids, material_type_ids, material_level_ids } =
        filter.query

      const params = {
        page: pagination.page || 1,
        paginate: pagination.paginate || 10,
        keyword: keyword,
        ...(material_level_ids && {
          material_level_ids: getReactSelectValue(material_level_ids),
          is_hierarchy: 1,
        }),
        ...(material_type_ids && {
          material_type_ids: getReactSelectValue(material_type_ids),
        }),
        ...(program_ids && {
          program_ids: getReactSelectValue(program_ids),
        }),
        ...(sorting?.length !== 0 && {
          sort_by: sorting?.[0]?.id,
          sort_type: sorting?.[0]?.desc ? 'desc' : 'asc',
        }),
      }
      return getCoreMaterials(params)
    },
    enabled:
      isGlobal && pathname === `/${language}/v5/global-settings/material/data`,
    placeholderData: keepPreviousData,
  })

  const { data: programDataSource, isFetching: isProgramFetchingData } =
    useQuery({
      queryKey: [
        'program-materials',
        filter.query,
        pagination,
        language,
        sorting,
      ],
      queryFn: () => {
        const { keyword, activity_id, material_type_ids, material_level_id } =
          filter.query

        const params = {
          page: pagination.page || 1,
          paginate: pagination.paginate || 10,
          keyword: keyword,
          material_level_id: material_level_id ?? 3,
          ...(material_type_ids && {
            material_type_ids: getReactSelectValue(material_type_ids),
          }),
          ...(activity_id && {
            activity_id: getReactSelectValue(activity_id),
          }),
          ...(sorting.length !== 0 && {
            sort_by: sorting?.[0]?.id,
            sort_type: sorting?.[0]?.desc ? 'desc' : 'asc',
          }),
        }
        return getMaterials(params)
      },
      enabled: !isGlobal,
      placeholderData: keepPreviousData,
    })

  const downloadQuery = useQuery({
    queryKey: ['material-template', levelId],
    queryFn: () =>
      downloadTemplateMaterial(
        isGlobal
          ? getGlobalMaterialTemplateParams(levelId)
          : getProgramMaterialTemplateParams(levelId, program),
        isGlobal
      ),
    enabled: false,
  })

  const exportQuery = useQuery({
    queryKey: ['material-export'],
    queryFn: () => {
      const {
        activity_id,
        material_type_ids,
        material_level_ids,
        material_level_id,
        program_ids,
        keyword,
      } = filter.query

      const params = {
        page: pagination.page || 1,
        paginate: pagination.paginate || 10,
        ...(keyword && { keyword }),
        ...(!isGlobal && !program?.config?.material?.is_hierarchy_enabled
          ? {
              material_level_id: 3,
            }
          : { material_level_id }),
        ...(program_ids && {
          program_ids: getReactSelectValue(program_ids),
        }),
        ...(material_type_ids && {
          material_type_ids: getReactSelectValue(material_type_ids),
        }),
        ...(material_level_ids && {
          material_level_ids: getReactSelectValue(material_level_ids),
          is_hierarchy: 1,
        }),
        ...(activity_id && {
          activity_id: getReactSelectValue(activity_id),
        }),
      }

      return exportMaterial(params, isGlobal)
    },
    enabled: false,
  })

  const { mutate: handleImport, isPending: isImporting } = useMutation({
    onMutate: () => setLoadingPopup(true),
    onSettled: async () => {
      await queryClient?.invalidateQueries({
        queryKey: isGlobal ? ['global-materials'] : ['program-materials'],
      })
      setLoadingPopup(false)
    },
    mutationFn: (data: FormData) => importMaterial(data, isGlobal),
    onSuccess: (success) => {
      toast.success({
        description: success.message,
      })
    },
    onError: (error: AxiosError) => {
      const { message, errors } = error.response?.data as {
        message: string
        errors?: ModalImportErrors
      }

      if (!errors || (errors && Object.hasOwn(errors, 'general')))
        toast.danger({ description: errors?.general[0] ?? message })
      else setModalImportErrors({ open: true, errors })
    },
  })

  const { data: materialTypes, isLoading: materialTypesLoading } = useQuery({
    queryKey: ['material-types', paramsFilter, language],
    queryFn: () =>
      getMaterialTypes({
        page: 1,
        paginate: 100,
      }),
    placeholderData: keepPreviousData,
    select: (res) => res?.data?.map((x) => ({ value: x.id, label: x.name })),
    retry: false,
    refetchOnWindowFocus: false,
  })

  const loadingDownloadTemplate = downloadQuery.isFetching
  const loadingExport = exportQuery.isFetching

  useSetLoadingPopupStore(
    loadingDownloadTemplate ||
      loadingExport ||
      isImporting ||
      isGlobalLoading ||
      isProgramFetchingData ||
      isProgramsFetching
  )

  const handleChangePage = (page: number) => setPagination({ page })

  const handleChangePaginate = (paginate: number) => {
    setPagination({ page: 1, paginate })
  }

  return {
    filter,
    handleChangePage,
    handleChangePaginate,
    setPagination,
    pagination,
    sorting,
    setSorting,
    program,
    programs,
    handleImport,
    setLevelId,
    levelId,
    isImporting,
    materialTypes,
    materialTypesLoading,
    paramsFilter,
    exportQuery,
    downloadQuery,
    globalDataSource,
    programDataSource,
    isLoading: isGlobal ? isGlobalFetchingData : isProgramFetchingData,
    globalDataSourceSelection:
      globalDataSource?.data?.map((x) => ({ value: x.id, label: x.name })) ||
      [],
    materialCompanionSelection:
      programDataSource?.data?.map((x) => ({ value: x.id, label: x.name })) ||
      [],
    modalImportErrors,
    setModalImportErrors,
  }
}

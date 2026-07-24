import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { useRouter } from "next/router"
import { ColumnSort } from "@tanstack/react-table"

import { toast } from "#components/toast"

import { useSetLoadingPopupStore } from "#hooks/useSetLoading"
import { downloadTemplateActivityPrograms, exportActivityProgram, importActivityPrograms, listActivitiesProgram } from "../services/programActivities"
import { SuccessResponse } from "#types/common"

type ModalImportErrors = { [key: string]: string[] }
export const useProgramDetailsActivity = () => {
  const { t, i18n: { language } } = useTranslation(['common', 'programGlobalSettings'])
  const router = useRouter()
  const { id } = router.query

  const [pagination, setPagination] = useState({ page: 1, paginate: 10 })
  const [filter, setFilter] = useState({
    keyword: '',
    resetPage: false,
  })
  const [sort, setSort] = useState<ColumnSort[]>([{ id: '', desc: true }])
  const [keywordSubmitted, setKeywordSubmitted] = useState('')
  const [showImport, setShowImport] = useState(false)
  const [modalImportErrors, setModalImportErrors] = useState<{
    open: boolean
    errors?: ModalImportErrors
  }>({ open: false, errors: undefined })

  const { data: dataActivities, isFetching, refetch } = useQuery({
    queryKey: ['activities', pagination, sort],
    queryFn: () => {
      const params = {
        ...pagination,
        keyword: filter.keyword,
        ...filter.resetPage && {
          page: 1
        },
        lang: language,
        ...sort[0]?.id && {
          sort_by: sort[0].id,
          sort_type: sort[0].desc ? 'desc' : 'asc'
        }
      }

      return listActivitiesProgram(params, Number(id))
    },
    refetchOnWindowFocus: false,
  })

  const queryClient = useQueryClient()

  const { mutate: onImport, isPending: isPendingImport } = useMutation({
    mutationFn: (data: FormData) => importActivityPrograms(data, Number(id)),
    onSuccess: async (result: SuccessResponse) => {
      toast.success({ description: result.message })
      await queryClient.invalidateQueries({
        queryKey: ['activities'],
      })
    },
    onError: (err: AxiosError) => {
      const { message, errors } = err.response?.data as {
        message: string
        errors?: ModalImportErrors
      }
      if (!errors || (errors && Object.hasOwn(errors, 'general')))
        toast.danger({ description: errors?.general[0] ?? message })
      else setModalImportErrors({ open: true, errors })
    },
  })

  const { refetch: refetchTemplate, isFetching: isDownloadingTemplate } = useQuery({
    queryKey: ['activity-template'],
    queryFn: () => downloadTemplateActivityPrograms(Number(id)),
    enabled: false,
  })

  const exportQuery = useQuery({
    queryKey: ['activity-export'],
    queryFn: () => exportActivityProgram({ keyword: keywordSubmitted }, Number(id)),
    enabled: false,
  })

  const handleChangePage = (page: number) => setPagination((prev) => ({ ...prev, page }))

  const handleChangeLimit = (paginate: number) => setPagination((prev) => ({ ...prev, paginate, page: 1 }))

  const handleAction = (action: 'edit' | 'detail', activityId: number) => {
    if (action === 'detail')
      router.push(`/${language}/v5/global-settings/program/${id}/activity/${activityId}`)
    else if (action === 'edit')
      router.push(`/${language}/v5/global-settings/program/${id}/activity/${activityId}/edit`)
  }

  const handleSearch = () => {
    refetch()
    setKeywordSubmitted(filter.keyword)
    setFilter(prev => ({ ...prev, resetPage: false }))
  }

  const handleReset = () => {
    setFilter({ keyword: '', resetPage: true })
    setKeywordSubmitted('')
    setPagination({ page: 1, paginate: 10 })
    setTimeout(() => refetch(), 100)
  }

  useSetLoadingPopupStore(isFetching || isPendingImport || isDownloadingTemplate)

  return {
    t,
    dataActivities,
    isFetching,
    pagination,
    handleChangePage,
    handleChangeLimit,
    router,
    id,
    language,
    isPendingImport,
    showImport,
    setShowImport,
    modalImportErrors,
    setModalImportErrors,
    onImport,
    refetchTemplate,
    isDownloadingTemplate,
    handleAction,
    exportQuery,
    filter,
    setFilter,
    handleSearch,
    handleReset,
    sort,
    setSort
  }
}
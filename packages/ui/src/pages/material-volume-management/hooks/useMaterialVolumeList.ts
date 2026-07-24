import { useEffect, useState } from 'react'
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import { SortingState } from '@tanstack/react-table'
import { useFilter, UseFilter } from '#components/filter'
import { toast } from '#components/toast'
import { queryClient } from '#provider/query-client'
import { loadManufacturers } from '#services/manufacturer'
import { loadMaterial, loadMaterialType } from '#services/material'
import {
  downloadTempalateMaterialVolume,
  exportMaterialVolume,
  getMaterialVolumes,
  importMaterialVolume,
} from '#services/material-volume'
import { CommonType } from '#types/common'
import { getReactSelectValue } from '#utils/react-select'
import { AxiosError } from 'axios'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { ModalImportErrors } from '../../activity/activity.type'

type TModalImport = {
  type: 'import' | 'error' | null
  errors?: Record<string, string[]>
}

export const useMaterialVolumeList = ({
  isGlobal = false,
}: CommonType = {}) => {
  const { t } = useTranslation(['materialVolume', 'common'])
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
  const [modalImportErrors, setModalImportErrors] = useState<{
    open: boolean
    errors?: ModalImportErrors
  }>({ open: false, errors: undefined })

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
      id: 'material__volume__list__material',
      type: 'select-async-paginate',
      name: 'material_id',
      isMulti: false,
      label: t('list.filter.label.material'),
      placeholder: t('list.filter.placeholder.material'),
      className: '',
      defaultValue: null,
      loadOptions: loadMaterial,
      additional: { page: 1 },
    },
    {
      id: 'material__volume__list__manufacturer',
      type: 'select-async-paginate',
      name: 'manufacturer_id',
      isMulti: false,
      label: t('list.filter.label.manufacturer'),
      placeholder: t('list.filter.placeholder.manufacturer'),
      className: '',
      defaultValue: null,
      loadOptions: loadManufacturers,
      additional: { page: 1 },
    },
    {
      id: 'material__volume__list__material_type',
      type: 'select-async-paginate',
      name: 'material_type_id',
      isMulti: false,
      label: t('list.filter.label.material_type'),
      placeholder: t('list.filter.placeholder.material_type'),
      className: '',
      defaultValue: null,
      loadOptions: loadMaterialType,
      additional: { page: 1 },
    },
  ]

  const filter = useFilter(filterSchema)

  const {
    data: datasource,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['material-volumes', filter?.query, pagination, querySorting],
    queryFn: () =>
      getMaterialVolumes({
        material_ids: getReactSelectValue(filter?.query?.material_id),
        manufacture_ids: getReactSelectValue(filter?.query?.manufacturer_id),
        material_type_ids: getReactSelectValue(filter?.query?.material_type_id),
        sort_by: querySorting?.sort_by as
          | 'material_name'
          | 'manufacture_name'
          | 'type_material_name'
          | 'updated_at'
          | undefined,
        sort_type: querySorting?.sort_type as 'asc' | 'desc' | undefined,
        ...pagination,
      }),
    placeholderData: keepPreviousData,
  })

  const handleChangeLimit = (paginate: number) =>
    setPagination({ paginate, page: 1 })

  const exportQuery = useQuery({
    queryKey: ['material-volume-export', filter?.query],
    queryFn: () =>
      exportMaterialVolume({
        material_ids: getReactSelectValue(filter?.query?.material_id),
        manufacture_ids: getReactSelectValue(filter?.query?.manufacturer_id),
        material_type_ids: getReactSelectValue(filter?.query?.material_type_id),
      }),
    enabled: false,
  })

  const downloadQuery = useQuery({
    queryKey: ['material-volume-template'],
    queryFn: downloadTempalateMaterialVolume,
    enabled: false,
  })

  const { mutate: onImport, ...importMutation } = useMutation({
    mutationFn: (data: FormData) => importMaterialVolume(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['material-volume'],
      })
      toast.success({
        description: t('common:message.success.add', {
          type: t('materialVolume:title.material_volume').toLowerCase(),
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
              type: t('materialVolume:title.material_volume').toLowerCase(),
            }),
        })
      } else {
        setModalImportErrors({ open: true, errors })
      }
    },
  })

  return {
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
      hideModal,
      onImport,
      importMutation,
      modalImportErrors,
      setModalImportErrors,
    },
  }
}

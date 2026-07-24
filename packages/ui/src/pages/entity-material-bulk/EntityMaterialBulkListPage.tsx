import React, { useMemo, useState } from 'react'
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { Button } from '#components/button'
import {
  FilterFormBody,
  FilterFormRoot,
  FilterResetButton,
  FilterSubmitButton,
  UseFilter,
  useFilter,
} from '#components/filter'
import Download from '#components/icons/Download'
import Import from '#components/icons/Import'
import AppLayout from '#components/layouts/AppLayout/AppLayout'
import Meta from '#components/layouts/Meta'
import ModalError from '#components/modules/ModalError'
import { ModalImport } from '#components/modules/ModalImport'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'
import { toast } from '#components/toast'
import { usePermission } from '#hooks/usePermission'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import {
  importEntitiesMaterialBulk,
  listEntitiesMaterialBulk,
} from '#services/entity-material-bulk'
import { AxiosError } from 'axios'
import { parseAsInteger, useQueryStates, Values } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { DataTable } from '../../components/data-table/DataTable'
import EntityMaterialBulkModalExport from './components/EntityMaterialBulkModalExport'
import { columns } from './constants/table'
import { createFilterSchema } from './schema/EntityMaterialBulkSchemaList'

type ModalImportErrors = { [key: string]: string[] }
type CurrentFilter = {
  page: number | null
  paginate: number | null
  date_range: { start_date: string; end_date: string } | null
}

const EntityMaterialBulkListPage = () => {
  usePermission('entity-mutate')
  const { t } = useTranslation(['common', 'entityMaterialBulk'])
  const queryClient = useQueryClient()
  const [modalExport, setModalExport] = useState(false)
  const [showImport, setShowImport] = useState(false)
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

  const filterSchema = useMemo<UseFilter>(() => createFilterSchema(t), [])
  const filter = useFilter(filterSchema)

  const buildParams = (currentFilter: Values<Record<string, any>>) => {
    const { date_range } = currentFilter

    return {
      page: pagination.page,
      paginate: pagination.paginate,
      ...(date_range && {
        start_date: date_range.start,
        end_date: date_range.end,
      }),
    }
  }

  const { data: datasource, isFetching } = useQuery({
    queryKey: ['entities-material-bulk', filter.query, pagination],
    queryFn: () => listEntitiesMaterialBulk(buildParams(filter.query)),
    placeholderData: keepPreviousData,
  })

  const { mutate: handleImport, isPending: isPendingImport } = useMutation({
    mutationFn: (data: FormData) => importEntitiesMaterialBulk(data),
    onSuccess: () =>
      toast.success({
        description: t('entityMaterialBulk:export.toast.import'),
      }),
    onError: (err: AxiosError) => {
      const { errors } = err.response?.data as {
        errors?: ModalImportErrors | string
      }

      if (
        errors &&
        typeof errors === 'object' &&
        Object.hasOwn(errors, 'general')
      ) {
        toast.danger({ description: errors?.general[0] })
      } else if (typeof errors === 'string')
        toast.danger({ description: errors })
      else setModalImportErrors({ open: true, errors })
    },
    onSettled: async () =>
      await queryClient.invalidateQueries({
        queryKey: ['entities-material-bulk'],
      }),
  })

  const handleChangePage = (page: number) => setPagination({ page })
  const handleChangePaginate = (paginate: number) =>
    setPagination({ paginate, page: 1 })

  const handleSeeMore = (notes: ModalImportErrors) =>
    setModalImportErrors({ open: true, errors: notes })

  const isLoadingPopup = isFetching || isPendingImport
  useSetLoadingPopupStore(isLoadingPopup)

  const title = `SMILE | ${t('entityMaterialBulk:title')}`

  return (
    <AppLayout title={t('entityMaterialBulk:title')}>
      <Meta title={title} />

      <ModalError
        errors={modalImportErrors.errors}
        open={modalImportErrors.open}
        handleClose={() =>
          setModalImportErrors({ open: false, errors: undefined })
        }
      />

      <EntityMaterialBulkModalExport
        open={modalExport}
        setOpen={setModalExport}
      />

      <ModalImport
        open={showImport}
        setOpen={setShowImport}
        onSubmit={handleImport}
        handleClose={() => setShowImport(false)}
        accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
      />

      <div className="mt-6">
        <FilterFormRoot collapsible onSubmit={filter.handleSubmit}>
          <FilterFormBody className="ui-flex ui-items-end">
            <div className="ui-w-full">{filter.renderField()}</div>
            <div className="ui-flex ui-gap-2">
              <Button
                id="btn-import"
                variant="subtle"
                type="button"
                leftIcon={<Import className="ui-size-5" />}
                onClick={() => setShowImport(true)}
              >
                {t('common:import')}
              </Button>
              <Button
                id="btn-download-template"
                variant="subtle"
                type="button"
                leftIcon={<Download className="ui-size-5" />}
                onClick={() => setModalExport(true)}
                className="ui-w-[180px]"
              >
                {t('common:download_template')}
              </Button>
              <span className="ui-h-auto ui-w-px ui-bg-neutral-300" />
              <FilterResetButton variant="subtle" onClick={filter.reset} />
              <FilterSubmitButton
                className="ui-w-[200px]"
                variant="outline"
              ></FilterSubmitButton>
            </div>
          </FilterFormBody>
          {filter.renderActiveFilter()}
        </FilterFormRoot>
        <div className="ui-space-y-6 ui-my-5 ui-rounded">
          <DataTable
            data={datasource?.data}
            columns={columns(t, handleSeeMore)}
            isLoading={isFetching}
            className="ui-overflow-x-auto"
          />
          <PaginationContainer>
            <PaginationSelectLimit
              size={pagination.paginate}
              onChange={(paginate) => handleChangePaginate(paginate)}
              perPagesOptions={datasource?.list_pagination}
            />
            <PaginationInfo
              size={pagination.paginate}
              currentPage={pagination.page}
              total={datasource?.total_item}
            />
            <Pagination
              totalPages={datasource?.total_page ?? 0}
              currentPage={pagination.page}
              onPageChange={(page) => handleChangePage(page)}
            />
          </PaginationContainer>
        </div>
      </div>
    </AppLayout>
  )
}

export default EntityMaterialBulkListPage

'use client'

import React, { useMemo, useState } from 'react'
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { functionalUpdate, SortingState } from '@tanstack/react-table'
import { Button } from '#components/button'
import {
  FilterExpandButton,
  FilterFormBody,
  FilterFormFooter,
  FilterFormRoot,
  FilterResetButton,
  FilterSubmitButton,
  UseFilter,
  useFilter,
} from '#components/filter'
import Download from '#components/icons/Download'
import Export from '#components/icons/Export'
import Import from '#components/icons/Import'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import ModalError from '#components/modules/ModalError'
import { ModalImport } from '#components/modules/ModalImport'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'
import { toast } from '#components/toast'
import { ProgramEnum, ProgramIntegrationClient } from '#constants/program'
import { USER_ROLE } from '#constants/roles'
import { usePermission } from '#hooks/usePermission'
import { useSetExportPopupStore } from '#hooks/useSetExportPopup'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import {
  downloadEntityGlobalTemplate,
  downloadEntityTemplate,
  exportEntities,
  exportGlobalEntities,
  importEntities,
  importMainEntities,
  listCoreEntities,
  listEntities,
} from '#services/entity'
import { hasPermission } from '#shared/permission/index'
import { CommonType } from '#types/common'
import { getReactSelectValue } from '#utils/react-select'
import { getUserStorage } from '#utils/storage/user'
import { asExternalSuperAdmin } from '#utils/user'
import { AxiosError } from 'axios'
import {
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  useQueryStates,
} from 'nuqs'
import { useTranslation } from 'react-i18next'

import EntityTable from './components/EntityTable'
import { createFilterSchema } from './schema/EntitySchemaList'

type ModalImportErrors = { [key: string]: string[] }

const EntityListPage: React.FC<CommonType> = ({ isGlobal }) => {
  const isPermitted = usePermission(
    isGlobal ? 'entity-global-view' : 'entity-view'
  )
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'entity'])
  const user = getUserStorage()
  const queryClient = useQueryClient()
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
  const [sorting, setSorting] = useQueryStates(
    {
      id: parseAsString.withDefault(''),
      desc: parseAsBoolean.withDefault(true),
    },
    {
      history: 'push',
    }
  )

  const filterSchema = useMemo<UseFilter>(
    () => createFilterSchema({ t, isGlobal }),
    [t, language]
  )
  const filter = useFilter(filterSchema)
  const canEdit = hasPermission('entity-mutate')
  const whitelistedRoles: USER_ROLE[] = [USER_ROLE.SUPERADMIN]
  const isRoleWhitelisted = whitelistedRoles.some((role) => role === user?.role)

  const downloadQuery = useQuery({
    queryKey: ['entity-template', language],
    queryFn: isGlobal ? downloadEntityGlobalTemplate : downloadEntityTemplate,
    enabled: false,
  })

  const {
    mutate: mutateExport,
    isPending: isPendingExport,
    isSuccess: isSuccessExpport,
  } = useMutation({
    mutationKey: ['entity-export', language],
    mutationFn: () => {
      const {
        keyword,
        type_ids,
        entity_tag_ids,
        province_ids,
        regency_ids,
        sub_district_ids,
        village_ids,
        program_ids,
        id_satu_sehat,
      } = filter.query

      const isWmsSelected =
        Array.isArray(program_ids) &&
        program_ids.some((opt) => opt.value === ProgramEnum.WasteManagement)
      const filteredProgramIds = Array.isArray(program_ids)
        ? program_ids.filter((opt) => opt.value !== ProgramEnum.WasteManagement)
        : program_ids

      const params = {
        keyword: keyword,
        id_satu_sehat,
        ...(type_ids && { type_ids: getReactSelectValue(type_ids) }),
        ...(entity_tag_ids && {
          entity_tag_ids: getReactSelectValue(entity_tag_ids),
        }),
        ...(province_ids && {
          province_ids: getReactSelectValue(province_ids),
        }),
        ...(regency_ids && { regency_ids: getReactSelectValue(regency_ids) }),
        ...(sub_district_ids && {
          sub_district_ids: getReactSelectValue(sub_district_ids),
        }),
        ...(village_ids && { village_ids: getReactSelectValue(village_ids) }),
        ...(filteredProgramIds?.length && {
          program_ids: getReactSelectValue(filteredProgramIds),
        }),
        ...(sorting.id && {
          sort_by: sorting.id,
          sort_type: sorting.desc ? 'desc' : 'asc',
        }),
        ...(isWmsSelected && {
          integration_client_id: ProgramIntegrationClient.WasteManagement,
        }),
      }

      return isGlobal ? exportGlobalEntities(params) : exportEntities(params)
    },
  })

  const { mutate: handleImport, isPending: isPendingImport } = useMutation({
    mutationFn: (data: FormData) =>
      isGlobal ? importEntities(data) : importMainEntities(data),
    onSuccess: () => {
      toast.success({ description: t('entity:form.success.import') })
      queryClient.invalidateQueries({ queryKey: ['entities'] })
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

  const { data: datasource, isFetching } = useQuery({
    queryKey: ['entities', filter.query, pagination, sorting, language],
    queryFn: () => {
      const {
        keyword,
        type_ids,
        entity_tag_ids,
        province_ids,
        regency_ids,
        sub_district_ids,
        village_ids,
        program_ids,
        id_satu_sehat,
      } = filter.query

      const isWmsSelected =
        Array.isArray(program_ids) &&
        program_ids.some((opt) => opt.value === ProgramEnum.WasteManagement)
      const filteredProgramIds = Array.isArray(program_ids)
        ? program_ids.filter((opt) => opt.value !== ProgramEnum.WasteManagement)
        : program_ids

      const params = {
        page: pagination.page || 1,
        paginate: pagination.paginate || 10,
        keyword: keyword,
        id_satu_sehat,
        ...(type_ids && { type_ids: getReactSelectValue(type_ids) }),
        ...(entity_tag_ids && {
          entity_tag_ids: getReactSelectValue(entity_tag_ids),
        }),
        ...(province_ids && {
          province_ids: getReactSelectValue(province_ids),
        }),
        ...(regency_ids && { regency_ids: getReactSelectValue(regency_ids) }),
        ...(sub_district_ids && {
          sub_district_ids: getReactSelectValue(sub_district_ids),
        }),
        ...(village_ids && { village_ids: getReactSelectValue(village_ids) }),
        ...(filteredProgramIds?.length && {
          program_ids: getReactSelectValue(filteredProgramIds),
        }),
        ...(sorting.id && {
          sort_by: sorting.id,
          sort_type: sorting.desc ? 'desc' : 'asc',
        }),
        ...(isWmsSelected && {
          integration_client_id: ProgramIntegrationClient.WasteManagement,
        }),
      }

      return isGlobal ? listCoreEntities(params) : listEntities(params)
    },
    placeholderData: keepPreviousData,
    enabled: isPermitted,
  })

  const handleChangePage = (page: number) => setPagination({ page })

  const handleChangePaginate = (paginate: number) =>
    setPagination({ paginate, page: 1 })

  const handleChangeSort = (sort: SortingState) => {
    const newState = functionalUpdate(sort, [
      { id: sorting.id, desc: sorting.desc },
    ])

    if (newState.length > 0)
      setSorting({ id: newState[0].id, desc: newState[0].desc })
    else setSorting({ id: '', desc: true })
  }

  const isLoadingPopup =
    isFetching || downloadQuery.isFetching || isPendingExport || isPendingImport
  useSetLoadingPopupStore(isLoadingPopup)
  useSetExportPopupStore(isSuccessExpport)

  return (
    <Container title={t('entity:list.list')} hideTabs withLayout={!isGlobal}>
      <Meta title={`SMILE | ${isGlobal ? 'Global' : ''} Entity`} />

      <ModalImport
        isGlobal={isGlobal}
        open={showImport}
        setOpen={setShowImport}
        onSubmit={handleImport}
        handleClose={() => setShowImport(false)}
        accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        description={t('entity:import.description')}
      />
      <ModalError
        errors={modalImportErrors.errors}
        open={modalImportErrors.open}
        handleClose={() =>
          setModalImportErrors({ open: false, errors: undefined })
        }
      />

      <div className="mt-6">
        <FilterFormRoot collapsible onSubmit={filter.handleSubmit}>
          <FilterFormBody className="ui-grid-cols-4">
            {filter.renderField()}
          </FilterFormBody>
          <FilterFormFooter>
            <FilterExpandButton />
            <div className="ui-flex ui-gap-2">
              {canEdit && isRoleWhitelisted && (
                <Button
                  id="btn-import"
                  variant="subtle"
                  type="button"
                  className="ui-px-2"
                  leftIcon={<Import className="ui-size-5" />}
                  onClick={() => setShowImport(true)}
                >
                  {t('common:import')}
                </Button>
              )}
              {isRoleWhitelisted && (
                <Button
                  id="btn-export"
                  variant="subtle"
                  type="button"
                  className="ui-px-2"
                  leftIcon={<Export className="ui-size-5" />}
                  onClick={() => mutateExport()}
                >
                  {t('common:export')}
                </Button>
              )}
              {canEdit && isRoleWhitelisted && (
                <Button
                  id="btn-download-template"
                  variant="subtle"
                  type="button"
                  className="ui-px-2"
                  leftIcon={<Download className="ui-size-5" />}
                  onClick={() => downloadQuery.refetch()}
                >
                  {t('common:download_template')}
                </Button>
              )}
              {isRoleWhitelisted && (
                <span className="ui-h-full ui-w-px ui-bg-neutral-300" />
              )}
              <FilterResetButton variant="subtle" onClick={filter.reset} />
              <FilterSubmitButton
                onClick={() => setPagination({ page: 1 })}
                variant="outline"
                className="ui-w-[220px]"
              ></FilterSubmitButton>
            </div>
          </FilterFormFooter>
          {filter.renderActiveFilter()}
        </FilterFormRoot>
        <div className="ui-space-y-6 ui-my-5 ui-rounded">
          <EntityTable
            data={datasource?.data}
            isLoading={isFetching}
            size={datasource?.item_per_page}
            page={datasource?.page}
            isGlobal={isGlobal}
            sorting={[sorting]}
            setSorting={handleChangeSort}
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
    </Container>
  )
}

export default EntityListPage

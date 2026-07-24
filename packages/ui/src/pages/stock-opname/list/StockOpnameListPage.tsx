import React, { useMemo } from 'react'
import Link from 'next/link'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
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
import Export from '#components/icons/Export'
import Plus from '#components/icons/Plus'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { toast } from '#components/toast'
import { useProgram } from '#hooks/program/useProgram'
import { usePermission } from '#hooks/usePermission'
import { useSetExportPopupStore } from '#hooks/useSetExportPopup'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { hasPermission } from '#shared/permission/index'
import { parseAsInteger, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'

import StockOpnameListTable from './components/StockOpnameListTable'
import {
  MATERIAL_LEVEL,
  requiredFilterFields,
} from './libs/stock-opname-list.constants'
import StockOpnameListContext from './libs/stock-opname-list.context'
import { stockOpnameFilterSchema } from './libs/stock-opname-list.filter'
import {
  exportStockOpname,
  listStockOpname,
} from './services/stock-opname.services'

const StockOpnameListPage: React.FC = () => {
  usePermission('stock-opname-view')
  const { t, i18n } = useTranslation(['common', 'stockOpname'])
  const { t: tDashboard } = useTranslation('dashboard')

  const { activeProgram } = useProgram()
  const router = useSmileRouter()

  const [pagination, setPagination] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      paginate: parseAsInteger.withDefault(10),
    },
    {
      history: 'push',
    }
  )

  const filterSchema = useMemo<UseFilter>(
    () =>
      stockOpnameFilterSchema({
        t,
        tDashboard,
        lang: i18n.language,
        program: activeProgram,
      }),
    [t, tDashboard, activeProgram]
  )
  const filter = useFilter(filterSchema)

  const checkIfRequiredFieldsAreFilled = () => {
    const requiredFields = filterSchema
      .filter((field) => field.required)
      .map((field) => field.name)

    return {
      query: requiredFields.every((field) => filter.query[field]),
      filterValue: requiredFields.every((field) => filter.getValues()[field]),
    }
  }

  const mappedFilterQuery = useMemo(() => {
    const { material_level_id, material_id, ...query } = filter.query
    if (
      Number(material_level_id?.value) === MATERIAL_LEVEL.TEMPLATE &&
      activeProgram?.config?.material?.is_hierarchy_enabled
    ) {
      query.parent_material_id = material_id
    } else if (
      Number(material_level_id?.value) === MATERIAL_LEVEL.VARIANT &&
      activeProgram?.config?.material?.is_hierarchy_enabled
    ) {
      query.material_id = material_id
    } else {
      query.material_id = material_id
    }
    query.expired_date_range = query.expired_date_range
      ? {
          start: filter.query?.expired_date_range?.start?.toString(),
          end: filter.query?.expired_date_range?.end?.toString(),
        }
      : null
    query.created_at_range = query.created_at_range
      ? {
          start: filter.query?.created_at_range?.start?.toString(),
          end: filter.query?.created_at_range?.end?.toString(),
        }
      : null
    query.only_have_qty = Number(filter.query?.only_have_qty ?? 0)
    return query
  }, [filter.query])

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      'list-stock-opname',
      mappedFilterQuery,
      pagination,
      i18n.language,
    ],
    queryFn: () => listStockOpname({ ...mappedFilterQuery, ...pagination }),
    placeholderData: keepPreviousData,
    enabled: checkIfRequiredFieldsAreFilled().query && router.isReady,
  })

  const queryKeyExport = ['export-stock-opname', mappedFilterQuery]
  const exportQuery = useQuery({
    queryKey: queryKeyExport,
    queryFn: () => exportStockOpname(mappedFilterQuery),
    enabled: false,
  })

  const contextValue = useMemo(() => ({ setPagination }), [setPagination])

  useSetLoadingPopupStore(
    isLoading || isFetching || exportQuery.isLoading || exportQuery.isFetching
  )
  useSetExportPopupStore(exportQuery.isSuccess, queryKeyExport)

  return (
    <Container title={t('stockOpname:stock_opname')} withLayout>
      <Meta title={`SMILE | ${t('stockOpname:stock_opname_list')}`} />
      <StockOpnameListContext.Provider value={contextValue}>
        <div className="ui-my-6 ui-flex ui-justify-between ui-items-center">
          <h5 className="ui-font-bold ui-text-xl">
            {t('stockOpname:stock_opname_list')}
          </h5>
          {hasPermission('stock-opname-mutate') && (
            <Button
              id="create__stock__opname"
              asChild
              className="ui-min-w-40"
              leftIcon={<Plus className="ui-size-5" />}
            >
              <Link href={router.getAsLink('/v5/stock-opname/create')}>
                {t('stockOpname:stock_opname_create')}
              </Link>
            </Button>
          )}
        </div>
        <div className="ui-space-y-4 ui-mt-6">
          <FilterFormRoot collapsible onSubmit={filter.handleSubmit}>
            <FilterFormBody className="ui-grid-cols-4">
              {filter.renderField()}
            </FilterFormBody>
            <FilterFormFooter>
              <div className="ui-flex">
                <FilterExpandButton variant="subtle" />
              </div>
              <div className="ui-space-x-3 ui-flex ui-gap-2">
                <Button
                  id="btn-export"
                  variant="subtle"
                  type="button"
                  leftIcon={<Export className="ui-size-5" />}
                  onClick={() => {
                    if (checkIfRequiredFieldsAreFilled().filterValue) {
                      exportQuery.refetch()
                    } else {
                      toast.danger({
                        description: requiredFilterFields(t)?.find(
                          (field) => !filter.getValues()[field.name]
                        )?.errorMessage,
                      })
                    }
                  }}
                  className="!ui-m-0"
                >
                  {t('common:export')}
                </Button>
                <div className="ui-w-px ui-h-auto ui-bg-neutral-300" />
                <FilterResetButton onClick={filter.reset} variant="subtle" />
                <FilterSubmitButton
                  variant="outline"
                  onClick={() => {
                    if (checkIfRequiredFieldsAreFilled().filterValue) {
                      setPagination({ page: 1 })
                    } else {
                      toast.danger({
                        description: requiredFilterFields(t)?.find(
                          (field) => !filter.getValues()[field.name]
                        )?.errorMessage,
                      })
                    }
                  }}
                  className="ui-w-56 !ui-m-0"
                ></FilterSubmitButton>
              </div>
            </FilterFormFooter>
            {filter.renderActiveFilter()}
          </FilterFormRoot>
        </div>
        <div className="ui-space-y-6 ui-my-5 ui-rounded">
          <StockOpnameListTable data={data} />
        </div>
      </StockOpnameListContext.Provider>
    </Container>
  )
}

export default StockOpnameListPage

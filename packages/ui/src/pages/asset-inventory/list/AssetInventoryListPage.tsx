import React, { useEffect, useMemo, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { SortingState } from '@tanstack/react-table'
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
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { BOOLEAN } from '#constants/common'
import { useProgram } from '#hooks/program/useProgram'
import { usePermission } from '#hooks/usePermission'
import { useSetExportPopupStore } from '#hooks/useSetExportPopup'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { getReactSelectValue } from '#utils/react-select'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'

import {
  exportAssetInventory,
  listAsset,
} from '../services/asset-inventory.services'
import AssetListTable from './components/AssetInventoryListTable'
import AssetListContext from './libs/asset-inventory-list.context'
import { assetFilterSchema } from './libs/asset-inventory-list.filter'

const AssetInventoryListPage: React.FC<{ isGlobal?: boolean }> = ({
  isGlobal = false,
}) => {
  usePermission('asset-inventory-view')
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'assetInventory'])
  const { activeProgram } = useProgram()

  const [{ page, paginate }, setPagination] = useQueryStates(
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

  const contextValue = useMemo(
    () => ({
      setPagination,
    }),
    [setPagination]
  )

  const filterSchema = useMemo<UseFilter>(
    () =>
      assetFilterSchema({
        t,
      }),
    [t, activeProgram]
  )
  const filter = useFilter(filterSchema)

  const filteredAssetTypeIds = filter?.query?.asset_type_ids?.filter(
    (item: any) => item?.value !== 'other'
  )

  const filterData = {
    ...filter?.query,
    asset_type_ids: getReactSelectValue(filteredAssetTypeIds)?.length
      ? getReactSelectValue(filteredAssetTypeIds)
      : undefined,
    manufacture_ids: getReactSelectValue(filter?.query?.manufacture_ids),
    entity_tag_ids: getReactSelectValue(filter?.query?.entity_tag_ids),
    asset_model_ids: getReactSelectValue(filter?.query?.asset_model_ids),
    program_ids: getReactSelectValue(filter?.query?.program_ids),
    is_other: filter?.query?.asset_type_ids?.some(
      (item: any) => item?.value === 'other'
    )
      ? BOOLEAN.TRUE
      : undefined,
  }

  const allFilterData = {
    ...filterData,
    ...querySorting,
  }

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['list-asset-inventory', allFilterData, page, paginate, language],
    queryFn: () => listAsset({ ...allFilterData, page, paginate }),
    placeholderData: keepPreviousData,
    enabled: true,
  })

  const exportQueryKey = ['export-asset-inventory', filterData, language]

  const exportQuery = useQuery({
    queryKey: exportQueryKey,
    queryFn: () => exportAssetInventory(filterData),
    enabled: false,
  })

  useSetLoadingPopupStore(
    isLoading || isFetching || exportQuery.isLoading || exportQuery.isFetching
  )

  useSetExportPopupStore(exportQuery.isSuccess, exportQueryKey)

  return (
    <Container
      title={t('assetInventory:asset_inventory')}
      hideTabs={isGlobal}
      withLayout={!isGlobal}
    >
      <Meta title={`SMILE | ${t('assetInventory:asset_inventory_list')}`} />
      <AssetListContext.Provider value={contextValue}>
        <div className="ui-space-y-4 ui-mt-6">
          <FilterFormRoot collapsible onSubmit={filter.handleSubmit}>
            <FilterFormBody className="ui-grid-cols-4">
              {filter.renderField()}
            </FilterFormBody>
            <FilterFormFooter>
              <FilterExpandButton variant="subtle" />
              <div className="ui-space-x-3 ui-flex ui-gap-2">
                <Button
                  id="btn-export"
                  variant="subtle"
                  type="button"
                  leftIcon={<Export className="ui-size-5" />}
                  onClick={() => exportQuery.refetch()}
                >
                  {t('common:export')}
                </Button>
                <FilterResetButton onClick={filter.reset} variant="subtle" />
                <FilterSubmitButton
                  onClick={() => setPagination({ page: 1 })}
                  variant="outline"
                  className="ui-w-56"
                ></FilterSubmitButton>
              </div>
            </FilterFormFooter>
            {filter.renderActiveFilter()}
          </FilterFormRoot>
        </div>
        <div className="ui-space-y-6 ui-my-5 ui-rounded">
          <AssetListTable
            data={data}
            page={data?.page}
            paginate={paginate}
            sorting={sorting}
            setSorting={setSorting}
          />
        </div>
      </AssetListContext.Provider>
    </Container>
  )
}

export default AssetInventoryListPage

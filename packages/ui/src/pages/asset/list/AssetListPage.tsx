import React, { useEffect, useMemo, useState } from 'react'
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
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { useProgram } from '#hooks/program/useProgram'
import { usePermission } from '#hooks/usePermission'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { getProgramStorage } from '#utils/storage/program'
import { parseAsInteger, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { exportAsset, listAsset } from '../services/asset.services'
import AssetListTable from './components/AssetListTable'
import { assetTypeDefaults } from './libs/asset-list.constants'
import AssetListContext from './libs/asset-list.context'
import { assetFilterSchema } from './libs/asset-list.filter'

const AssetListPage: React.FC = () => {
  usePermission('asset-temperature-view')
  const { t } = useTranslation(['common', 'asset'])
  const { activeProgram } = useProgram()
  const program = getProgramStorage()
  const [viewTemperatureLogger, setViewTemperatureLogger] =
    useState<boolean>(false)

  const [pagination, setPagination] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      paginate: parseAsInteger.withDefault(10),
    },
    {
      history: 'push',
    }
  )

  const contextValue = useMemo(
    () => ({
      program,
      setPagination,
      viewTemperatureLogger,
      setViewTemperatureLogger,
    }),
    [program, setPagination, viewTemperatureLogger, setViewTemperatureLogger]
  )

  const filterSchema = useMemo<UseFilter>(
    () =>
      assetFilterSchema({
        t,
        contextValue,
      }),
    [t, activeProgram, contextValue]
  )
  const filter = useFilter(filterSchema)

  useEffect(() => {
    setViewTemperatureLogger(
      Boolean(Number(filter.getValues()?.only_type_logger))
    )
    if (Boolean(Number(filter.getValues()?.only_type_logger)) === false) {
      filter.setValue('type_id', assetTypeDefaults(t))
    } else {
      filter.setValue('type_id', null)
      filter.setValue('manufacture_id', null)
    }
  }, [filter.getValues()?.only_type_logger])

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['list-asset-temperature', filter.query, pagination],
    queryFn: () => listAsset({ ...filter.query, ...pagination }),
    placeholderData: keepPreviousData,
  })

  const exportQuery = useQuery({
    queryKey: ['export-asset-temperature', filter.getValues()],
    queryFn: () => exportAsset(filter.getValues()),
    enabled: false,
  })

  useSetLoadingPopupStore(
    isLoading || isFetching || exportQuery.isLoading || exportQuery.isFetching
  )

  return (
    <Container title={t('asset:asset_temperature')} withLayout>
      <Meta title={`SMILE | ${t('asset:asset_temperature_list')}`} />
      <AssetListContext.Provider value={contextValue}>
        <div className="ui-mx-24">
          <div className="ui-my-6 ui-flex ui-justify-between ui-items-center">
            <h5 className="ui-font-bold ui-text-xl">
              {t('asset:asset_temperature_list')}
            </h5>
          </div>
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
            <AssetListTable data={data} />
          </div>
        </div>
      </AssetListContext.Provider>
    </Container>
  )
}

export default AssetListPage

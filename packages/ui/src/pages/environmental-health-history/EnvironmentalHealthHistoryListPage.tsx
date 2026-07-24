'use client'

import { useMutation } from '@tanstack/react-query'
import { Button } from '#components/button'
import {
  FilterExpandButton,
  FilterFormBody,
  FilterFormFooter,
  FilterFormRoot,
  FilterResetButton,
  FilterSubmitButton,
} from '#components/filter'
import Download from '#components/icons/Download'
import Export from '#components/icons/Export'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'
import { toast } from '#components/toast'
import { usePermission } from '#hooks/usePermission'
import { useTranslation } from 'react-i18next'

import EnvironmentalHealthHistoryTable from './components/EnvironmentalHealthHistoryTable'
import { useEnvironmentalHealthHistoryList } from './hooks/useEnvironmentalHealthHistoryList'
import { exportEnvironmentalHealthHistoryExcel } from './environmental-health-history.service'
import { downloadBase64 } from '#utils/download'

export default function EnvironmentalHealthHistoryListPage(): JSX.Element {
  usePermission('environmental-health-history-view')
  const { t } = useTranslation(['common', 'environmentalHealthHistory'])

  const {
    pagination,
    setPagination,
    handleChangeLimit,
    data,
    isLoading,
    filter,
  } = useEnvironmentalHealthHistoryList()

  const totalItems = data?.total_item ?? 0
  const totalPages = data?.total_page ?? 1

  const { mutate: onExportExcel, isPending: isExportingExcel } = useMutation({
    mutationFn: () => {
      const entityValue = filter?.query?.entity
      const paramCategoryValue = filter?.query?.parameter_category
      const statusValue = filter?.query?.status
      const sampleCollectedByValue = filter?.query?.sample_collected_by
      const hasIklValue = filter?.query?.has_ikl
      const dateRangeValue = filter?.query?.date_range
      const provinceValue = filter?.query?.province_id
      const regencyValue = filter?.query?.regency_id
      const healthCenterValue = filter?.query?.health_center_id

      return exportEnvironmentalHealthHistoryExcel({
        keyword: filter?.query?.keyword,
        entity_id: entityValue?.value ?? undefined,
        parameter_category_id: paramCategoryValue?.value ?? undefined,
        status: statusValue?.value ?? undefined,
        sample_collected_by: sampleCollectedByValue?.value ?? undefined,
        has_ikl: hasIklValue?.value ?? undefined,
        start_date: dateRangeValue?.start ?? undefined,
        end_date: dateRangeValue?.end ?? undefined,
        province_id: provinceValue?.value ?? undefined,
        regency_id: regencyValue?.value ?? undefined,
        health_center_id: healthCenterValue?.value ?? undefined,
        ...pagination,
      })
    },
    onSuccess: (data) => {
      downloadBase64(data.base64, data.filename, data.mimeType)
      toast.success({
        description: t('environmentalHealthHistory:export.excel') + ' success',
      })
    },
    onError: () => {
      toast.danger({
        description: t('common:message.common.error'),
      })
    },
  })

  return (
    <Container
      title={t('environmentalHealthHistory:title.settings')}
      hideTabs={false}
      withLayout={true}
    >
      <Meta title={`Smile | ${t('environmentalHealthHistory:title.list')}`} />

      <div className="mt-6 space-y-6">
        <FilterFormRoot collapsible onSubmit={filter.handleSubmit}>
          <FilterFormBody className="ui-grid-cols-4">
            {filter.renderField()}
          </FilterFormBody>
          <FilterFormFooter>
            <FilterExpandButton />
            <div className="ui-flex ui-gap-2">
              <Button
                id="btn-export-excel"
                variant="subtle"
                type="button"
                className="ui-px-2"
                leftIcon={<Export className="ui-size-5" />}
                disabled={isExportingExcel}
                onClick={() => onExportExcel()}
              >
                {t('environmentalHealthHistory:export.excel')}
              </Button>
              <span className="ui-h-full ui-w-px ui-bg-neutral-300" />
              <FilterResetButton variant="subtle" onClick={filter.reset} />
              <FilterSubmitButton
                onClick={() => setPagination({ page: 1 })}
                className="ui-w-[220px]"
                variant="outline"
              />
            </div>
          </FilterFormFooter>
          {filter.renderActiveFilter()}
        </FilterFormRoot>

        <EnvironmentalHealthHistoryTable
          data={data?.data}
          isLoading={isLoading}
          page={pagination.page}
          size={pagination.paginate}
        />

        <PaginationContainer>
          <PaginationSelectLimit
            size={pagination.paginate}
            onChange={handleChangeLimit}
            perPagesOptions={data?.list_pagination}
          />
          <PaginationInfo
            size={pagination.paginate}
            currentPage={pagination.page}
            total={totalItems}
          />
          <Pagination
            totalPages={totalPages}
            currentPage={pagination.page}
            onPageChange={(page) => setPagination({ page })}
          />
        </PaginationContainer>
      </div>
    </Container>
  )
}

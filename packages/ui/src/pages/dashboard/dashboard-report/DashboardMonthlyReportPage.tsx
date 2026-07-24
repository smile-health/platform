import { useMemo, useState } from 'react'
import { DataTable } from '#components/data-table'
import { useFilter, UseFilter } from '#components/filter'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { usePermission } from '#hooks/usePermission'
import { numberFormatter } from '#utils/formatter'
import { generateMetaTitle } from '#utils/strings'
import { useTranslation } from 'react-i18next'

import DashboardReportFilter from './components/DashboardReportFilter'
import { handleFilter, handleTableColumns } from './dashboard-report.helper'
import useDashboardReport from './hooks/useDashboardReport'
import dashboardReportFilterSchema from './schemas/dashboardReportFilterSchema'

export default function DashboardMonthlyReportPage() {
  usePermission('dashboard-monthly-report-view')
  const {
    t,
    i18n: { language },
  } = useTranslation('dashboardReport')

  const { t: tDashboard } = useTranslation('dashboard')

  const [enabled, setEnabled] = useState(false)

  const filterSchema = useMemo<UseFilter>(
    () => dashboardReportFilterSchema(t, tDashboard, 'monthly'),
    [t, tDashboard]
  )

  const filter = useFilter(filterSchema)

  const params = handleFilter({ ...filter?.query, period: 'monthly' })
  const paramsExportAll = handleFilter({
    ...filter?.watch(),
    period: 'monthly',
  })

  const { data, isLoading, onExport, onExportAll } = useDashboardReport({
    params,
    paramsExportAll,
    enabled,
    type: 'monthly',
  })

  return (
    <Container title={t('title.monthly')} withLayout>
      <Meta title={generateMetaTitle(t('title.monthly'))} />
      <div className="ui-space-y-6">
        <DashboardReportFilter
          filter={filter}
          onSubmit={() => setEnabled(true)}
          onExport={onExport}
          onExportAll={onExportAll}
        />
        <div className="ui-relative -ui-z-10">
          <DataTable
            isLoading={isLoading}
            data={data}
            columns={handleTableColumns(t, (value) =>
              numberFormatter(value, language)
            )}
          />
        </div>
      </div>
    </Container>
  )
}

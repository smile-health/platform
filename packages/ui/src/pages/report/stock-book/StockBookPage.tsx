import { useMemo } from 'react'
import { Button } from '#components/button'
import {
  FilterFormBody,
  FilterFormFooter,
  FilterFormRoot,
  FilterResetButton,
  UseFilter,
  useFilter,
} from '#components/filter'
import Export from '#components/icons/Export'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { usePermission } from '#hooks/usePermission'
import { generateMetaTitle } from '#utils/strings'
import { useTranslation } from 'react-i18next'

import useStockBookExport from './hooks/useStockBookExport'
import stockBookFilterSchema from './schemas/stockBookFilterSchema'

export default function StockBookPage() {
  usePermission('stock-book-view')
  const { t } = useTranslation('stockBook')

  const filterSchema = useMemo<UseFilter>(() => stockBookFilterSchema(t), [t])

  const filter = useFilter(filterSchema)

  const { isLoading, onExport, onExportAll } = useStockBookExport(filter)

  return (
    <Container title={t('title.page')} withLayout>
      <Meta title={generateMetaTitle(t('title.page'))} />
      <FilterFormRoot onSubmit={filter.handleSubmit}>
        <FilterFormBody className="ui-grid-cols-3">
          {filter.renderField()}
        </FilterFormBody>
        <FilterFormFooter>
          <div />
          <div className="ui-flex ui-gap-2">
            <Button
              data-testid="btn-export"
              variant="subtle"
              disabled={isLoading}
              onClick={onExport}
              leftIcon={<Export className="ui-size-5" />}
            >
              {t('action.export')}
            </Button>
            <Button
              data-testid="btn-export-all"
              variant="subtle"
              disabled={isLoading}
              onClick={onExportAll}
              leftIcon={<Export className="ui-size-5" />}
            >
              {t('action.export_all')}
            </Button>
            <span className="ui-h-full ui-w-px ui-bg-neutral-300" />
            <FilterResetButton onClick={filter.reset} variant="subtle" />
          </div>
        </FilterFormFooter>
        {filter.renderActiveFilter()}
      </FilterFormRoot>
    </Container>
  )
}

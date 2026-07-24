import React from 'react'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { usePermission } from '#hooks/usePermission'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { useTranslation } from 'react-i18next'

import { usePeriodOfStockTakingActiveData } from '../list/hooks/usePeriodOfStockTakingActiveData'
import PeriodOfStockTakingForm from './components/PeriodOfStockTakingForm'
import PeriodOfStockTakingFormContext from './libs/period-of-stock-taking-form.context'

const PeriodOfStockTakingFormPage = () => {
  usePermission('period-of-stock-taking-mutate')
  const { t } = useTranslation(['common', 'periodOfStockTaking'])
  const router = useSmileRouter()
  const { action } = router.query

  const {
    isFetchingActivePeriodData,
    isLoadingActivePeriodData,
    activePeriodData,
    contextValue,
  } = usePeriodOfStockTakingActiveData(action as string)

  useSetLoadingPopupStore(
    isFetchingActivePeriodData || isLoadingActivePeriodData
  )

  if (isFetchingActivePeriodData || isLoadingActivePeriodData) return null

  if (action === 'edit' && !activePeriodData)
    router.push('/v5/period-of-stock-taking')

  const title =
    action === 'edit'
      ? t('periodOfStockTaking:form.edit_stock_taking_period')
      : t('periodOfStockTaking:form.add_stock_taking_period')

  return (
    <Container title={title} withLayout>
      <Meta title={`SMILE | ${title}`} />
      <PeriodOfStockTakingFormContext.Provider value={contextValue}>
        <PeriodOfStockTakingForm
          data={action === 'edit' ? activePeriodData : null}
        />
      </PeriodOfStockTakingFormContext.Provider>
    </Container>
  )
}

export default PeriodOfStockTakingFormPage

import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'

import StockDetailPageEntity from './component/detail/StockDetailPageEntity'
import StockDetailPageMaterial from './component/detail/StockDetailPageMaterial'
import { useStockDetailPage } from './hooks/useStockDetailPage'

const StockDetailPage = () => {
  const { t, dataStock } = useStockDetailPage()

  return (
    <Container title={t('detail.title')} withLayout backButton={{ show: true }}>
      <Meta title={`SMILE | ${t('detail.title')}`} />

      <div className="ui-space-y-6">
        <StockDetailPageEntity data={dataStock?.entity} />
        <StockDetailPageMaterial data={dataStock} />
      </div>
    </Container>
  )
}

export default StockDetailPage

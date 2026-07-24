import Meta from "#components/layouts/Meta"
import Container from "#components/layouts/PageContainer"

import DisposalDetailEntity from "./components/DisposalDetailEntity"
import DisposalDetailMaterial from "./components/DisposalDetailMaterial"

import { useDisposalDetailPage } from "./hooks/useDisposalDetailPage"
import { useRef, useEffect } from "react"

const DisposalDetailPage: React.FC = () => {
  const { t, data, handleBack } = useDisposalDetailPage()
  const lastDataRef = useRef<typeof data>(undefined)
  
  useEffect(() => {
    if (data) lastDataRef.current = data
  }, [data])
  const safeData = data || lastDataRef.current

  return (
    <Container title={t('disposalList:detail.title')} withLayout backButton={{ show: true, onClick: handleBack }}>
      <Meta title={t('disposalList:detail.meta')} />

      <div className="ui-space-y-6">
        <DisposalDetailEntity data={safeData} />
        <DisposalDetailMaterial data={safeData} />
      </div>
    </Container>
  )
}

export default DisposalDetailPage

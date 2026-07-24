import { Fragment, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { RenderDetailValue } from "#components/modules/RenderDetailValue"

import { Disposal } from "../types/disposal"
import { numberFormatter } from "#utils/formatter"
import { DataTable } from "#components/data-table"
import { columnsTrademarkMaterial, TrademarkMaterial } from "../constants/table"
import DisposalBatchDetailModal from "./DisposalBatchDetailModal"
import { parseDateTime } from "#utils/date"

type Props = {
  data?: Disposal
}

const DisposalDetailMaterial: React.FC<Props> = ({ data }) => {
  const { t, i18n: { language } } = useTranslation('disposalList')

  // Transform details data into trademark materials format
  const trademarkMaterials = useMemo(() => {
    if (!data?.details) return []

    return data.details.map(detail => ({
      id: detail.material_id,
      material_name: detail.material?.name || '-',
      stock_from_discard: detail.disposal_discard_qty || 0,
      stock_from_received: detail.disposal_received_qty || 0,
      updated_at: parseDateTime(detail.updated_at || '', 'DD MMM YYYY HH:mm').toUpperCase(),
    }))
  }, [data])

  // Batch detail modal state
  const [batchModalIndex, setBatchModalIndex] = useState<number | null>(null)
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false)
  const handleViewDetailBatch = (index: number) => {
    setBatchModalIndex(index)
    setIsBatchModalOpen(true)
  }
  const handleCloseBatchModal = () => {
    setIsBatchModalOpen(false)
    setBatchModalIndex(null)
  }

  return (
    <Fragment>
      <div className="ui-p-6 ui-border ui-rounded ui-space-y-4 ui-mx-3">
        <div className="ui-flex ui-justify-between ui-items-start">
          <div className="ui-font-semibold">{t('detail.material.title')}</div>
        </div>

        <RenderDetailValue
          className="ui-gap-y-2"
          valuesClassName="ui-text-neutral-500 ui-text-base ui-font-bold"
          data={[
            { label: t('detail.material.active_ingredient'), value: data?.material?.name || '-' },
            { label: t('detail.material.total_stock_disposal'), value: numberFormatter((data?.total_disposal_discard_qty || 0) + (data?.total_disposal_received_qty || 0), language) },
            { label: t('detail.material.stock_from_discard_transaction'), value: numberFormatter(data?.total_disposal_discard_qty || 0, language) },
            { label: t('detail.material.stock_from_received_disposal'), value: numberFormatter(data?.total_disposal_received_qty || 0, language) },
          ]}
        />

        <div className="ui-flex ui-justify-between ui-items-start">
          <div className="ui-font-semibold">{t('detail.trademark.title')}</div>
        </div>

        <DataTable
          data={trademarkMaterials}
          columns={columnsTrademarkMaterial({ t, language, onViewDetail: handleViewDetailBatch })}
          className="ui-overflow-x-auto"
          bodyClassName="ui-bg-white"
        />
        <DisposalBatchDetailModal
          open={isBatchModalOpen}
          onClose={handleCloseBatchModal}
          data={data}
          selectedIndex={batchModalIndex ?? 0}
          locale={language}
        />
      </div>
    </Fragment>
  )
}

export default DisposalDetailMaterial

import React, { useMemo } from 'react'
import { Drawer, DrawerContent, DrawerHeader } from '#components/drawer'
import { parseDateTime } from '#utils/date'
import { numberFormatter } from '#utils/formatter'
import { useTranslation } from 'react-i18next'

import { Disposal } from '../types/disposal'

type Props = {
  open: boolean
  onClose: () => void
  data?: Disposal
  selectedIndex: number // index of details[]
  locale?: string // "id"|"en"
}

const DisposalBatchDetailModal: React.FC<Props> = ({
  open,
  onClose,
  data,
  selectedIndex,
  locale = 'id',
}) => {
  const { t, i18n } = useTranslation(['disposalList'])

  if (
    !data ||
    typeof selectedIndex !== 'number' ||
    !data.details[selectedIndex]
  )
    return null

  const detail = data.details[selectedIndex]
  const material = data.material

  const sumTotalDisposal = detail.stocks.reduce((acc, stock) => {
    return (
      acc +
      (stock.disposal_discard_qty || 0) +
      (stock.disposal_received_qty || 0)
    )
  }, 0)

  return (
    <Drawer
      open={open}
      onOpenChange={onClose}
      placement="bottom"
      sizeHeight="lg"
      size="full"
      className="ui-rounded-t-lg ui-font-sans"
    >
      <DrawerHeader>
        <div className="ui-flex ui-justify-between">
          <div />
          <h6 className="ui-text-xl ui-text-primary-800 ui-font-medium ui-mx-auto">
            {t('modal.batch_detail_title')}
          </h6>
          <button className="ui-text-xl" onClick={onClose} aria-label="close">
            ×
          </button>
        </div>
      </DrawerHeader>
      <DrawerContent className="ui-border-y ui-border-b-zinc-300">
        {/* Section 1: Info Material */}
        <div className="ui-grid ui-grid-cols-[40%_40%_20%] ui-gap-4 ui-mt-6 ui-mb-4">
          <div>
            <div className="ui-text-sm ui-font-normal ui-text-neutral-500">
              {t('detail.trademark.title')}
            </div>
            <div className="ui-text-base ui-font-bold ui-text-primary-800 ui-break-normal">
              {material?.name || '-'}
            </div>
          </div>
          <div>
            <div className="ui-text-sm ui-font-normal ui-text-neutral-500">
              {t('table.column.stock_from_discard')}
            </div>
            <div className="ui-text-base ui-font-bold ui-text-primary-800 ui-break-normal">
              {numberFormatter(detail.disposal_discard_qty || 0, locale)}
            </div>
          </div>
          <div>
            <div className="ui-text-sm ui-font-normal ui-text-neutral-500">
              {t('table.column.stock_from_received')}
            </div>
            <div className="ui-text-base ui-font-bold ui-text-primary-800 ui-break-normal">
              {numberFormatter(detail.disposal_received_qty || 0, locale)}
            </div>
          </div>
        </div>

        {/* Section 2: Table Batch Detail */}
        <div className="ui-overflow-x-auto ui-mb-6">
          <table className="ui-w-full ui-text-sm ui-border ui-rounded">
            <thead className="ui-bg-slate-100">
              <tr>
                <th className="ui-px-2 ui-py-3 ui-font-medium ui-text-left">
                  {t('detail.trademark.table.column.sl_no')}
                </th>
                <th className="ui-px-2 ui-py-3 ui-font-medium ui-text-left">
                  {t('table.column.activity_name')}
                </th>
                <th className="ui-px-2 ui-py-3 ui-font-medium ui-text-left">
                  {t('detail.trademark.table.column.batch_info')}
                </th>
                <th className="ui-px-2 ui-py-3 ui-font-medium ui-text-left">
                  <div className="ui-flex ui-items-center">
                    {t('detail.material.total_stock_disposal')}
                  </div>
                </th>
                <th className="ui-px-2 ui-py-3 ui-font-medium ui-text-left">
                  <div className="ui-flex ui-items-center">
                    {t('table.column.stock_from_discard')}
                  </div>
                </th>
                <th className="ui-px-2 ui-py-3 ui-font-medium ui-text-left">
                  {t('table.column.stock_from_received')}
                </th>
              </tr>
            </thead>
            <tbody>
              {detail.stocks?.length > 0 ? detail.stocks.map((stock, i) => (
                <tr key={stock.id} className="ui-border-t">
                  {/* SI.No */}
                  <td className="ui-px-2 ui-py-2 ui-content-start">{i + 1}</td>
                  {/* Activity */}
                  <td className="ui-px-2 ui-py-2 ui-content-start">{stock.activity?.name || "-"}</td>
                  {/* Batch Info */}
                  <td className="ui-px-2 ui-py-2 ui-whitespace-pre-line ui-content-start">
                    <span className="ui-font-semibold ui-text-dark-blue">{stock.batch?.code || "-"}</span><br />
                    {`${t("table.column.production_date")}: ${stock.batch?.production_date ? parseDateTime(stock.batch.production_date, "DD MMM YYYY") : "-"}`}<br />
                    {`${t("table.column.manufacture_name")}: ${stock.batch?.manufacture?.name || "-"}`}<br />
                    {`${t("table.column.expired_date")}: ${stock.batch?.expired_date ? parseDateTime(stock.batch.expired_date, "DD MMM YYYY") : "-"}`}
                  </td>
                  {/* Total Discard */}
                  <td className="ui-px-2 ui-py-2 ui-content-start">
                    {numberFormatter((stock.disposal_discard_qty || 0) + (stock.disposal_received_qty || 0), locale)}
                  </td>
                  {/* Discard from Internal */}
                  <td className="ui-px-2 ui-py-2 ui-content-start">
                    {stock.disposals?.map((d, idx) => (
                      <div
                        key={d.transaction_reason_id + '-discard'}
                        className="ui-text-sm"
                      >
                        {d.transaction_reason.title || "-"}: {numberFormatter(d.disposal_discard_qty, locale)}
                      </div>
                    ))}
                  </td>
                  {/* Discard from External */}
                  <td className="ui-px-2 ui-py-2 ui-content-start">
                    {stock.disposals?.map((d, idx) => (
                      <div
                        key={d.transaction_reason_id + '-received'}
                        className="ui-text-sm"
                      >
                        {d.transaction_reason.title || "-"}: {numberFormatter(d.disposal_received_qty, locale)}
                      </div>
                    ))}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td
                    colSpan={6}
                    className="ui-text-center ui-p-8 ui-text-neutral-400"
                  >
                    No batch data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Section 3: Disposal History */}
        <div>
          <div className="ui-font-bold ui-text-dark-blue ui-mb-4">{t("modal.batch_disposal_history")}</div>
          <div className="ui-flex ui-gap-4">
            {/* Card 1 */}
            <div className="ui-border ui-border-[#D4D4D4] ui-rounded ui-py-2 ui-px-4 ui-flex-1">
              <div className="ui-text-dark-blue ui-text-sm">{t("modal.batch_total_shipment")}</div>
              <div className="ui-font-bold ui-text-dark-blue ui-text-sm">{numberFormatter(detail.disposal_shipped_qty, locale)}</div>
            </div>
            {/* Card 2 */}
            <div className="ui-border ui-border-[#D4D4D4] ui-rounded ui-py-2 ui-px-4 ui-flex-1">
              <div className="ui-text-dark-blue ui-text-sm">{t("modal.batch_total_self_disposal")}</div>
              <div className="ui-font-bold ui-text-dark-blue ui-text-sm">{numberFormatter(detail.disposal_qty, locale)}</div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default DisposalBatchDetailModal

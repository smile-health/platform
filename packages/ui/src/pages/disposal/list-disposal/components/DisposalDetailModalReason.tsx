import { useTranslation } from "react-i18next"
import { Dialog, DialogCloseButton, DialogContent, DialogFooter, DialogHeader } from "#components/dialog"
import { StockExtermination } from "../types/disposal"
import { Button } from "#components/button"

type Props = {
  data?: {
    item: StockExtermination[]
    batch: string
    activity: string
  }
  handleClose: () => void
}

const DisposalDetailModalReason: React.FC<Props> = ({ data, handleClose }) => {
  const { t, i18n: { language } } = useTranslation(['disposalList', 'common'])

  const sum = (data: StockExtermination[] | undefined, key: keyof StockExtermination) => {
    if (!data) return 0
    return data.reduce((acc, item) => acc + Number(item[key]), 0)
  }

  return (
    <Dialog size="xl" open={!!data} onOpenChange={handleClose}>
      <DialogCloseButton />
      <DialogHeader className="ui-text-center ui-text-xl">
        {t('disposalList:table.action.reason')}
      </DialogHeader>
      <DialogContent>
        <div>
          <div>
            <div className="ui-text-primary-800 ui-font-semibold">Material Name</div>
            <div
              className="ui-grid ui-gap-y-1 ui-mt-1 ui-text-gray-700"
              style={{
                gridTemplateColumns: '0.5fr 10px 1fr',
              }}
            >
              <div className="ui-text-left">Batch ID</div>
              <div>:</div>
              <div className="ui-text-left">{data?.batch}</div>

              <div className="ui-text-left">{t('disposalList:table.column.activity_name')}</div>
              <div>:</div>
              <div className="ui-text-left">{data?.activity}</div>
            </div>
          </div>
          <div className="mt-6">
            <div className="ui-text-primary-800 ui-px-2 ui-py-2 ui-font-semibold ui-text-left ui-bg-blue-100">
              {t('disposalList:table.column.stock_from_discard')}: {sum(data?.item, 'extermination_discard_qty')}
            </div>
            <div className="ui-px-1 ui-mt-1 ui-text-gray-700">
              <table>
                <tbody>
                  {data?.item?.map((item) => {
                    return (
                      <tr key={`${item.id}-pembuangan`}>
                        <td style={{ minWidth: 120, maxWidth: '85%' }} className="ui-text-left">
                          {language === 'en' ? item.transaction_reason?.title_en || '-' : item.transaction_reason?.title || '-'}
                        </td>
                        <td className="ui-px-2">:</td>
                        <td className="ui-text-left">{item.extermination_discard_qty}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="ui-mt-3">
            <div className="ui-text-primary-800 ui-px-2 ui-py-2 ui-font-semibold ui-text-left ui-bg-blue-100">
              {t('disposalList:table.column.stock_from_received')} : {sum(data?.item, 'extermination_received_qty')}
            </div>
            <div className="ui-px-1 ui-mt-1 ui-text-gray-700">
              <table>
                <tbody>
                  {data?.item?.map((item) => {
                    return (
                      <tr key={`${item.id}-penerimaan`}>
                        <td style={{ minWidth: 120, maxWidth: '85%' }} className="ui-text-left">
                          {language === 'en' ? item.transaction_reason?.title_en || '-' : item.transaction_reason?.title || '-'}
                        </td>
                        <td className="ui-px-2">:</td>
                        <td className="ui-text-left">{item.extermination_received_qty}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DialogContent>
      <DialogFooter className="ui-justify-center">
        <Button
          id="btnCloseModalViewReason"
          variant="outline"
          className="ui-w-full"
          onClick={handleClose}
        >
          {t('common:close')}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}

export default DisposalDetailModalReason

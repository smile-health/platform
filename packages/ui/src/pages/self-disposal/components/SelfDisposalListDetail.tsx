import { Button } from '#components/button'
import { DataTable } from '#components/data-table'
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '#components/dialog'
import { Table, TableEmpty, Tbody, Td, Th, Thead, Tr } from '#components/table'
import { parseDateTime } from '#utils/date'
import { useTranslation } from 'react-i18next'

import { SelfDisposalItem } from '../self-disposal.type'
import { TextArea } from '#components/text-area'
import { numberFormatter } from '#utils/formatter'

export default function SelfDisposalListDetail({
  data,
  open,
  onClose,
}: {
  data: SelfDisposalItem | null
  open: boolean
  onClose: () => void
}) {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'selfDisposal'])

  return (
    <Dialog open={open} onOpenChange={onClose} size="xl">
      <DialogCloseButton></DialogCloseButton>
      <DialogHeader className="ui-text-center ui-text-xl">
        {t('common:view_detail')}
      </DialogHeader>
      <DialogContent className="ui-space-y-5 ui-border-y ui-py-7">
        <div className="ui-grid ui-grid-cols-[1.5fr_1fr] ui-gap-20 ui-mb-1">
          <div>
            <h2 className="ui-text-sm ui-font-medium ui-text-neutral-500">
              {t('selfDisposal:create.material_table.material_name')}
            </h2>
            <p className="ui-font-bold ui-text-primary-800 ui-break-normal">
              {data?.material?.name}
            </p>
          </div>

          <div>
            <h2 className="ui-text-sm ui-font-medium ui-text-neutral-500">
              {t('selfDisposal:create.disposal_report_number')}
            </h2>
            <p className="ui-font-bold ui-text-primary-800">
              {data?.report_number || '-'}
            </p>
          </div>
        </div>
        <Table
          withBorder
          rounded
          overflowXAuto={false}
          stickyOffset={0}
          verticalAlignment="center"
        >
          <Thead>
            <Tr>
              <Th className="ui-text-dark-blue ui-font-semibold w-1/3">
                {t('selfDisposal:create.disposal_batch_table.batch_info')}
              </Th>
              <Th className="ui-text-dark-blue ui-font-semibold">
                {t('selfDisposal:table.activity')}
              </Th>
              <Th className="ui-text-dark-blue ui-font-semibold">
                {t('selfDisposal:create.disposal_batch_table.qty_stock_from_discard')}
              </Th>
              <Th className="ui-text-dark-blue ui-font-semibold">
                {t('selfDisposal:create.disposal_batch_table.qty_stock_from_received')}
              </Th>
            </Tr>
          </Thead>
          <Tbody className="text-sm ui-text-dark-blue">
            <Tr>
              <Td className="ui-content-start ui-space-y-1.5">
                <div className="ui-font-semibold">
                  {data?.disposal_stock?.batch?.code || '-'}
                </div>
                <div className="ui-space-x-1">
                  <span>
                    {t('selfDisposal:create.disposal_batch_table.manufacturer')}
                  </span>
                  <span>:</span>
                  <span>{data?.disposal_stock?.batch?.manufacture?.name}</span>
                </div>
                <div className="ui-space-x-1">
                  <span>
                    {t(
                      'selfDisposal:create.disposal_batch_table.production_date'
                    )}
                  </span>
                  <span>:</span>
                  <span>
                    {parseDateTime(
                      data?.disposal_stock?.batch?.production_date,
                      'DD MMM YYYY',
                      language
                    )}
                  </span>
                </div>
                <div className="ui-space-x-1">
                  <span>
                    {t('selfDisposal:create.disposal_batch_table.expired_date')}
                  </span>
                  <span>:</span>
                  <span>
                    {parseDateTime(
                      data?.disposal_stock?.batch?.expired_date,
                      'DD MMM YYYY',
                      language
                    )}
                  </span>
                </div>
              </Td>
              <Td className="ui-content-start">
                {data?.disposal_stock?.activity?.name}
              </Td>
              <Td className="ui-content-start">
                {numberFormatter(data?.disposal_discard_qty || 0, language)}
              </Td>
              <Td className="ui-content-start">
                {numberFormatter(data?.disposal_received_qty || 0, language)}
              </Td>
            </Tr>
          </Tbody>
        </Table>

        <div className="ui-grid ui-grid-cols-[1.5fr_1fr]">
          <div className='ui-space-y-2'>
            <p className="ui-text-sm ui-font-bold">{t('selfDisposal:create.comment')}</p>
            <TextArea
              value={data?.comment || '-'}
              disabled
            />
          </div>
        </div>
      </DialogContent>
      <DialogFooter>
        <Button className="ui-w-full" variant="outline" onClick={onClose}>
          {t('common:close')}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}

import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { DisposalInstructionBox } from '#pages/disposal-instruction/components/DisposalInstructionBox'
import { useTranslation } from 'react-i18next'

import { useDisposalInstructionDetail } from '../../DisposalInstructionDetailContext'
import { useDownloadFile } from '../download-file/useDownloadFile'
import { DisposalItemsTable } from './DisposalItemsTable'
import { QtyDetailModal } from './QtyDetailModal'
import { WmsDetailDrawer } from './WmsDetailDrawer'
import { WmsStatusHistoryModal } from './WmsStatusHistoryModal'

export const DisposalItems = () => {
  const { t } = useTranslation(['disposalInstructionDetail'])

  const disposalInstructionDetail = useDisposalInstructionDetail()
  const downloadFile = useDownloadFile()

  useSetLoadingPopupStore(downloadFile.handoverReportLetter.isLoading)

  return (
    <>
      <WmsStatusHistoryModal />
      <WmsDetailDrawer />
      <QtyDetailModal />

      <DisposalInstructionBox
        title={
          disposalInstructionDetail.isLoading
            ? 'Item'
            : `Item (${disposalInstructionDetail.data?.disposal_items.length})`
        }
        buttons={[
          {
            id: 'download_handover_report_letter',
            label: t(
              'disposalInstructionDetail:button.download_handover_report_letter'
            ),
            onClick: downloadFile.handoverReportLetter.download,
            isLoading:
              downloadFile.handoverReportLetter.isLoading ||
              disposalInstructionDetail.isLoading,
          },
        ]}
      >
        <DisposalItemsTable />
      </DisposalInstructionBox>
    </>
  )
}

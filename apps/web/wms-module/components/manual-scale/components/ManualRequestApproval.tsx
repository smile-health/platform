import { ModalConfirmation } from '@/components/ModalConfirmation';
import { TManualScale } from '@/types/manual-scale';
import { useTranslation } from 'react-i18next';
import { useRequestApprovalHandler } from '../hooks/useRequestApproval';
import ManualRequestItem from './ManualRequestItem';

interface ManualRequestApprovalProps {
  item?: TManualScale;
}

const ManualRequestApproval: React.FC<ManualRequestApprovalProps> = ({
  item,
}) => {
  const { t } = useTranslation(['common', 'notification']);

  const {
    actionType,
    selectedItem,
    showRequestApprovalModal,
    showInfoModal,
    infoModalData,
    isProcessing,
    setShowInfoModal,
    setShowRequestApprovalModal,
    handleRequestApprovalClick,
    handleAcceptRequestApproval,
    handleRejectRequestApproval,
  } = useRequestApprovalHandler();

  return (
    <>
      <ManualRequestItem
        item={item}
        handleRequestApprovalClick={handleRequestApprovalClick}
      />

      {/* Modal RequestApproval */}
      <ModalConfirmation
        open={showRequestApprovalModal}
        setOpen={setShowRequestApprovalModal}
        type="dual-action"
        title={t('notification:request.title')}
        description={t('notification:request.description', {
          name: selectedItem?.operatorName,
        })}
        confirmText={
          isProcessing && actionType === 'APPROVED'
            ? t('common:notification.loading')
            : t('common:accept')
        }
        cancelText={
          isProcessing && actionType === 'REJECTED'
            ? t('common:notification.loading')
            : t('common:reject')
        }
        onSubmit={handleAcceptRequestApproval}
        onReject={handleRejectRequestApproval}
      />

      {/* Modal Info */}
      <ModalConfirmation
        open={showInfoModal}
        setOpen={setShowInfoModal}
        type="info"
        titleClassName="ui-flex ui-justify-start"
        contentClassName="ui-flex ui-justify-start"
        title={infoModalData?.title}
        description={infoModalData?.description}
        onSubmit={() => setShowInfoModal((prev) => !prev)}
      />
    </>
  );
};

export default ManualRequestApproval;

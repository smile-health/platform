import NotificationItem from '@/components/layouts/Notification/NotificationItem';
import { ModalConfirmation } from '@/components/ModalConfirmation';
import { TNotification } from '@/types/notification';
import { useTranslation } from 'react-i18next';
import { useRequestApprovalHandler } from '../hooks/useRequestApprovalHandler';

interface NotificationWithRequestApprovalProps {
  item?: TNotification;
  type?: 'popup' | 'page' | 'toast';
  withBorder?: boolean;
  handleNotificationItemClick?: (item?: TNotification) => void;
  onRequestApprovalSuccess?: () => void;
  onRequestApprovalError?: (error: any) => void;
  refetchData?: () => void;
}

const NotificationWithRequestApproval: React.FC<
  NotificationWithRequestApprovalProps
> = ({
  item,
  type = 'popup',
  withBorder = true,
  handleNotificationItemClick,
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
      <NotificationItem
        item={item}
        type={type}
        withBorder={withBorder}
        handleNotificationItemClick={handleNotificationItemClick}
        handleRequestApprovalClick={handleRequestApprovalClick}
      />

      {/* Modal RequestApproval */}
      <ModalConfirmation
        open={showRequestApprovalModal}
        setOpen={setShowRequestApprovalModal}
        type="dual-action"
        title={t('notification:request.title')}
        description={t('notification:request.description', {
          name: selectedItem?.userName,
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

export default NotificationWithRequestApproval;

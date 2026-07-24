import { updateManualScaleApproval } from '@/services/manual-scale';
import { ManualScaleStatus, TManualScale } from '@/types/manual-scale';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface UseRequestApprovalHandlerProps {
  onSuccess?: (action: 'accept' | 'reject') => void;
  onError?: (action: 'accept' | 'reject', error: any) => void;
}

export const useRequestApprovalHandler = ({
  onSuccess,
  onError,
}: UseRequestApprovalHandlerProps = {}) => {
  const { t } = useTranslation(['common', 'notification']);
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] = useState<TManualScale | null>(null);
  const [actionType, setActionType] = useState<
    ManualScaleStatus.APPROVED | ManualScaleStatus.REJECTED | null
  >(null);
  const [showRequestApprovalModal, setShowRequestApprovalModal] =
    useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoModalData, setInfoModalData] = useState<{
    title: string;
    description: string;
    type: 'success' | 'error';
  } | null>(null);

  const {
    mutate: requestApproval,
    isPending: isProcessing,
    isSuccess: isRequestSuccess,
    isError: isRequestError,
    error: requestError,
    reset: resetRequest,
  } = useMutation({
    mutationKey: ['request-approval', selectedItem?.id],
    mutationFn: async ({
      item,
      status,
    }: {
      item: TManualScale;
      status: ManualScaleStatus.APPROVED | ManualScaleStatus.REJECTED;
    }) => {
      await updateManualScaleApproval({ id: item.id, status });
    },
    onSuccess: (_data, variables) => {
      const status = variables?.status;
      const name = variables.item.operatorName ?? '';
      queryClient.invalidateQueries({ queryKey: ['getManualScale'] });
      setInfoModalData({
        title:
          status === ManualScaleStatus.APPROVED
            ? t('notification:info.request_accepted')
            : t('notification:info.request_rejected'),
        description:
          status === ManualScaleStatus.APPROVED
            ? t('notification:info.request_accepted_desc', { name })
            : t('notification:info.request_rejected_desc', { name }),
        type: 'success',
      });

      setShowRequestApprovalModal(false);
      setShowInfoModal(true);
      setActionType(null);
      onSuccess?.(status === ManualScaleStatus.APPROVED ? 'accept' : 'reject');
    },
    onError: (error, variables) => {
      setShowRequestApprovalModal(false);
      setActionType(null);
      onError?.(
        variables.status === ManualScaleStatus.APPROVED ? 'accept' : 'reject',
        error
      );
    },
  });

  const handleSubmitRequestApproval = (
    status: ManualScaleStatus.APPROVED | ManualScaleStatus.REJECTED
  ) => {
    if (!selectedItem) return;
    resetRequest();
    setActionType(status);
    requestApproval({ item: selectedItem, status });
  };

  const handleAcceptRequestApproval = () =>
    handleSubmitRequestApproval(ManualScaleStatus.APPROVED);
  const handleRejectRequestApproval = () =>
    handleSubmitRequestApproval(ManualScaleStatus.REJECTED);

  const handleRequestApprovalClick = (item: TManualScale) => {
    setSelectedItem(item);
    setShowInfoModal(false);
    setShowRequestApprovalModal(true);
  };

  return {
    // States
    actionType,
    selectedItem,
    showRequestApprovalModal,
    showInfoModal,
    infoModalData,
    isProcessing,
    isRequestSuccess,
    isRequestError,
    requestError,
    setShowInfoModal,
    setShowRequestApprovalModal,

    // Handlers
    handleRequestApprovalClick,
    handleAcceptRequestApproval,
    handleRejectRequestApproval,

    // Reset functions
    resetRequest,
  };
};

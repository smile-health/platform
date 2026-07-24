import { approvalBast } from '@/services/bast';
import { BastStatus, TBast } from '@/types/bast';
import { handleAxiosError } from '@/utils/handleAxiosError';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

export const useBastApprovalHandler = () => {
  const [selectedBast, setSelectedBast] = useState<TBast | null>(null);
  const [showRequestApprovalModal, setShowRequestApprovalModal] = useState(
    false
  );
  const queryClient = useQueryClient();

  const { mutate: requestApproval, isPending: isProcessing } = useMutation({
    mutationKey: ['request-approval', selectedBast?.bastNo],
    mutationFn: async ({
      item,
      status,
    }: {
      item: TBast;
      status: BastStatus.APPROVED | BastStatus.REJECTED;
    }) => {
      await approvalBast({ bastNo: item.bastNo, status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getBast'] });
      setShowRequestApprovalModal(false);
    },
    onError: handleAxiosError,
  });

  const handleRequestApprovalClick = (bast: TBast) => {
    setSelectedBast(bast);
    setShowRequestApprovalModal(true);
  };

  const handleAcceptRequestApproval = () => {
    if (!selectedBast) return;

    requestApproval({
      item: selectedBast,
      status: BastStatus.APPROVED,
    });
  };

  const handleRejectRequestApproval = () => {
    if (!selectedBast) return;

    requestApproval({
      item: selectedBast,
      status: BastStatus.REJECTED,
    });
  };

  return {
    selectedBast,
    showRequestApprovalModal,
    isProcessing,
    setShowRequestApprovalModal,
    handleRequestApprovalClick,
    handleAcceptRequestApproval,
    handleRejectRequestApproval,
  };
};

export default useBastApprovalHandler;

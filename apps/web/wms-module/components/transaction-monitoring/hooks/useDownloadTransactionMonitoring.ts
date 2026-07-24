import { getExportTransactionMonitoring } from '@/services/download-excel';
import { GetExcelExportParams } from '@/types/download-excel';
import { toast } from '@repo/ui/components/toast';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

export const useDownloadTransactionMonitoring = () => {
  const { t } = useTranslation(['common', 'transactionMonitoring']);

  const {
    mutateAsync: downloadTransactionMonitoring,
    isPending: isLoading,
    error,
  } = useMutation({
    mutationFn: (params: GetExcelExportParams) =>
      getExportTransactionMonitoring(params),
    onSuccess: () => {
      toast.success({
        description: t('common:message.success.download', {
          type: t('transactionMonitoring:title.page')?.toLowerCase(),
        }),
      });
    },
    onError: (error: Error) => {
      toast.danger({
        description:
          error.message ||
          t('common:message.failed.download', {
            type: t('transactionMonitoring:title.page')?.toLowerCase(),
          }),
      });
    },
  });

  return {
    downloadTransactionMonitoring,
    isLoading,
    error,
  };
};

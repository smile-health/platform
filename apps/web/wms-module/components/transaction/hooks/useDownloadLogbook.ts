import { getExportLogbook } from '@/services/download-excel';
import { GetExcelExportParams } from '@/types/download-excel';
import { toast } from '@repo/ui/components/toast';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

export const useDownloadLogbook = () => {
  const { t } = useTranslation(['common', 'transaction']);

  const {
    mutateAsync: downloadLogbook,
    isPending: isLoading,
    error,
  } = useMutation({
    mutationFn: (params: GetExcelExportParams) => getExportLogbook(params),
    onSuccess: () => {
      toast.success({
        description: t('common:message.success.download', {
          type: t('transaction:list.logbook')?.toLowerCase(),
        }),
      });
    },
    onError: (error: Error) => {
      toast.danger({
        description:
          error.message ||
          t('common:message.failed.download', {
            type: t('transaction:list.logbook')?.toLowerCase(),
          }),
      });
    },
  });

  return {
    downloadLogbook,
    isLoading,
    error,
  };
};

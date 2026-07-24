import { getExportUserActivity } from '@/services/download-excel';
import { GetExcelExportParams } from '@/types/download-excel';
import { toast } from '@repo/ui/components/toast';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

export const useDownloadUserActivity = () => {
  const { t } = useTranslation(['common', 'userActivity']);

  const {
    mutateAsync: downloadUserActivity,
    isPending: isLoading,
    error,
  } = useMutation({
    mutationFn: (params: GetExcelExportParams) => getExportUserActivity(params),
    onSuccess: () => {
      toast.success({
        description: t('common:message.success.download', {
          type: t('userActivity:title.page')?.toLowerCase(),
        }),
      });
    },
    onError: (error: Error) => {
      toast.danger({
        description:
          error.message ||
          t('common:message.failed.download', {
            type: t('userActivity:title.page')?.toLowerCase(),
          }),
      });
    },
  });

  return {
    downloadUserActivity,
    isLoading,
    error,
  };
};

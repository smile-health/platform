import {
  getExportTrackingAll,
  getExportTrackingCharacteristics,
  getExportTrackingSource,
  getExportTrackingWasteBag,
} from '@/services/download-excel';
import { GetExcelExportParams } from '@/types/download-excel';
import { toast } from '@repo/ui/components/toast';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

export const useDownloadTracking = () => {
  const { t } = useTranslation(['common', 'tracking']);

  const {
    mutateAsync: downloadTrackingCharacteristics,
    isPending: isLoadingDownloadTrackingCharacteristics,
  } = useMutation({
    mutationFn: (params: GetExcelExportParams) =>
      getExportTrackingCharacteristics(params),
    onSuccess: () => {
      toast.success({
        description: t('common:message.success.download', {
          type: t('tracking:list.waste_characteristic')?.toLowerCase(),
        }),
      });
    },
    onError: (error: Error) => {
      toast.danger({
        description:
          error.message ||
          t('common:message.failed.download', {
            type: t('tracking:list.waste_characteristic')?.toLowerCase(),
          }),
      });
    },
  });

  const {
    mutateAsync: downloadTrackingSource,
    isPending: isLoadingDownloadTrackingSource,
  } = useMutation({
    mutationFn: (params: GetExcelExportParams) =>
      getExportTrackingSource(params),
    onSuccess: () => {
      toast.success({
        description: t('common:message.success.download', {
          type: t('tracking:list.waste_source')?.toLowerCase(),
        }),
      });
    },
    onError: (error: Error) => {
      toast.danger({
        description:
          error.message ||
          t('common:message.failed.download', {
            type: t('tracking:list.waste_characteristic')?.toLowerCase(),
          }),
      });
    },
  });

  const {
    mutateAsync: downloadTrackingWasteBag,
    isPending: isLoadingDownloadTrackingWasteBag,
  } = useMutation({
    mutationFn: (params: GetExcelExportParams) =>
      getExportTrackingWasteBag(params),
    onSuccess: () => {
      toast.success({
        description: t('common:message.success.download', {
          type: t('tracking:list.waste_bag')?.toLowerCase(),
        }),
      });
    },
    onError: (error: Error) => {
      toast.danger({
        description:
          error.message ||
          t('common:message.failed.download', {
            type: t('tracking:list.waste_bag')?.toLowerCase(),
          }),
      });
    },
  });

  const {
    mutateAsync: downloadTrackingAll,
    isPending: isLoadingDownloadTrackingAll,
  } = useMutation({
    mutationFn: (params: GetExcelExportParams) => getExportTrackingAll(params),
    onSuccess: () => {
      toast.success({
        description: t('common:message.success.download', {
          type: t('tracking:list.waste_bag')?.toLowerCase(),
        }),
      });
    },
    onError: (error: Error) => {
      toast.danger({
        description:
          error.message ||
          t('common:message.failed.download', {
            type: t('tracking:list.list')?.toLowerCase(),
          }),
      });
    },
  });

  return {
    downloadTrackingCharacteristics,
    isLoadingDownloadTrackingCharacteristics,
    downloadTrackingSource,
    isLoadingDownloadTrackingSource,
    downloadTrackingWasteBag,
    isLoadingDownloadTrackingWasteBag,
    downloadTrackingAll,
    isLoadingDownloadTrackingAll,
  };
};

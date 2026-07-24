'use client';
import { getTransactionDetail } from '@/services/transaction';
import { ErrorResponse } from '@/types/common';
import {
  GetTransactionDetailResponse,
  TWasteTransaction,
} from '@/types/transaction';
import { Button } from '@repo/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '@repo/ui/components/dialog';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import React from 'react';
import { useTranslation } from 'react-i18next';
import WasteTrackingDetailTable from './WasteTrackingDetailTable';

type TrackingDetailModalProps = {
  open: boolean;
  onClose: () => void;
  transactionData: TWasteTransaction | null;
};
export const TrackingDetailModal: React.FC<TrackingDetailModalProps> = ({
  open,
  onClose,
  transactionData,
}) => {
  const { t } = useTranslation(['tracking', 'common']);

  const { data: detailTransacion, isFetching } = useQuery<
    GetTransactionDetailResponse,
    AxiosError<ErrorResponse>
  >({
    queryKey: ['transaction-detail', transactionData?.qrCode],
    queryFn: () =>
      getTransactionDetail({ wasteBagQrCode: transactionData?.qrCode }),
    enabled: Boolean(transactionData?.qrCode),
  });

  return (
    <Dialog open={open} onOpenChange={onClose} size="xl">
      <DialogHeader className="ui-text-center ui-w-full ui-text-xl ui-py-2">
        <p className="text-gray-500">{t('tracking:modal.title')}</p>
      </DialogHeader>
      <DialogContent className="ui-flex ui-flex-col ui-text-center ui-py-6 ui-border-y">
        <div className="ui-grid ui-grid-cols-3 ui-gap-4 ui-text-left ui-mb-4">
          <div>
            <p className="ui-text-sm ui-text-gray-500">
              {t('tracking:modal.info.transaction_code')}
            </p>
            <p className="ui-font-semibold ui-text-base ui-text-gray-900">
              {transactionData?.qrCode}
            </p>
          </div>
          <div>
            <p className="ui-text-sm ui-text-gray-500">
              {t('tracking:modal.info.healthcare_facility')}
            </p>
            <p className="ui-font-semibold ui-text-base ui-text-gray-900">
              {transactionData?.healthcareFacilityName}
            </p>
          </div>
          <div>
            <p className="ui-text-sm ui-text-gray-500">
              {t('tracking:modal.info.waste_characteristic')}
            </p>
            <p className="ui-font-semibold ui-text-base ui-text-gray-900">
              {transactionData?.wasteCharacteristicsName}
            </p>
          </div>
        </div>
        <WasteTrackingDetailTable
          detailTransacion={detailTransacion?.data}
          isLoading={isFetching}
        />
      </DialogContent>
      <DialogFooter className="ui-flex ui-w-full ui-items-center ui-py-6">
        <Button
          id="btn-back"
          type="button"
          variant="outline"
          onClick={() => onClose()}
          className="ui-w-full"
        >
          {t('common:close')}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

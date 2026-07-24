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
import HomeHFDetailTable from '../table/HomeHFDetailTable';

type HomeHFDetailModalProps = {
  open: boolean;
  onClose: () => void;
  transactionData: TWasteTransaction | null;
};
export const HomeHFDetailModal: React.FC<HomeHFDetailModalProps> = ({
  open,
  onClose,
  transactionData,
}) => {
  const { t, i18n } = useTranslation(['common', 'home']);

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
      <DialogHeader className="ui-text-center ui-w-full ui-text-lg ui-py-2">
        {t('home:home_hf.modal.title')}
      </DialogHeader>
      <DialogContent className="ui-flex ui-flex-col ui-text-center ui-py-6 ui-border-y">
        <div className="ui-grid ui-grid-cols-3 ui-gap-x-6 ui-gap-y-4 ui-text-left ui-mb-4">
          <div>
            <p className="ui-text-sm ui-text-gray-500">
              {t('home:home_hf.column.waste_code')}
            </p>
            <p className="ui-text-base ui-text-gray-900">
              {transactionData?.qrCode}
            </p>
          </div>

          <div className="ui-col-span-2">
            <p className="ui-text-sm ui-text-gray-500">
              {t('home:home_hf.column.waste_hierarchy')}
            </p>
            <p className="ui-text-base ui-text-gray-900">
              {i18n.language === 'id'
                ? transactionData?.wasteTypeName
                : transactionData?.wasteTypeNameEn}{' '}
              /{' '}
              {i18n.language === 'id'
                ? transactionData?.wasteGroupName
                : transactionData?.wasteGroupNameEn}{' '}
              /{' '}
              {i18n.language === 'id'
                ? transactionData?.wasteCharacteristicsName
                : transactionData?.wasteCharacteristicsNameEn}
            </p>
          </div>
        </div>
        <HomeHFDetailTable
          isLoading={isFetching}
          detailTransaction={detailTransacion?.data || []}
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

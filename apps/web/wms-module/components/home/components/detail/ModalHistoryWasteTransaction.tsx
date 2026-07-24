'use client';
import { TDetailTransactionWaste } from '@/types/homepage';
import { useFormatWasteBagWeight } from '@/utils/hooks/useFormatWeight';
import { Button } from '@repo/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '@repo/ui/components/dialog';
import dayjs from 'dayjs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistoryTransactionWasteTable } from '../../hooks/useHistoryTransactionWasteTable';
import HomeHistoryWasteTransactionTable from '../table/HomeHistoryWasteTransactionTable';

type ModalHistoryWasteTransactionProps = {
  open: boolean;
  onClose: () => void;
  transactionData: TDetailTransactionWaste | null;
};
export const ModalHistoryWasteTransaction: React.FC<
  ModalHistoryWasteTransactionProps
> = ({ open, onClose, transactionData }) => {
  const { t } = useTranslation(['common', 'home']);
  const { formatWasteBagWeight, unit } = useFormatWasteBagWeight();

  const {
    historyTransactionWaste,
    isHistoryTransactionWasteFetching: isLoading,
  } = useHistoryTransactionWasteTable({
    groupId: Number(transactionData?.groupId),
    treatmentType: transactionData?.treatmentType,
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
              {transactionData?.wasteGroupNumber ?? '-'}
            </p>
          </div>

          <div className="ui-col-span-2">
            <p className="ui-text-sm ui-text-gray-500">
              {t('home:home_hf.column.waste_hierarchy')}
            </p>
            <p className="ui-text-base ui-text-gray-900">
              {transactionData?.wasteTypeName} /{' '}
              {transactionData?.wasteGroupName} /{' '}
              {transactionData?.wasteCharacteristicsName}
            </p>
          </div>
          <div>
            <p className="ui-text-sm ui-text-gray-500">
              {t('home:home_hf.column.waste_source')}
            </p>
            <p className="ui-text-base ui-text-gray-900">
              {transactionData?.wasteSource ?? '-'}
            </p>
          </div>
          <div>
            <p className="ui-text-sm ui-text-gray-500">
              {t('home:home_hf.column.waste_date')}
            </p>
            <p className="ui-text-base ui-text-gray-900">
              {transactionData?.wasteInDate &&
                dayjs(transactionData.wasteInDate).format('DD/MM/YYYY')}
            </p>
          </div>
          <div>
            <p className="ui-text-sm ui-text-gray-500">
              {t('home:home_hf.column.weight', {
                unit,
              })}
            </p>
            <p className="ui-text-base ui-text-gray-900">
              {formatWasteBagWeight(transactionData?.totalWeightInKgs ?? 0)}
            </p>
          </div>
        </div>
        <HomeHistoryWasteTransactionTable
          isLoading={isLoading}
          historyTransactionWaste={historyTransactionWaste?.data.data}
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

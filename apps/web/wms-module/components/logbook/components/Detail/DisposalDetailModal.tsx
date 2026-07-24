'use client';
import { getWasteGroup } from '@/services/waste-group';
import { ErrorResponse } from '@/types/common';
import { TLogbook } from '@/types/logbook';
import { GetWasteGroupResponse } from '@/types/waste-group';
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
import DisposalDetailTable from './DisposalDetailTable';

type DisposalDetailModalProps = {
  open: boolean;
  onClose: () => void;
  disposalData: TLogbook | null;
};
export const DisposalDetailModal: React.FC<DisposalDetailModalProps> = ({
  open,
  onClose,
  disposalData,
}) => {
  const { t } = useTranslation(['logbook', 'common']);

  const { data: wasteGroupDetail, isFetching } = useQuery<
    GetWasteGroupResponse,
    AxiosError<ErrorResponse>
  >({
    queryKey: ['waste-group-detail', disposalData?.wasteGroupId],
    queryFn: () =>
      getWasteGroup(Number(disposalData?.wasteGroupId), {
        page: 1,
        limit: 500,
      }),
    enabled: Boolean(disposalData?.wasteGroupId),
  });

  return (
    <Dialog open={open} onOpenChange={onClose} size="xl">
      <DialogHeader className="ui-text-center ui-w-full ui-text-lg ui-py-2">
        {t('logbook:modal.title')} {disposalData?.wasteGroupNumber}
      </DialogHeader>
      <DialogContent className="ui-flex ui-flex-col ui-text-center ui-py-6 ui-border-y">
        <DisposalDetailTable
          detailWasteGroup={wasteGroupDetail?.data?.data}
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

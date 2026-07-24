'use client';
import DisposalDetailTable from '@/components/logbook/components/Detail/DisposalDetailTable';
import { getWasteGroup } from '@/services/waste-group';
import { ErrorResponse } from '@/types/common';
import { TWasteGroupTP } from '@/types/homepage';
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

type HomeTPDetailModalProps = {
  open: boolean;
  onClose: () => void;
  wasteGroupData: TWasteGroupTP | null;
};
export const HomeTPDetailModal: React.FC<HomeTPDetailModalProps> = ({
  open,
  onClose,
  wasteGroupData,
}) => {
  const { t } = useTranslation(['common', 'home']);

  const { data: wasteGroupDetail, isFetching } = useQuery<
    GetWasteGroupResponse,
    AxiosError<ErrorResponse>
  >({
    queryKey: ['waste-group-detail', wasteGroupData?.wasteGroupId],
    queryFn: () =>
      getWasteGroup(Number(wasteGroupData?.wasteGroupId), {
        page: 1,
        limit: 500,
      }),
    enabled: Boolean(wasteGroupData?.wasteGroupId),
  });

  return (
    <Dialog open={open} onOpenChange={onClose} size="xl">
      <DialogHeader className="ui-text-center ui-w-full ui-text-lg ui-py-2">
        {t('home:home_hf.column.waste_group_number')}{' '}
        {wasteGroupData?.wasteGroupNumber}
      </DialogHeader>
      <DialogContent className="ui-flex ui-flex-col ui-text-center ui-py-6 ui-border-y">
        <DisposalDetailTable
          isLoading={isFetching}
          detailWasteGroup={wasteGroupDetail?.data?.data}
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

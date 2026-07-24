'use client';
import { TWasteCharacteristicSummary } from '@/types/homepage';
import { useFormatWasteBagWeight } from '@/utils/hooks/useFormatWeight';
import { Button } from '@repo/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '@repo/ui/components/dialog';
import { EmptyState } from '@repo/ui/components/empty-state';
import { Spinner } from '@repo/ui/components/spinner';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useWasteCharacteristicsSummary } from '../../hooks/useWasteCharacteristicsSummary';
import { WasteTypeSelectedData } from '../table/HomeSuperadminTable';
import TableWasteCharacteristicsSummary from '../table/TableWasteCharacteristicsSummary';

type ModalDetailWasteProps = {
  open: boolean;
  onClose: () => void;
  wasteDetail: WasteTypeSelectedData;
};

type GroupedData = {
  [key: string]: TWasteCharacteristicSummary[];
};

export const ModalDetailWaste: React.FC<ModalDetailWasteProps> = ({
  open,
  onClose,
  wasteDetail,
}) => {
  const { t } = useTranslation(['common', 'home']);
  const { formatWasteBagWeight, unit } = useFormatWasteBagWeight();
  const {
    summaryWasteCharacteristics,
    isSummaryWasteCharacteristicsFetching: isLoadingWasteCharateristicsSummary,
  } = useWasteCharacteristicsSummary({
    wasteTypeId: wasteDetail.wasteTypeId,
    provinceId: wasteDetail.provinceId,
    regencyId: wasteDetail.regencyId,
    healthcareFacilityId: wasteDetail.healthcareFacilityId,
    startDate: wasteDetail.startDate,
    endDate: wasteDetail.endDate,
  });

  const groupedData = summaryWasteCharacteristics?.data.data.reduce(
    (acc: GroupedData, item: TWasteCharacteristicSummary) => {
      const groupName = item.wasteGroupName;
      if (!acc[groupName]) {
        acc[groupName] = [];
      }
      acc[groupName].push(item);
      return acc;
    },
    {}
  );

  return (
    <Dialog open={open} onOpenChange={onClose} size="xl">
      <DialogHeader className="ui-text-center ui-w-full ui-text-lg ui-py-2">
        Detail
      </DialogHeader>
      <DialogContent className="ui-flex ui-flex-col ui-text-center ui-py-6 ui-border-y">
        <div className="ui-grid ui-grid-cols-3 ui-gap-x-6 ui-gap-y-4 ui-text-left ui-mb-4">
          {wasteDetail.provinceName && (
            <div>
              <p className="ui-text-sm ui-text-gray-500">
                {t('home:home_superadmin.column.province')}
              </p>
              <p className="ui-text-base ui-text-gray-900">
                {wasteDetail.provinceName ?? '-'}
              </p>
            </div>
          )}
          {wasteDetail.regencyName && (
            <div>
              <p className="ui-text-sm ui-text-gray-500">
                {t('home:home_superadmin.column.city')}
              </p>
              <p className="ui-text-base ui-text-gray-900">
                {wasteDetail.regencyName ?? '-'}
              </p>
            </div>
          )}
          {wasteDetail.healthcareName && (
            <div>
              <p className="ui-text-sm ui-text-gray-500">
                {t('home:home_superadmin.column.healthcare_facility')}
              </p>
              <p className="ui-text-base ui-text-gray-900">
                {wasteDetail.healthcareName ?? '-'}
              </p>
            </div>
          )}
          <div>
            <p className="ui-text-sm ui-text-gray-500">
              {t('home:home_superadmin.column.waste_type')}
            </p>
            <p className="ui-text-base ui-text-gray-900">
              {wasteDetail.wasteTypeName ?? '-'}
            </p>
          </div>
          <div>
            <p className="ui-text-sm ui-text-gray-500">
              {t('home:home_superadmin.column.waste_weight', {
                unit,
              })}
            </p>
            <p className="ui-text-base ui-text-gray-900">
              {formatWasteBagWeight(wasteDetail.wasteWeight ?? 0)}
            </p>
          </div>
        </div>

        <div className="ui-text-left ui-flex ui-flex-col ui-gap-3 ui-mt-4">
          {isLoadingWasteCharateristicsSummary && (
            <Spinner className="ui-w-full ui-h-6" />
          )}

          {Object.keys(groupedData || {}).length > 0 ? (
            Object.entries(groupedData || {}).map(([groupName, items]) => (
              <div key={groupName} className="ui-flex ui-flex-col ui-gap-3">
                <p className="ui-font-bold">
                  {t('home:group')}: {groupName}
                </p>

                <TableWasteCharacteristicsSummary
                  isLoading={isLoadingWasteCharateristicsSummary}
                  wasteCharacteristicsSummary={items}
                />
              </div>
            ))
          ) : (
            <div className="ui-border ui-rounded-md">
              <EmptyState
                title={t('common:message.empty.title')}
                description={t('common:message.empty.description')}
                withIcon
              />
            </div>
          )}
        </div>
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

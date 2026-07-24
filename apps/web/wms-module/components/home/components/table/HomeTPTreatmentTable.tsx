import { CommonType } from '@/types/common';
import { DataTable } from '@repo/ui/components/data-table';
import { useTranslation } from 'react-i18next';

import { TWasteGroupTP } from '@/types/homepage';
import { useState } from 'react';
import { ColumnsHomeTPTransport } from '../../constants/tableTP';
import { useHomeTPTable } from '../../hooks/useHomeTPTable';
import { HomeTPDetailModal } from '../detail/HomeTPDetailModal';

type TableProps = CommonType & {
  activeTab: string;
  isLoading?: boolean;
  size?: number;
  page?: number;
};

export default function HomeTPTreatmentTable({
  activeTab,
  isLoading,
  size = 10,
  page = 1,
}: TableProps) {
  const { t } = useTranslation(['common', 'home']);
  const { wasteGroupDataSource } = useHomeTPTable(activeTab);
  const [isTPTreatmentDetailModalOpen, setIsTPTreatmentDetailModalOpen] =
    useState(false);
  const [selectedWasteGroupData, setSelectedWasteGroupData] =
    useState<TWasteGroupTP | null>(null);

  const handleOpenTPTreatmentDetail = (data: TWasteGroupTP) => {
    setSelectedWasteGroupData(data);
    setIsTPTreatmentDetailModalOpen(true);
  };
  return (
    <div className="ui-space-y-6">
      <DataTable
        data={wasteGroupDataSource?.data?.data}
        columns={ColumnsHomeTPTransport(t, {
          page: page ?? 1,
          size: size ?? 10,
          handleHomeTPDetail: (data) => handleOpenTPTreatmentDetail(data),
          sectionTab: activeTab,
        })}
        isLoading={isLoading}
      />
      {isTPTreatmentDetailModalOpen && selectedWasteGroupData && (
        <HomeTPDetailModal
          open={true}
          onClose={() => setIsTPTreatmentDetailModalOpen(false)}
          wasteGroupData={selectedWasteGroupData}
        />
      )}
    </div>
  );
}

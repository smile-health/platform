'use client';

import Meta from '@/components/layouts/Meta';
import Container from '@/components/layouts/PageContainer';
import { Alert } from '@repo/ui/components/alert';
import { Button } from '@repo/ui/components/button';
import {
  FilterFormBody,
  FilterFormRoot,
  FilterSubmitButton,
} from '@repo/ui/components/filter';
import Information from '@repo/ui/components/icons/Information';
import Plus from '@repo/ui/components/icons/Plus';
import Reload from '@repo/ui/components/icons/Reload';
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '@repo/ui/components/pagination';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { printQRCodeLabel } from '@/services/print-label';
import { TPrintLabel } from '@/types/print-label';
import { isSanitarian, loggedAsAdmin } from '@/utils/getUserRole';
import { usePermission } from '@/utils/permission';
import { toast } from '@repo/ui/components/toast';
import PrintLabelTable from './components/PrintLabelTable';
import { openQRPrintWindow } from './components/QRCode/openQRPrintWindow';
import { PrintConfirmationModal } from './components/QRCode/PrintConfirmationDialog';
import { MAX_PRINT_CHARACTERISTICS } from './constants/table';
import { usePrintLabelTable } from './hooks/usePrintLabelTable';

const PrintLabelListPage: React.FC = () => {
  usePermission('print-label-view');
  const { t, i18n } = useTranslation(['common', 'printLabel']);
  const locale = i18n.language;
  const route = useRouter();

  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [selectedRows, setSelectedRows] = useState<TPrintLabel[]>([]);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isLoadingPrint, setIsLoadingPrint] = useState(false);

  const {
    filter,
    handleChangePage: handleChangePagePrintLabel,
    handleChangePaginate: handleChangePaginatePrintLabel,
    isLoading: isLoadingPrintLabel,
    printLabelDataSource,
    pagination: paginationPrintLabel,
    setPagination,
  } = usePrintLabelTable();

  // Count the total selected rows across all pages (rowSelection persists ids
  // across pages, unlike selectedRows which only reflects the current page).
  const selectedCount = Object.values(rowSelection).filter(Boolean).length;
  const isOverLimit = selectedCount > MAX_PRINT_CHARACTERISTICS;

  const handleOpenPrintModal = () => {
    setIsPrintModalOpen(true);
  };

  const handlePrintQRCode = async () => {
    if (isOverLimit) return;

    try {
      setIsLoadingPrint(true);
      const payload = selectedRows.map((row) => ({
        healthcareFacilityId: row.healthcareFacilityId ?? 0,
        wasteSourceId: row.wasteSourceId ?? 0,
        wasteClassificationId: row.wasteClassificationId ?? 0,
        labelCount: row.labelCount ?? 0,
      }));

      const result = await printQRCodeLabel(payload);

      if (result?.status === 'success') {
        await openQRPrintWindow(result.data);
      }
    } catch (error) {
      console.error(error);
      toast.danger({ description: 'Failed to print label QR Code' });
    } finally {
      setIsPrintModalOpen(false);
      setIsLoadingPrint(false);
    }
  };

  return (
    <Container
      title={t('printLabel:list.list')}
      hideTabs={false}
      withLayout={true}
    >
      <Meta title={`WMS | Print Label`} />

      <div className="mt-6">
        <div className="ui-my-6 ui-flex ui-flex-col ui-gap-4">
          <div className="ui-flex ui-justify-between ui-items-center">
            <h5 className="ui-font-bold ui-text-xl">
              {t('printLabel:list.list')}
            </h5>
            {!loggedAsAdmin() && (
              <div className="ui-flex ui-gap-2">
                <Button
                  color="info"
                  onClick={handleOpenPrintModal}
                  disabled={selectedCount === 0 || isOverLimit}
                >
                  {t('printLabel:button.print')}
                </Button>
                {!isSanitarian() && (
                  <Button
                    leftIcon={<Plus className="ui-size-5" />}
                    loading={false}
                    disabled={false}
                    onClick={() => route.push(`/${locale}/print-label/create`)}
                  >
                    {t('printLabel:list.button.add')}
                  </Button>
                )}
              </div>
            )}
          </div>
          <div className="ui-flex ui-justify-start">
            <Button
              leftIcon={<Information className="ui-size-5" />}
              loading={false}
              disabled={false}
              color="info"
              onClick={() => route.push(`/${locale}/waste-classification`)}
            >
              {t('printLabel:button.explain_waste_classification')}
            </Button>
          </div>
        </div>

        {/* Filter Form */}
        <FilterFormRoot onSubmit={filter.handleSubmit}>
          <FilterFormBody className="ui-flex ui-gap-2 ui-items-center">
            {filter.renderField()}
            <div className="ui-flex ui-gap-2 ui-mt-5">
              <Button
                variant="subtle"
                type="button"
                leftIcon={<Reload className="ui-size-5" />}
                onClick={filter.reset}
              >
                {t('common:reset')}
              </Button>
              <FilterSubmitButton
                variant="outline"
                className="ui-w-48"
                text={t('common:search')}
                onClick={() => setPagination({ page: 1 })}
              />
            </div>
          </FilterFormBody>

          {filter.renderActiveFilter()}
        </FilterFormRoot>

        <div className="ui-space-y-6 ui-my-5 ui-rounded">
          {isOverLimit && (
            <Alert type="warning" withIcon>
              {t('printLabel:message.max_characteristics', {
                max: MAX_PRINT_CHARACTERISTICS,
              })}
            </Alert>
          )}
          <PrintLabelTable
            isLoading={isLoadingPrintLabel}
            size={paginationPrintLabel.paginate}
            page={paginationPrintLabel.page}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
            onSelectionChange={setSelectedRows}
          />
          <PaginationContainer>
            <PaginationSelectLimit
              size={paginationPrintLabel.paginate}
              onChange={(paginate) => handleChangePaginatePrintLabel(paginate)}
              perPagesOptions={printLabelDataSource?.list_pagination}
            />
            <PaginationInfo
              size={paginationPrintLabel.paginate}
              currentPage={paginationPrintLabel.page}
              total={printLabelDataSource?.data.pagination.total}
            />
            <Pagination
              totalPages={printLabelDataSource?.data.pagination.pages ?? 0}
              currentPage={paginationPrintLabel.page}
              onPageChange={(page) => handleChangePagePrintLabel(page)}
            />
          </PaginationContainer>
        </div>
      </div>
      <PrintConfirmationModal
        open={isPrintModalOpen}
        isLoading={isLoadingPrint}
        onClose={() => setIsPrintModalOpen(false)}
        onPrint={handlePrintQRCode}
      />
    </Container>
  );
};

export default PrintLabelListPage;

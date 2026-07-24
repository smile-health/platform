'use client';

import Meta from '@/components/layouts/Meta';
import Container from '@/components/layouts/PageContainer';
import { Button } from '@repo/ui/components/button';
import {
  FilterFormBody,
  FilterFormFooter,
  FilterFormRoot,
  FilterSubmitButton,
} from '@repo/ui/components/filter';
import Export from '@repo/ui/components/icons/Export';
import Reload from '@repo/ui/components/icons/Reload';
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '@repo/ui/components/pagination';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { useFormatWasteBagWeight } from '@/utils/hooks/useFormatWeight';
import { usePermission } from '@/utils/permission';
import { SummaryCard } from '../SummaryCard';
import TransactionTable from './components/TransactionTable';
import { useDownloadLogbook } from './hooks/useDownloadLogbook';
import { useTransactionTable } from './hooks/useTransactionTable';
import TooltipModal from '../TooltipModal';

const TransactionListPage: React.FC = () => {
  usePermission('transaction-view');
  const { t } = useTranslation(['common', 'transaction']);
  const { formatWasteBagWeight, unit } = useFormatWasteBagWeight();

  const [openInformation, setOpenInformation] = React.useState(false);

  const {
    filter,
    handleChangePage: handleChangePageTransaction,
    handleChangePaginate: handleChangePaginateTransaction,
    isLoading: isLoadingTransaction,
    transactionDataSource,
    pagination: paginationTransaction,
    setPagination,
  } = useTransactionTable();

  const { downloadLogbook, isLoading: isDownloading } = useDownloadLogbook();

  const handleExport = () => {
    const {
      dateRange,
      healthcareId,
      wasteTypeId,
      wasteGroupId,
      wasteCharacteristicsId,
    } = filter.query;
    downloadLogbook({
      startDate: dateRange?.start ?? '',
      endDate: dateRange?.end ?? '',
      healthcareFacilityId: healthcareId?.value ?? '',
      wasteTypeId: wasteTypeId?.value ?? '',
      wasteGroupId: wasteGroupId?.value ?? '',
      wasteCharacteristicsId: wasteCharacteristicsId?.value ?? '',
    });
  };

  return (
    <Container
      title={t('transaction:list.list')}
      hideTabs={false}
      withLayout={true}
      showInformation
      onClickInformation={() => setOpenInformation(true)}
    >
      <Meta title={`WMS | Transaction`} />
      <TooltipModal
        open={openInformation}
        setOpen={setOpenInformation}
        title={t('transaction:information.title')}
        description={t('transaction:information.description')}
      >
        <p className="mt-4">
          <Trans
            t={t}
            i18nKey="transaction:information.sub_description"
            components={{
              bold: <strong className="font-bold" />,
            }}
          />
        </p>
      </TooltipModal>
      <div className="mt-6">
        <FilterFormRoot onSubmit={filter.handleSubmit}>
          <FilterFormBody className="ui-grid ui-grid-cols-4 ui-gap-4">
            {filter.renderField()}
          </FilterFormBody>
          <FilterFormFooter>
            <div className="ui-flex ui-gap-2" />
            <div className="ui-flex ui-space-x-3 ui-items-center">
              <Button
                variant="subtle"
                type="button"
                leftIcon={<Export className="ui-size-5" />}
                onClick={handleExport}
                disabled={
                  !filter.query.healthcareId || filter.query.healthcareId === ''
                }
                loading={isDownloading}
              >
                {t('common:export')}
              </Button>
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
          </FilterFormFooter>

          {filter.renderActiveFilter()}
        </FilterFormRoot>
        <div className="ui-grid ui-grid-cols-3 ui-gap-4 ui-my-5">
          <SummaryCard
            label={t('transaction:list.card.total_waste_in')}
            value={`${formatWasteBagWeight(
              transactionDataSource?.data.totals.weightInKgs ?? 0
            )} ${unit}`}
            description={`(${
              transactionDataSource?.data.totals.wasteInBags
            } ${t('transaction:list.bags')})`}
          />
          <SummaryCard
            label={t('transaction:list.card.total_waste_out')}
            value={`${formatWasteBagWeight(
              transactionDataSource?.data.totals.weightOutKgs ?? 0
            )} ${unit}`}
            description={`(${
              transactionDataSource?.data.totals.wasteOutBags
            } ${t('transaction:list.bags')})`}
          />
          <SummaryCard
            label={t(
              'transaction:list.card.remaining_waste_at_collection_place'
            )}
            value={`${formatWasteBagWeight(
              parseFloat(
                transactionDataSource?.data?.totals?.weightInKgs || '0'
              ) -
                parseFloat(
                  transactionDataSource?.data?.totals?.weightOutKgs || '0'
                )
            )} ${unit}`}
            description={`(${
              (transactionDataSource?.data?.totals?.wasteInBags ?? 0) -
              (transactionDataSource?.data?.totals?.wasteOutBags ?? 0)
            } ${t('transaction:list.bags')})`}
          />
        </div>
        <div className="ui-space-y-6 ui-my-5 ui-rounded">
          <TransactionTable
            isLoading={isLoadingTransaction}
            size={paginationTransaction.paginate}
            page={paginationTransaction.page}
          />
          <PaginationContainer>
            <PaginationSelectLimit
              size={paginationTransaction.paginate}
              onChange={(paginate) => handleChangePaginateTransaction(paginate)}
              perPagesOptions={transactionDataSource?.list_pagination}
            />
            <PaginationInfo
              size={paginationTransaction.paginate}
              currentPage={paginationTransaction.page}
              total={transactionDataSource?.data?.pagination?.total}
            />
            <Pagination
              totalPages={transactionDataSource?.data?.pagination?.pages ?? 0}
              currentPage={paginationTransaction.page}
              onPageChange={(page) => handleChangePageTransaction(page)}
            />
          </PaginationContainer>
        </div>
      </div>
    </Container>
  );
};

export default TransactionListPage;

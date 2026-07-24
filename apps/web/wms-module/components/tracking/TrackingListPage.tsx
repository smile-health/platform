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
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { usePermission } from '@/utils/permission';
import WasteBagTrackingTable from './components/WasteTrackingBagTable';
import WasteCharacteristicsTable from './components/WasteTrackingCharacteristicsTable';
import WasteTrackingSourceTable from './components/WasteTrackingSourceTable';
import { useDownloadTracking } from './hooks/useDownloadTracking';
import { useWasteTrackingTable } from './hooks/useWasteTrackingTable';
import TooltipModal from '../TooltipModal';
import { ENTITY_TYPE } from '@/types/entity';
import { getUserStorage } from '@/utils/storage/user';
import { TrackingListContext } from './utils/tracking-list.context';
import { loggedAsAdmin } from '@/utils/getUserRole';

const TrackingListPage: React.FC = () => {
  usePermission('tracking-view');
  const { t } = useTranslation(['common', 'tracking']);
  const user = getUserStorage();
  const [openInformation, setOpenInformation] = useState(false);

  const {
    downloadTrackingCharacteristics,
    isLoadingDownloadTrackingCharacteristics,
    downloadTrackingSource,
    isLoadingDownloadTrackingSource,
    downloadTrackingWasteBag,
    isLoadingDownloadTrackingWasteBag,
    downloadTrackingAll,
    isLoadingDownloadTrackingAll,
  } = useDownloadTracking();

  const isHealthBureaucrat =
    user &&
    [ENTITY_TYPE.PROVINCE, ENTITY_TYPE.REGENCY, ENTITY_TYPE.VENDOR].includes(
      Number(user?.entity?.type)
    ) &&
    loggedAsAdmin();

  const trackingListContextValue = useMemo(
    () => ({
      isHealthBureaucrat: isHealthBureaucrat ?? undefined,
    }),
    [isHealthBureaucrat]
  );

  const {
    filter,
    renderFilterCharacteristics,
    renderFilterBag,
    trackingCharacteristicsDataSource,
    isLoadingTrackingCharacteristics,
    trackingBagDataSource,
    isLoadingTrackingBag,
    trackingWasteSourceDataSource,
    isLoadingTrackingWasteSource,
    // pagination waste source
    paginationWasteSource,
    handleChangePageWasteSource,
    handleChangePaginateWasteSource,
    // Pagination Characteristics
    paginationTrackingCharacteristics,
    handleChangePageCharacteristics,
    handleChangePaginateCharacteristics,
    // Pagination Bag
    paginationTrackingBag,
    handleChangePageBag,
    handleChangePaginateBag,
    handleSearchFilter,
  } = useWasteTrackingTable(isHealthBureaucrat as boolean);

  if (!user) return null;

  const getExportParams = () => {
    const { dateRange, healthcareId, provinceId, cityId } = filter.query;
    return {
      startDate: dateRange?.start ?? '',
      endDate: dateRange?.end ?? '',
      healthcareFacilityId: healthcareId?.value ?? '',
      provinceId: provinceId?.value ?? '',
      regencyId: cityId?.value ?? '',
    };
  };

  const handleExportTrackingCharacteristics = () =>
    downloadTrackingCharacteristics(getExportParams());
  const handleExportTrackingSource = () =>
    downloadTrackingSource(getExportParams());
  const handleExportTrackingWasteBag = () =>
    downloadTrackingWasteBag(getExportParams());
  const handleExportTrackingAll = () => downloadTrackingAll(getExportParams());

  return (
    <TrackingListContext.Provider value={trackingListContextValue}>
      <Container
        title={t('tracking:list.list')}
        hideTabs={false}
        withLayout={true}
        showInformation
        onClickInformation={() => setOpenInformation(true)}
      >
        <Meta title={`WMS | Tracking`} />
        <TooltipModal
          open={openInformation}
          setOpen={setOpenInformation}
          title={t('tracking:information.title')}
          description={t('tracking:information.description')}
        />

        <div className="mt-6">
          {/* Filter Form Characteristics*/}
          <FilterFormRoot onSubmit={filter.handleSubmit}>
            <FilterFormBody className="ui-grid ui-grid-cols-4 ui-gap-4 ">
              {renderFilterCharacteristics()}
            </FilterFormBody>
            <FilterFormFooter>
              <div className="ui-flex ui-gap-2" />
              <div className="ui-flex ui-space-x-3 ui-items-center">
                <Button
                  variant="subtle"
                  type="button"
                  loading={isLoadingDownloadTrackingAll}
                  onClick={() => handleExportTrackingAll()}
                  leftIcon={<Export className="ui-size-5" />}
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
                  onClick={() => handleChangePageCharacteristics(1)}
                />
              </div>
            </FilterFormFooter>

            {filter.renderActiveFilter()}
          </FilterFormRoot>
          {!isHealthBureaucrat && (
            <>
              {/* Recap per Waste Source */}
              <div className="ui-space-y-6 ui-my-5 ui-rounded">
                <div className="ui-flex ui-items-center ui-justify-between">
                  <h5 className="ui-font-bold ui-text-md">
                    {t('tracking:list.waste_source')}
                  </h5>
                  <Button
                    variant="subtle"
                    type="button"
                    leftIcon={<Export className="ui-size-5" />}
                    onClick={() => handleExportTrackingSource()}
                    loading={isLoadingDownloadTrackingSource}
                  >
                    {t('common:export') + ' ' + t('tracking:list.waste_source')}
                  </Button>
                </div>
                <WasteTrackingSourceTable
                  isLoading={isLoadingTrackingWasteSource}
                  trackingWasteSourceDataSource={
                    trackingWasteSourceDataSource?.data?.data
                  }
                />
                <PaginationContainer>
                  <PaginationSelectLimit
                    size={paginationWasteSource.paginateWasteSource}
                    onChange={handleChangePaginateWasteSource}
                    perPagesOptions={
                      trackingWasteSourceDataSource?.list_pagination
                    }
                  />
                  <PaginationInfo
                    size={paginationWasteSource.paginateWasteSource}
                    currentPage={paginationWasteSource.pageWasteSource}
                    total={
                      trackingWasteSourceDataSource?.data?.pagination?.total
                    }
                  />
                  <Pagination
                    totalPages={
                      trackingWasteSourceDataSource?.data?.pagination?.pages ??
                      0
                    }
                    currentPage={paginationWasteSource.pageWasteSource}
                    onPageChange={handleChangePageWasteSource}
                  />
                </PaginationContainer>
              </div>
            </>
          )}

          {/* Recap per Waste Characteristics */}
          <div className="ui-space-y-6 ui-my-5 ui-rounded">
            <div className="ui-flex ui-items-center ui-justify-between">
              <h5 className="ui-font-bold ui-text-md">
                {t('tracking:list.waste_characteristic')}
              </h5>
              {!isHealthBureaucrat && (
                <Button
                  variant="subtle"
                  type="button"
                  onClick={() => handleExportTrackingCharacteristics()}
                  loading={isLoadingDownloadTrackingCharacteristics}
                  leftIcon={<Export className="ui-size-5" />}
                >
                  {t('common:export') +
                    ' ' +
                    t('tracking:list.waste_characteristic')}
                </Button>
              )}
            </div>
            <WasteCharacteristicsTable
              isLoading={isLoadingTrackingCharacteristics}
            />
            <PaginationContainer>
              <PaginationSelectLimit
                size={paginationTrackingCharacteristics.paginate}
                onChange={handleChangePaginateCharacteristics}
                perPagesOptions={
                  trackingCharacteristicsDataSource?.list_pagination
                }
              />
              <PaginationInfo
                size={paginationTrackingCharacteristics.paginate}
                currentPage={paginationTrackingCharacteristics.page}
                total={
                  trackingCharacteristicsDataSource?.data?.pagination?.total
                }
              />
              <Pagination
                totalPages={
                  trackingCharacteristicsDataSource?.data?.pagination?.pages ??
                  0
                }
                currentPage={paginationTrackingCharacteristics.page}
                onPageChange={handleChangePageCharacteristics}
              />
            </PaginationContainer>
          </div>

          {!isHealthBureaucrat && (
            <>
              {/* Filter Form Bag */}
              <FilterFormRoot onSubmit={() => {}}>
                <FilterFormBody className="ui-flex ui-gap-2 ui-items-center">
                  {renderFilterBag()}
                  <div className="ui-flex ui-gap-2 ui-mt-5">
                    <Button
                      variant="subtle"
                      type="button"
                      className="ui-whitespace-nowrap !ui-mx-4"
                      leftIcon={<Export className="ui-size-5" />}
                      onClick={() => handleExportTrackingWasteBag()}
                      loading={isLoadingDownloadTrackingWasteBag}
                    >
                      {t('common:export') + ' ' + t('tracking:list.waste_bag')}
                    </Button>
                    <Button
                      variant="subtle"
                      type="button"
                      leftIcon={<Reload className="ui-size-5" />}
                      onClick={() => {
                        filter.setValue('search', '');
                        handleSearchFilter();
                      }}
                    >
                      {t('common:reset')}
                    </Button>
                    <Button
                      variant="outline"
                      type="button"
                      className="ui-w-48"
                      onClick={handleSearchFilter}
                    >
                      {t('common:search')}
                    </Button>
                  </div>
                </FilterFormBody>

                {filter.renderActiveFilter()}
              </FilterFormRoot>
              {/* Recap per Waste Bag */}
              <div className="ui-space-y-6 ui-my-5 ui-rounded">
                <h5 className="ui-font-bold ui-text-md">
                  {t('tracking:list.waste_bag')}
                </h5>
                <WasteBagTrackingTable
                  isLoading={isLoadingTrackingBag}
                  size={paginationTrackingBag.paginateTrackingPage}
                  page={paginationTrackingBag.pageTrackingPage}
                />
                <PaginationContainer>
                  <PaginationSelectLimit
                    size={paginationTrackingBag.paginateTrackingPage}
                    onChange={handleChangePaginateBag}
                    perPagesOptions={trackingBagDataSource?.list_pagination}
                  />
                  <PaginationInfo
                    size={paginationTrackingBag.paginateTrackingPage}
                    currentPage={paginationTrackingBag.pageTrackingPage}
                    total={trackingBagDataSource?.data?.pagination?.total}
                  />
                  <Pagination
                    totalPages={
                      trackingBagDataSource?.data?.pagination?.pages ?? 0
                    }
                    currentPage={paginationTrackingBag.pageTrackingPage}
                    onPageChange={handleChangePageBag}
                  />
                </PaginationContainer>
              </div>
            </>
          )}
        </div>
      </Container>
    </TrackingListContext.Provider>
  );
};

export default TrackingListPage;

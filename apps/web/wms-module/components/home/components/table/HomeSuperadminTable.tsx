import { CommonType } from '@/types/common';
import { TDetailTransactionWaste } from '@/types/homepage';
import { parseDateTime } from '@/utils/date';
import { useFormatWasteBagWeight } from '@/utils/hooks/useFormatWeight';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { Button } from '@repo/ui/components/button';
import { EmptyState } from '@repo/ui/components/empty-state';
import { Spinner } from '@repo/ui/components/spinner';
import {
  Table,
  TableEmpty,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@repo/ui/components/table';
import { useState } from 'react';
import { UseFormGetValues, UseFormSetValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useHomeSuperadminTable } from '../../hooks/useHomeSuperadminTable';
import { ModalDetailWaste } from '../detail/ModalDetailWaste';
import { ModalHistoryWasteTransaction } from '../detail/ModalHistoryWasteTransaction';

type HomeSuperadminTableProps = CommonType & {
  size?: number;
  page?: number;
  filter: {
    setValue: UseFormSetValue<Record<string, any>>;
    getValues: UseFormGetValues<Record<string, any>>;
    handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  };
};

export type WasteTypeSelectedData = {
  provinceName: string;
  provinceId: number;
  regencyName?: string;
  regencyId?: number;
  healthcareName?: string;
  healthcareFacilityId?: number;
  wasteTypeName: string;
  wasteTypeId: number;
  wasteWeight: string;
  startDate: string;
  endDate: string;
};

export default function HomeSuperadminTable({
  size = 10,
  page = 1,
  filter,
}: HomeSuperadminTableProps) {
  const { t } = useTranslation(['common', 'home']);
  const { formatWasteBagWeight, unit } = useFormatWasteBagWeight();
  const { t: tCommon } = useTranslation();

  const [viewDetail, setViewDetail] = useState<boolean>(false);
  const [selectedHealtcareId, setSelectedHealthcareId] = useState<number>();
  const [isModalHistoryOpen, setIsModalHistoryOpen] = useState<boolean>(false);
  const [isModalViewDetail, setIsModalViewDetail] = useState<boolean>(false);
  const [selectedTransactionData, setSelectedTransactionData] =
    useState<TDetailTransactionWaste | null>(null);
  const [selectedWaste, setSelectedWaste] = useState<WasteTypeSelectedData>();

  const {
    summaryWasteHierarchy,
    detailTransactionWaste,
    isDetailTransactionFetching: isLoadingTransaction,
    isSummaryWasteHierarchyFetching: isLoadingSummary,
  } = useHomeSuperadminTable({
    healthcareFacilityId: selectedHealtcareId,
  });

  const dataSummary = summaryWasteHierarchy?.data.data;
  const dataTransaction = detailTransactionWaste?.data.data;

  const isEmpty = dataSummary?.length == 0;
  const isTransactionEmpty = dataTransaction?.length == 0;

  const excludedKeys = [
    'provinceId',
    'provinceName',
    'cityId',
    'cityName',
    'healthcareFacilityId',
    'healthcareName',
    'totalWasteBag',
    'totalWeight',
    'wasteTypeId',
  ];

  const wasteKeys =
    dataSummary && dataSummary.length > 0
      ? Object.keys(dataSummary[0]).filter((key) => !excludedKeys.includes(key))
      : [];

  const locationKey =
    dataSummary && dataSummary.length > 0
      ? dataSummary[0].provinceName !== undefined
        ? 'provinceName'
        : dataSummary[0].cityName !== undefined
          ? 'cityName'
          : dataSummary[0].healthcareName !== undefined
            ? 'healthcareName'
            : null
      : null;

  const locationColumnTitle =
    locationKey === 'provinceName'
      ? t('home:home_superadmin.column.province')
      : locationKey === 'cityName'
        ? t('home:home_superadmin.column.city')
        : locationKey === 'healthcareName'
          ? t('home:home_superadmin.column.healthcare_facility')
          : '';

  const grouped: Record<string, string[]> = wasteKeys.reduce(
    (acc: Record<string, string[]>, key) => {
      const [parent, child] = key.split(' | ');
      if (!acc[parent]) acc[parent] = [];
      if (child && child.trim() !== '') {
        acc[parent].push(child);
      }

      return acc;
    },
    {}
  );

  const handleOpenModalHistory = (data: TDetailTransactionWaste) => {
    setSelectedTransactionData(data);
    setIsModalHistoryOpen(true);
  };

  return (
    <div className="ui-space-y-6 ui-mb-4">
      {viewDetail ? (
        <>
          <Button
            leftIcon={<ArrowLeftIcon className="ui-h-5" />}
            variant="subtle"
            onClick={() => {
              setSelectedHealthcareId(undefined);
              setViewDetail(false);
            }}
          >
            {t('common:back')}
          </Button>

          <Table
            rounded
            withBorder
            loading={isLoadingTransaction}
            empty={isTransactionEmpty}
          >
            {!isEmpty && (
              <Thead>
                <Tr>
                  <Th className="ui-sticky ui-left-0 ui-bg-slate-100 ui-font-semibold ui-text-center ui-border-r ui-border-gray-300">
                    No
                  </Th>
                  <Th className="ui-sticky ui-left-0 ui-bg-slate-100 ui-font-semibold ui-text-center ui-border-r ui-border-gray-300">
                    {t(
                      'home:home_superadmin.column_transaction.waste_group_number'
                    )}
                  </Th>
                  <Th className="ui-sticky ui-left-0 ui-bg-slate-100 ui-font-semibold ui-text-center ui-border-r ui-border-gray-300">
                    {t(
                      'home:home_superadmin.column_transaction.waste_transporter'
                    )}
                  </Th>
                  <Th
                    className="ui-sticky ui-left-0 ui-bg-slate-100 ui-font-semibold ui-text-center ui-border-r ui-border-gray-300"
                    rowSpan={2}
                  >
                    {t(
                      'home:home_superadmin.column_transaction.waste_treatment_facilitator'
                    )}
                  </Th>
                  <Th
                    className="ui-sticky ui-left-0 ui-bg-slate-100 ui-font-semibold ui-text-center ui-border-r ui-border-gray-300"
                    rowSpan={2}
                  >
                    {t(
                      'home:home_superadmin.column_transaction.waste_characteristic'
                    )}
                  </Th>
                  <Th
                    className="ui-sticky ui-left-0 ui-bg-slate-100 ui-font-semibold ui-text-center ui-border-r ui-border-gray-300"
                    rowSpan={2}
                  >
                    {t('home:home_superadmin.column_transaction.waste_source')}
                  </Th>
                  <Th
                    className="ui-sticky ui-left-0 ui-bg-slate-100 ui-font-semibold ui-text-center ui-border-r ui-border-gray-300"
                    rowSpan={2}
                  >
                    {t('home:home_superadmin.column_transaction.waste_in_date')}
                  </Th>
                  <Th
                    className="ui-sticky ui-left-0 ui-bg-slate-100 ui-font-semibold ui-text-center ui-border-r ui-border-gray-300"
                    rowSpan={2}
                  >
                    {t('home:home_superadmin.column_transaction.storage_limit')}
                  </Th>
                  <Th
                    className="ui-sticky ui-left-0 ui-bg-slate-100 ui-font-semibold ui-text-center ui-border-r ui-border-gray-300"
                    rowSpan={2}
                  >
                    {t(
                      'home:home_superadmin.column_transaction.last_follow_up'
                    )}
                  </Th>
                  <Th
                    className="ui-sticky ui-left-0 ui-bg-slate-100 ui-font-semibold ui-text-center ui-border-r ui-border-gray-300"
                    rowSpan={2}
                  >
                    {t('home:home_superadmin.column_transaction.waste_weight', {
                      unit,
                    })}
                  </Th>
                  <Th
                    className="ui-sticky ui-left-0 ui-bg-slate-100 ui-font-semibold ui-text-center ui-border-r ui-border-gray-300"
                    rowSpan={2}
                  >
                    {t('home:home_superadmin.column_transaction.action')}
                  </Th>
                </Tr>
              </Thead>
            )}

            <Tbody>
              {isLoadingSummary && (
                <div className="ui-absolute ui-inset-0 ui-flex ui-justify-center">
                  <Spinner />
                </div>
              )}

              {dataTransaction &&
                dataTransaction.map((row, idx) => (
                  <Tr key={idx}>
                    <Td className="ui-border-r ui-border-gray-300">
                      {(page - 1) * size + (idx + 1)}
                    </Td>
                    <Td className="ui-border-r ui-border-gray-300">
                      {row.wasteGroupNumber ?? '-'}
                    </Td>
                    <Td className="ui-border-r ui-border-gray-300">
                      {row.transporterOperatorName ?? '-'}
                    </Td>
                    <Td className="ui-border-r ui-border-gray-300">
                      {row.treatmentOperatorName ?? '-'}
                    </Td>
                    <Td className="ui-border-r ui-border-gray-300">
                      {row.wasteTypeName} / {row.wasteGroupName} /{' '}
                      {row.wasteCharacteristicsName}
                    </Td>
                    <Td className="ui-border-r ui-border-gray-300">
                      {row.wasteSource ?? '-'}
                    </Td>
                    <Td className="ui-border-r ui-border-gray-300">
                      {row.wasteInDate
                        ? parseDateTime(row.wasteInDate, 'DD MMM YYYY')
                        : '-'}
                    </Td>
                    <Td className="ui-border-r ui-border-gray-300">
                      {row.storageDateLimit ?? '-'}
                    </Td>
                    <Td className="ui-border-r ui-border-gray-300">
                      {row.lastFollowUp ?? '-'}
                    </Td>
                    <Td className="ui-border-r ui-border-gray-300">
                      {formatWasteBagWeight(row.totalWeightInKgs ?? 0)}
                    </Td>
                    <Td className="ui-border-r ui-border-gray-300">
                      <p
                        className="ui-text-sm ui-text-green-700 ui-cursor-pointer"
                        onClick={() => handleOpenModalHistory(row)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleOpenModalHistory(row);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        {t('home:home_superadmin.column.view_history')}
                      </p>
                    </Td>
                  </Tr>
                ))}
            </Tbody>
            <TableEmpty>
              <EmptyState
                title={tCommon('message.empty.title')}
                description={tCommon('message.empty.description')}
                withIcon
              />
            </TableEmpty>
          </Table>
        </>
      ) : (
        <Table rounded withBorder loading={isLoadingSummary} empty={isEmpty}>
          {!isEmpty && (
            <Thead>
              <Tr>
                <Th
                  className="ui-sticky ui-left-0 ui-bg-slate-100 ui-font-semibold ui-text-center ui-border-r ui-border-gray-300"
                  rowSpan={2}
                >
                  No
                </Th>
                <Th
                  className="ui-sticky ui-left-0 ui-bg-slate-100 ui-font-semibold ui-text-center ui-border-r ui-border-gray-300"
                  rowSpan={2}
                >
                  {locationColumnTitle}
                </Th>
                <Th
                  className="ui-sticky ui-left-0 ui-bg-slate-100 ui-font-semibold ui-text-center ui-border-r ui-border-gray-300"
                  rowSpan={2}
                >
                  {t('home:home_superadmin.column.total_transaction')}
                </Th>
                {Object.entries(grouped).map(([parent, children]) => (
                  <Th
                    key={parent}
                    className="ui-sticky ui-left-0 ui-bg-slate-100 ui-font-semibold ui-text-center ui-border-r ui-border-gray-300"
                    colSpan={children.length}
                  >
                    {parent.split('_')[1]}
                  </Th>
                ))}
                <Th
                  className="ui-sticky ui-left-0 ui-bg-slate-100 ui-font-semibold ui-text-center ui-border-r ui-border-gray-300"
                  rowSpan={2}
                >
                  {t('home:home_superadmin.column.total_weight', {
                    unit,
                  })}
                </Th>
              </Tr>
              <Tr>
                {/* Second header row (children) */}
                {Object.entries(grouped).map(([parent, children]) =>
                  children.map((child) => (
                    <Th
                      key={parent + child}
                      className="ui-sticky ui-left-0 ui-bg-slate-100 ui-font-semibold ui-text-center ui-border-r ui-border-gray-300"
                    >
                      {child}
                    </Th>
                  ))
                )}
              </Tr>
            </Thead>
          )}

          <Tbody>
            {dataSummary &&
              dataSummary.map((row, idx) => (
                <Tr key={idx}>
                  <Td className="ui-border-r ui-border-gray-300">
                    {(page - 1) * size + (idx + 1)}
                  </Td>
                  <Td className="ui-border-r ui-border-gray-300">
                    {locationKey ? row[locationKey] || '-' : '-'}
                    {/* {locationKey === 'healthcareName' && (
											<p
												className="ui-text-green-700 ui-text-sm ui-cursor-pointer ui-mt-2"
												onClick={() => {
													setSelectedHealthcareId(row.healthcareFacilityId);
													setViewDetail(true);
												}}
											>
												{t(
													'home:home_superadmin.column.view_detail_transaction'
												)}
											</p>
										)} */}
                    {locationKey === 'provinceName' && (
                      <p
                        className="ui-text-green-700 ui-text-sm ui-cursor-pointer ui-mt-2"
                        onClick={() => {
                          filter.setValue('provinceId', {
                            value: row.provinceId,
                            label: row.provinceName,
                          });
                          filter.handleSubmit();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            filter.setValue('provinceId', {
                              value: row.provinceId,
                              label: row.provinceName,
                            });
                            filter.handleSubmit();
                          }
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        {t('home:home_superadmin.column.view_detail_district')}
                      </p>
                    )}
                    {locationKey === 'cityName' && (
                      <p
                        className="ui-text-green-700 ui-text-sm ui-cursor-pointer ui-mt-2"
                        onClick={() => {
                          filter.setValue('regencyId', {
                            value: row.cityId,
                            label: row.cityName,
                          });
                          filter.handleSubmit();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            filter.setValue('regencyId', {
                              value: row.cityId,
                              label: row.cityName,
                            });
                            filter.handleSubmit();
                          }
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        {t(
                          'home:home_superadmin.column.view_detail_healthcare'
                        )}
                      </p>
                    )}
                  </Td>
                  <Td className="ui-border-r ui-border-gray-300">
                    {row.totalWasteBag}
                  </Td>
                  {Object.keys(grouped).map((parent) =>
                    grouped[parent].length > 0 ? (
                      grouped[parent].map((child) => {
                        const key = `${parent} | ${child}`;
                        return (
                          <Td
                            key={key}
                            className="ui-border-r ui-border-gray-300"
                          >
                            {row[key]}
                          </Td>
                        );
                      })
                    ) : (
                      <Td
                        key={parent}
                        className="ui-border-r ui-border-gray-300"
                      >
                        {row[parent]}
                        <p
                          className="ui-text-green-700 ui-text-sm ui-cursor-pointer ui-mt-2"
                          onClick={() => {
                            setSelectedWaste({
                              provinceName: row.provinceName,
                              provinceId: row.provinceId,
                              regencyName: row.cityName,
                              regencyId: row.cityId,
                              healthcareName: row.healthcareName,
                              healthcareFacilityId: row.healthcareFacilityId,
                              wasteTypeName: parent.split('_')[1],
                              wasteTypeId: Number(parent.split('_')[0]),
                              wasteWeight: row[parent],
                              startDate: filter.getValues()?.dateRange.start,
                              endDate: filter.getValues()?.dateRange.end,
                            });
                            setIsModalViewDetail(true);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setSelectedWaste({
                                provinceName: row.provinceName,
                                provinceId: row.provinceId,
                                regencyName: row.cityName,
                                regencyId: row.cityId,
                                healthcareName: row.healthcareName,
                                healthcareFacilityId: row.healthcareFacilityId,
                                wasteTypeName: parent.split('_')[1],
                                wasteTypeId: Number(parent.split('_')[0]),
                                wasteWeight: row[parent],
                                startDate: filter.getValues()?.dateRange.start,
                                endDate: filter.getValues()?.dateRange.end,
                              });
                              setIsModalViewDetail(true);
                            }
                          }}
                          role="button"
                          tabIndex={0}
                        >
                          {t('home:home_superadmin.column.view_detail')}
                        </p>
                      </Td>
                    )
                  )}
                  <Td className="ui-border-r ui-border-gray-300">
                    {formatWasteBagWeight(row.totalWeight)}
                  </Td>
                </Tr>
              ))}
          </Tbody>
          <TableEmpty>
            <EmptyState
              title={tCommon('message.empty.title')}
              description={tCommon('message.empty.description')}
              withIcon
            />
          </TableEmpty>
        </Table>
      )}

      {/* Modal History */}
      {isModalHistoryOpen && selectedTransactionData && (
        <ModalHistoryWasteTransaction
          open={true}
          onClose={() => setIsModalHistoryOpen(false)}
          transactionData={selectedTransactionData}
        />
      )}

      {/* Modal Detail Waste */}
      {isModalViewDetail && selectedWaste && (
        <ModalDetailWaste
          open={true}
          onClose={() => setIsModalViewDetail(false)}
          wasteDetail={selectedWaste}
        />
      )}
    </div>
  );
}

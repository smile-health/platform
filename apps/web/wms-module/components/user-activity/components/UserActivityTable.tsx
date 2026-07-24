import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '@repo/ui/components/pagination';
import {
  Table,
  TableEmpty,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@repo/ui/components/table';
import { Values } from 'nuqs';
import { useTranslation } from 'react-i18next';

import cx from '@/lib/cx';
import { EmptyState } from '@repo/ui/components/empty-state';
import dayjs from 'dayjs';
import useGetEntityTable from '../hooks/useGetEntityTable';
import { transformData } from '../utils/helper';

type Props = Readonly<{
  filter: Values<Record<string, any>>;
}>;

export default function UserActivityTable({ filter }: Props) {
  const {
    t,
    i18n: { language },
  } = useTranslation(['userActivity', 'common']);

  const {
    page,
    paginate,
    totalItem,
    totalPage,
    listPagination,
    handleChangePage,
    handleChangePaginate,
    data: rawData,
    manualScaleData,
    isLoading,
  } = useGetEntityTable(filter);

  // Get start and end dates from filter.period
  const startDate = filter.periode?.start
    ? new Date(filter.periode.start)
    : new Date(dayjs().startOf('month').format('YYYY-MM-DD'));
  const endDate = filter.periode?.end
    ? new Date(filter.periode.end)
    : new Date(dayjs().endOf('month').format('YYYY-MM-DD'));

  // Create array of dates between start and end date
  const dateArray: Date[] = [];
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    dateArray.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Format dates for the API
  const formattedDates = dateArray
    .map((date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    })
    .sort((a, b) => a.localeCompare(b));

  // Transform data if available
  const monitoringData =
    rawData?.length > 0
      ? transformData(rawData, manualScaleData, formattedDates)
      : [];

  // Get month name from the filter period
  const monthName = filter.periode?.start
    ? new Date(filter.periode.start).toLocaleString('id-ID', {
        month: 'long',
        year: 'numeric',
      })
    : new Date().toLocaleString('id-ID', {
        month: 'long',
        year: 'numeric',
      });

  return (
    <div className="ui-relative ui-space-y-6">
      <div className="ui-overflow-x-auto">
        <Table
          loading={isLoading}
          withColumnBorders={true}
          withBorder={true}
          rounded={true}
          empty={monitoringData.length === 0}
        >
          <Thead>
            <Tr>
              <Th
                rowSpan={2}
                className="ui-px-4 ui-py-1 ui-bg-gray-100 ui-text-center ui-text-sm ui-border-b ui-border-gray-300 ui-font-semibold ui-sticky ui-left-0 ui-z-5"
              >
                {t('column.no')}
              </Th>
              <Th
                rowSpan={2}
                className="ui-px-10 ui-py-1 left-[51.5px] ui-bg-gray-100 ui-text-center ui-text-sm ui-border-b ui-border-gray-300 ui-font-semibold ui-sticky ui-z-5"
              >
                {t('column.healthcare_facility')}
              </Th>
              <Th
                rowSpan={2}
                className={cx(
                  'ui-px-8 ui-py-1 ui-bg-gray-100 ui-text-center ui-text-sm ui-border-b ui-border-gray-300 ui-font-semibold ui-sticky ui-z-5',
                  {
                    'left-[202px]': language === 'en',
                    'left-[197px]': language === 'id',
                  }
                )}
              >
                {t('column.province')}
              </Th>
              <Th
                rowSpan={2}
                className={cx(
                  'ui-py-1 ui-bg-gray-100 ui-text-center ui-text-sm ui-border-b ui-border-gray-300 ui-font-semibold ui-sticky ui-z-5',
                  {
                    'left-[322px] ui-px-6': language === 'en',
                    'left-[313px] ui-px-2': language === 'id',
                  }
                )}
              >
                {t('column.regency')}
              </Th>
              <Th
                colSpan={dateArray.length}
                className="ui-px-2 ui-py-1 ui-bg-gray-100 ui-text-center ui-text-base  ui-border-b ui-border-gray-300 ui-font-bold"
              >
                {monthName}
              </Th>
              <Th
                rowSpan={2}
                className={cx(
                  'ui-px-2 ui-py-1 ui-bg-gray-100 ui-text-center ui-text-sm ui-border-b ui-border-l ui-border-gray-300 ui-font-semibold ui-sticky ui-z-5',
                  {
                    'right-[297px]': language === 'en',
                    'right-[283px]': language === 'id',
                  }
                )}
              >
                {t('column.active')}
              </Th>
              <Th
                rowSpan={2}
                className={cx(
                  'ui-px-2 ui-py-1 ui-bg-gray-100 ui-text-center ui-text-sm ui-border-b ui-border-gray-300 ui-font-semibold ui-sticky ui-z-5',
                  {
                    'right-[229px]': language === 'en',
                    'right-[221px]': language === 'id',
                  }
                )}
              >
                {t('column.inactive')}
              </Th>
              <Th
                rowSpan={2}
                className={cx(
                  'ui-px-2 ui-py-1 ui-bg-gray-100 ui-text-center ui-text-sm ui-border-b ui-border-gray-300 ui-font-semibold ui-sticky ui-z-5',
                  {
                    'right-[165px]': language === 'en',
                    'right-[157px]': language === 'id',
                  }
                )}
              >
                {t('column.manual_scale')}
              </Th>
              <Th
                rowSpan={2}
                className={cx(
                  'ui-px-2 ui-py-1 ui-bg-gray-100 ui-text-center ui-text-sm ui-border-b ui-border-gray-300 ui-font-semibold ui-sticky ui-z-5',
                  {
                    'right-[82px]': language === 'en',
                    'right-[78px]': language === 'id',
                  }
                )}
              >
                {t('column.frequency.total')}
              </Th>
              <Th
                rowSpan={2}
                className="ui-px-2 ui-py-1 right-0 ui-bg-gray-100 ui-text-center ui-text-sm ui-border-gray-300 ui-font-semibold ui-sticky ui-right-0 ui-z-5"
              >
                {t('column.frequency.average')}
              </Th>
            </Tr>
            <Tr>
              {dateArray.map((date) => {
                const day = date.getDate().toString().padStart(2, '0');
                const dateKey = date.toISOString().split('T')[0];
                return (
                  <Th
                    key={`date-${dateKey}`}
                    className="ui-px-2.5 ui-py-1 ui-bg-gray-100 ui-text-center ui-text-sm ui-border-b ui-border-gray-300 ui-font-semibold"
                  >
                    {day}
                  </Th>
                );
              })}
            </Tr>
          </Thead>

          <Tbody>
            {monitoringData.map((row, index) => {
              return (
                <Tr key={`row-${row.entitas}-${index}`}>
                  <Td className="ui-px-0 ui-py-2 ui-bg-white ui-align-top ui-text-center ui-leading-tight ui-text-sm i-border-t ui-border-gray-300 ui-sticky ui-left-0 ui-z-10">
                    <div className="font-medium">{index + 1}</div>
                  </Td>

                  <Td className="ui-px-2 ui-py-2 left-[51.5px] ui-bg-white ui-align-top ui-text-left ui-leading-tight ui-text-sm i-border-t ui-border-gray-300 ui-sticky ui-z-10">
                    <div className="font-medium">{row.entitas}</div>
                  </Td>
                  <Td
                    className={cx(
                      'ui-px-2 ui-bg-white ui-align-top ui-text-left ui-leading-tight ui-text-sm i-border-t ui-border-gray-300 ui-sticky ui-z-10',
                      {
                        'left-[202px]': language === 'en',
                        'left-[197px]': language === 'id',
                      }
                    )}
                  >
                    <div className="font-medium">{row.provinceName}</div>
                  </Td>
                  <Td
                    className={cx(
                      'ui-px-2 ui-py-2 ui-bg-white ui-align-top ui-text-left ui-leading-tight ui-text-sm i-border-t ui-border-gray-300 ui-sticky ui-z-10',
                      {
                        'left-[322px]': language === 'en',
                        'left-[313px]': language === 'id',
                      }
                    )}
                  >
                    <div className="font-medium">{row.regencyName}</div>
                  </Td>

                  {row?.days?.map((day, i) => (
                    <Td
                      key={`day-${row.id}-${i}`}
                      className="ui-px-0 ui-py-2 ui-bg-white ui-align-top ui-text-center ui-leading-tight ui-text-sm i-border-t ui-border-gray-300 border-r border-gray-200 last:border-r-0"
                      style={
                        day.isManualScale > 0
                          ? { backgroundColor: '#FFD700' }
                          : {}
                      }
                    >
                      {day.value > 0 ? day.value : 0}
                    </Td>
                  ))}

                  <Td
                    className={cx(
                      'ui-px-0 ui-py-2 ui-bg-white ui-align-top ui-text-center ui-leading-tight ui-text-sm i-border-t ui-border-l ui-border-gray-300 ui-sticky ui-z-10',
                      {
                        'right-[297px]': language === 'en',
                        'right-[283px]': language === 'id',
                      }
                    )}
                  >
                    <div className="font-medium">{row.jumlahHariAktif}</div>
                  </Td>

                  <Td
                    className={cx(
                      'ui-px-0 ui-py-2 ui-bg-white ui-align-top ui-text-center ui-leading-tight ui-text-sm i-border-t ui-border-gray-300 ui-sticky ui-z-10',
                      {
                        'right-[229px]': language === 'en',
                        'right-[221px]': language === 'id',
                      }
                    )}
                  >
                    <div className="font-medium">
                      {row.jumlahHariTidakAktif}
                    </div>
                  </Td>

                  <Td
                    className={cx(
                      'ui-px-0 ui-py-2 ui-bg-white ui-align-top ui-text-center ui-leading-tight ui-text-sm i-border-t ui-border-gray-300 ui-sticky ui-z-10',
                      {
                        'right-[165px]': language === 'en',
                        'right-[157px]': language === 'id',
                      }
                    )}
                  >
                    <div className="font-medium">
                      {row.jumlahHariManualScale}
                    </div>
                  </Td>

                  <Td
                    className={cx(
                      'ui-px-0 ui-py-2 ui-bg-white ui-align-top ui-text-center ui-leading-tight ui-text-sm i-border-t ui-border-gray-300 ui-sticky ui-z-10',
                      {
                        'right-[82px]': language === 'en',
                        'right-[78px]': language === 'id',
                      }
                    )}
                  >
                    <div className="font-medium">{row.jumlahFrekuensi}</div>
                  </Td>
                  <Td className="ui-px-0 right-0 ui-py-2 ui-bg-white ui-align-top ui-text-center ui-leading-tight ui-text-sm i-border-t ui-border-gray-300 ui-sticky ui-right-0 ui-z-10">
                    <div className="font-medium">{row.rataRataFrekuensi}</div>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
          <TableEmpty className="ui-h-32">
            <EmptyState title={t('common:message.empty.title')} />
          </TableEmpty>
        </Table>
      </div>
      <PaginationContainer>
        <PaginationSelectLimit
          size={paginate}
          onChange={handleChangePaginate}
          perPagesOptions={listPagination}
        />
        <PaginationInfo size={paginate} currentPage={page} total={totalItem} />
        <Pagination
          totalPages={totalPage ?? 0}
          currentPage={page}
          onPageChange={handleChangePage}
        />
      </PaginationContainer>
    </div>
  );
}

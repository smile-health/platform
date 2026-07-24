import {
  getWasteTrackingCharacteristics,
  getWasteTrackingWasteSource,
} from '@/services/tracking';
import { getTransaction } from '@/services/transaction';
import { getUserRoleString } from '@/utils/getUserRole';
import { UseFilter, useFilter } from '@repo/ui/components/filter';
import { getReactSelectValue } from '@repo/ui/utils/react-select';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ColumnSort } from '@tanstack/react-table';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createFilterTrackingGroupSchema } from '../schema/TrackingSchemaList';

export const useWasteTrackingTable = (
  isHealthBureaucrat: boolean | undefined = undefined
) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'tracking']);
  const role = getUserRoleString();

  const [pagination, setPagination] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      paginate: parseAsInteger.withDefault(10),
      pageTrackingPage: parseAsInteger.withDefault(1),
      paginateTrackingPage: parseAsInteger.withDefault(10),
      pageWasteSource: parseAsInteger.withDefault(1),
      paginateWasteSource: parseAsInteger.withDefault(10),
      search: parseAsString.withDefault(''),
    },
    { history: 'push' }
  );

  const [sortingWasteSource, setSortingWasteSource] = useState<ColumnSort[]>(
    []
  );

  const [sortingCharacteristics, setSortingCharacteristics] = useState<
    ColumnSort[]
  >([]);
  const [sortingBag, setSortingBag] = useState<ColumnSort[]>([]);

  const filterSchema = useMemo<UseFilter>(
    () =>
      createFilterTrackingGroupSchema({
        t,
        userRole: role,
      }),
    [t, role]
  );

  const filter = useFilter(filterSchema);

  const { dateRange, healthcareId, provinceId, cityId } = filter.query;
  // Waste Source table
  const {
    data: trackingWasteSourceDataSource,
    isFetching: isLoadingTrackingWasteSource,
    refetch: refetchTrackingWasteSource,
  } = useQuery({
    queryKey: [
      'tracking-waste-source',
      { dateRange, healthcareId, provinceId, cityId },
      language,
      sortingWasteSource,
      pagination.pageWasteSource,
      pagination.paginateWasteSource,
    ],
    queryFn: () => {
      const params = {
        page: pagination.pageWasteSource || 1,
        limit: pagination.paginateWasteSource || 10,
        startDate: dateRange?.start || '-',
        endDate: dateRange?.end || '-',
        healthcareId: getReactSelectValue(healthcareId),
        provinceId: getReactSelectValue(provinceId),
        cityId: getReactSelectValue(cityId),
        ...(sortingWasteSource.length !== 0 && {
          sort_by: sortingWasteSource[0].id,
          sort_type: sortingWasteSource[0].desc ? 'desc' : 'asc',
        }),
      };
      return getWasteTrackingWasteSource(params);
    },
    placeholderData: keepPreviousData,
    enabled: isHealthBureaucrat !== undefined && isHealthBureaucrat === false,
  });

  // Waste Characteristics table
  const {
    data: trackingCharacteristicsDataSource,
    isFetching: isLoadingTrackingCharacteristics,
    refetch: refetchTrackingCharacteristics,
  } = useQuery({
    queryKey: [
      'tracking-characteristics',
      { dateRange, healthcareId, provinceId, cityId },
      pagination.page,
      pagination.paginate,
      language,
      sortingCharacteristics,
    ],
    queryFn: () => {
      const params = {
        page: pagination.page || 1,
        limit: pagination.paginate || 10,
        startDate: dateRange?.start || '-',
        endDate: dateRange?.end || '-',
        healthcareId: getReactSelectValue(healthcareId),
        provinceId: getReactSelectValue(provinceId),
        cityId: getReactSelectValue(cityId),
        includeWasteStatus: 1,
        ...(sortingCharacteristics.length !== 0 && {
          sort_by: sortingCharacteristics[0].id,
          sort_type: sortingCharacteristics[0].desc ? 'desc' : 'asc',
        }),
      };
      return getWasteTrackingCharacteristics(params);
    },
    placeholderData: keepPreviousData,
  });

  // Waste Bag table
  const {
    data: trackingBagDataSource,
    isFetching: isLoadingTrackingBag,
    refetch: refetchTrackingBag,
  } = useQuery({
    queryKey: [
      'tracking-bag',
      pagination.search,
      { dateRange, healthcareId, provinceId, cityId },
      pagination.pageTrackingPage,
      pagination.paginateTrackingPage,
      language,
      sortingBag,
    ],
    queryFn: () => {
      const params = {
        page: pagination.pageTrackingPage || 1,
        limit: pagination.paginateTrackingPage || 10,
        ...(pagination.search && {
          search: pagination.search,
        }),
        startDate: dateRange?.start || '-',
        endDate: dateRange?.end || '-',
        healthcareId: getReactSelectValue(healthcareId),
        provinceId: getReactSelectValue(provinceId),
        cityId: getReactSelectValue(cityId),
        ...(sortingBag.length !== 0 && {
          sort_by: sortingBag[0].id,
          sort_type: sortingBag[0].desc ? 'desc' : 'asc',
        }),
      };
      return getTransaction(params);
    },
    placeholderData: keepPreviousData,
    enabled: isHealthBureaucrat !== undefined && isHealthBureaucrat === false,
  });

  // Pagination handlers

  const handleChangePageWasteSource = (pageWasteSource: number) =>
    setPagination({ pageWasteSource });
  const handleChangePaginateWasteSource = (paginateWasteSource: number) =>
    setPagination({ pageWasteSource: 1, paginateWasteSource });

  const handleChangePageCharacteristics = (page: number) =>
    setPagination({ page });
  const handleChangePaginateCharacteristics = (paginate: number) =>
    setPagination({ page: 1, paginate });

  const handleChangePageBag = (pageTrackingPage: number) =>
    setPagination({ pageTrackingPage });
  const handleChangePaginateBag = (paginateTrackingPage: number) =>
    setPagination({ pageTrackingPage: 1, paginateTrackingPage });

  const renderFilterCharacteristics = () =>
    (filter.renderField() || []).filter(
      (f) => React.isValidElement(f) && f.key !== 'search'
    );

  const renderFilterBag = () =>
    (filter.renderField() || []).filter(
      (f) => React.isValidElement(f) && f.key === 'search'
    );

  const handleSearchFilter = () => {
    const values = filter.getValues();
    setPagination({
      search: values.search || '',
      pageTrackingPage: 1,
    });
  };

  return {
    filter,
    renderFilterCharacteristics,
    renderFilterBag,
    trackingCharacteristicsDataSource,
    isLoadingTrackingCharacteristics,
    trackingBagDataSource,
    trackingWasteSourceDataSource,
    isLoadingTrackingBag,
    isLoadingTrackingWasteSource,
    sortingCharacteristics,
    sortingWasteSource,
    setSortingCharacteristics,
    setSortingWasteSource,
    sortingBag,
    setSortingBag,
    paginationWasteSource: {
      pageWasteSource: pagination.pageWasteSource,
      paginateWasteSource: pagination.paginateWasteSource,
    },
    handleChangePageWasteSource,
    handleChangePaginateWasteSource,
    paginationTrackingCharacteristics: {
      page: pagination.page,
      paginate: pagination.paginate,
    },
    handleChangePageCharacteristics,
    handleChangePaginateCharacteristics,
    paginationTrackingBag: {
      pageTrackingPage: pagination.pageTrackingPage,
      paginateTrackingPage: pagination.paginateTrackingPage,
    },
    handleChangePageBag,
    handleChangePaginateBag,
    // refetch
    refetchTrackingCharacteristics,
    refetchTrackingWasteSource,
    refetchTrackingBag,
    setPagination,
    handleSearchFilter,
  };
};

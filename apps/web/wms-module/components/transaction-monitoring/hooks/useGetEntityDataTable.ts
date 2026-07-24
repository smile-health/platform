import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Values } from 'nuqs';
import { useTranslation } from 'react-i18next';

import { handleFilter } from '../utils/helper';
import {
  tableEntityColumns,
  tableEntityCompleteColumns,
  tableEntityGroupColumns,
  TransactionChartType,
} from '../constants/transaction-monitoring.constant';
import {
  getChartEntity,
  getChartEntityWasteGroup,
  getChartEntityComplete,
} from '@/services/transaction-monitoring';
import useTransactionMonitoring from './useTransactionMonitoring';

export default function useGetEntityDataTable<T extends TransactionChartType>(
  filter: Values<Record<string, any>>,
  tab: T,
  sort?: 'ASC' | 'DESC'
) {
  const {
    t,
    i18n: { language },
  } = useTranslation('transactionMonitoring');

  const [pagination, setPagination] = useState({
    page: 1,
    paginate: 10,
  });

  const { page, paginate } = pagination;

  const finalFilter = handleFilter({ orderBy: sort, ...filter });
  const params = { ...finalFilter, page, limit: paginate };

  const { data: entityData, isFetching: isEntityFetching } = useQuery({
    queryKey: ['transaction-by-entity', params, tab, sort, language],
    queryFn: () => getChartEntity(params),
    enabled: tab === TransactionChartType.Entity,
  });

  const { data: entityGroupData, isFetching: isEntityGroupFetching } = useQuery(
    {
      queryKey: ['transaction-by-entity-group', params, tab, sort, language],
      queryFn: () => getChartEntityWasteGroup(params),
      enabled: tab === TransactionChartType.Entity_Group,
    }
  );

  const { data: entityCompleteData, isFetching: isEntityCompleteFetching } =
    useQuery({
      queryKey: ['transaction-by-entity-complete', params, tab, sort, language],
      queryFn: () => getChartEntityComplete(params),
      enabled: tab === TransactionChartType.Entity_Complete,
    });

  const handleChangePage = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleChangePaginate = (paginate: number) => {
    setPagination((prev) => ({ ...prev, paginate }));
    handleChangePage(1);
  };

  const getWasteBagData = () => {
    switch (tab) {
      case TransactionChartType.Entity:
        return entityData;

      case TransactionChartType.Entity_Complete:
        return entityCompleteData;

      case TransactionChartType.Entity_Group:
        return entityGroupData;

      default:
        break;
    }
  };

  const { handleInformationType } = useTransactionMonitoring();
  const getWasteBagColumns = () => {
    switch (tab) {
      case TransactionChartType.Entity:
        return tableEntityColumns(
          t,
          page,
          paginate,
          filter?.isBags,
          handleInformationType
        );

      case TransactionChartType.Entity_Complete:
        return tableEntityCompleteColumns(
          t,
          page,
          paginate,
          filter?.isBags,
          handleInformationType
        );

      case TransactionChartType.Entity_Group:
        return tableEntityGroupColumns(
          t,
          page,
          paginate,
          filter?.isBags,
          handleInformationType
        );

      default:
        return [];
    }
  };

  return {
    dataSource: getWasteBagData(),
    columns: getWasteBagColumns(),
    isLoading:
      isEntityCompleteFetching || isEntityFetching || isEntityGroupFetching,
    page,
    paginate,
    handleChangePage,
    handleChangePaginate,
  };
}

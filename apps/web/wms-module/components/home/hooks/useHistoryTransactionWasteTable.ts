import { getHistoryTransactionWaste } from '@/services/homepage';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { parseAsInteger, useQueryStates } from 'nuqs';

type HistoryTransactionwasteParams = {
  groupId: number;
  treatmentType?: string;
};

export const useHistoryTransactionWasteTable = ({
  groupId,
  treatmentType,
}: HistoryTransactionwasteParams) => {
  const [pagination, setPagination] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      paginate: parseAsInteger.withDefault(10),
    },
    {
      history: 'push',
    }
  );

  const {
    data: historyTransactionWaste,
    isFetching: isHistoryTransactionWasteFetching,
    refetch: refetchHistoryTransaction,
  } = useQuery({
    queryKey: ['historyTransactionWaste', pagination],
    queryFn: () => {
      return getHistoryTransactionWaste(groupId, {
        page: pagination.page || 1,
        limit: pagination.paginate || 10,
        treatmentType,
      });
    },
    placeholderData: keepPreviousData,
    enabled: !!groupId,
  });

  const handleChangePage = (page: number) => setPagination({ page });

  const handleChangePaginate = (paginate: number) => {
    setPagination({ page: 1, paginate });
  };

  return {
    handleChangePage,
    handleChangePaginate,
    refetchHistoryTransaction,
    setPagination,
    historyTransactionWaste,
    isHistoryTransactionWasteFetching,
  };
};

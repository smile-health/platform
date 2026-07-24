import { UseFilter, useFilter } from '@repo/ui/components/filter';
import { parseAsInteger, useQueryStates } from 'nuqs';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ColumnSort } from '@tanstack/react-table';

import { getWasteHierarchy } from '@/services/waste-hierarchy';
import { getReactSelectValue } from '@repo/ui/utils/react-select';
import { createFilterWasteTypeSchema } from '../schema/WasteHierarchySchemaList';

const paramsFilter = { page: 1, paginate: 50 };

type UseWasteHierarchyTableProps = {
  level: number;
  tab: string;
};

export const useWasteHierarchyTable = ({
  level,
  tab,
}: UseWasteHierarchyTableProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'wasteHierarchy']);

  const [pagination, setPagination] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      paginate: parseAsInteger.withDefault(10),
    },
    {
      history: 'push',
    }
  );
  const [sorting, setSorting] = useState<ColumnSort[]>([]);

  useEffect(() => {
    setPagination({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  const filterSchema = useMemo<UseFilter>(
    () => createFilterWasteTypeSchema({ t, tab }),
    [t, tab]
  );

  const filter = useFilter(filterSchema);

  useEffect(() => {
    if (tab === 'waste_characteristic') {
      const currentIsActive = filter.query.isActive;
      if (!currentIsActive) {
        const defaultValue = {
          value: 1,
          label: t('wasteHierarchy:list.column.is_active.1'),
        };
        filter.setValue('isActive', defaultValue);
        // Also trigger the filter to update URL
        setTimeout(() => {
          filter.handleSubmit();
        }, 100);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const {
    data: wasteHierarchyDataSource,
    isFetching: isWasteHierarchyFetchingData,
    refetch: refetchWasteHierarchy,
  } = useQuery({
    queryKey: [
      'wasteHierarchy',
      filter.query,
      pagination,
      language,
      sorting,
      level,
    ],
    queryFn: () => {
      const { search, isActive, wasteGroupId, wasteTypeId } = filter.query;

      const params = {
        page: pagination.page || 1,
        limit: pagination.paginate || 10,
        search: search,
        ...(tab === 'waste_characteristic' && {
          isActive: getReactSelectValue(isActive) ?? 1, // Default to 1 if null/undefined
          wasteGroupId: getReactSelectValue(wasteGroupId),
          wasteTypeId: getReactSelectValue(wasteTypeId),
        }),
        ...(sorting.length !== 0 && {
          sort_by: sorting?.[0]?.id,
          sort_type: sorting?.[0]?.desc ? 'desc' : 'asc',
        }),
        level: level,
      };
      return getWasteHierarchy(params);
    },
    placeholderData: keepPreviousData,
  });

  const handleChangePage = (page: number) => setPagination({ page });

  const handleChangePaginate = (paginate: number) => {
    setPagination({ page: 1, paginate });
  };

  return {
    filter,
    handleChangePage,
    handleChangePaginate,
    setPagination,
    pagination,
    sorting,
    setSorting,
    paramsFilter,
    wasteHierarchyDataSource,
    isLoading: isWasteHierarchyFetchingData,
    refetchWasteHierarchy,
  };
};

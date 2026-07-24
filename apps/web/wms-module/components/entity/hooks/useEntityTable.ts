import { UseFilter, useFilter } from '@repo/ui/components/filter';
import { parseAsInteger, useQueryStates } from 'nuqs';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ColumnSort } from '@tanstack/react-table';

import { getEntityWmsList } from '@/services/entity';
import { getReactSelectValue } from '@repo/ui/utils/react-select';
import { createFilterSchema } from '../../entity/schema/EntitySchemaList';

const paramsFilter = { page: 1, paginate: 50 };

export const useEntityTable = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'entityWMS']);

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

  const filterSchema = useMemo<UseFilter>(
    () =>
      createFilterSchema({
        t,
      }),
    [t]
  );
  const filter = useFilter(filterSchema);

  const { data: entityDataSource, isFetching: isEntityFetchingData } = useQuery(
    {
      queryKey: ['entityWMS-list', filter.query, pagination, language, sorting],
      queryFn: () => {
        const { search, provinceId, regencyId, entityTypeId, isActive } =
          filter.query;

        const params = {
          page: pagination.page || 1,
          limit: pagination.paginate || 10,
          search,
          entityTypeId: getReactSelectValue(entityTypeId),
          provinceId: getReactSelectValue(provinceId),
          regencyId: getReactSelectValue(regencyId),
          isActive: getReactSelectValue(isActive),
        };
        return getEntityWmsList(params);
      },
      placeholderData: keepPreviousData,
    }
  );

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
    entityDataSource,
    isLoading: isEntityFetchingData,
  };
};

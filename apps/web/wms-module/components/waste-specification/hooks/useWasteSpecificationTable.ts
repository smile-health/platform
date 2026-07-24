import { UseFilter, useFilter } from '@repo/ui/components/filter';
import { parseAsInteger, useQueryStates } from 'nuqs';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ColumnSort } from '@tanstack/react-table';

import { getWasteSpecification } from '@/services/waste-specification';
import { getReactSelectValue } from '@repo/ui/utils/react-select';
import { createFilterWasteSpecificationSchema } from '../schema/WasteSpecificationSchemaList';

const paramsFilter = { page: 1, paginate: 50 };

export const useWasteSpecificationTable = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'wasteSpecification']);

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
    () => createFilterWasteSpecificationSchema({ t }),
    [t]
  );
  const filter = useFilter(filterSchema);

  const {
    data: wasteSpecificationDataSource,
    isFetching: isWasteSpecificationFetchingData,
  } = useQuery({
    queryKey: [
      'wasteSpecification',
      filter.query,
      pagination,
      language,
      sorting,
    ],
    queryFn: () => {
      const { search, waste_type_id, waste_group_id, waste_characteristic_id } =
        filter.query;

      const params = {
        page: pagination.page || 1,
        limit: pagination.paginate || 10,
        ...(waste_type_id && {
          wasteTypeId: getReactSelectValue(waste_type_id),
        }),
        ...(waste_group_id && {
          wasteGroupId: getReactSelectValue(waste_group_id),
        }),
        ...(waste_characteristic_id && {
          wasteCharacteristicsId: getReactSelectValue(waste_characteristic_id),
        }),
        search: search,
        ...(sorting.length !== 0 && {
          sortBy: sorting?.[0]?.id,
          sortOrder: sorting?.[0]?.desc ? 'DESC' : 'ASC',
        }),
      };
      return getWasteSpecification(params);
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
    wasteSpecificationDataSource,
    isLoading: isWasteSpecificationFetchingData,
  };
};

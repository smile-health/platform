import { getPartnershipOperator } from '@/services/partnership-operator';
import { getPartnershipVehicle } from '@/services/partnership-vehicle';
import { toast } from '@repo/ui/components/toast';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { useParams, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getClassificationPartnership,
  getPartnershipDetail,
} from '../../../services/partnership';
import type { ErrorResponse } from '../../../types/common';
import type {
  GetClassificationPartnershipResponse,
  GetPartnershipDetailResponse,
} from '../../../types/partnership';
import { parseAsInteger, useQueryStates } from 'nuqs';

const VEHICLE_PAGE_SIZE = 10;

export const usePartnershipDetail = () => {
  const {
    i18n: { language },
  } = useTranslation();
  const params = useParams();
  const pathname = usePathname();

  const id = params?.id;
  const isNotEdit = !pathname.includes('/edit');

  const [{ page, paginate }, setPagination] = useQueryStates(
      {
        page: parseAsInteger.withDefault(1),
        paginate: parseAsInteger.withDefault(10),
      },
      {
        history: 'push',
      }
    );

  // Independent server-side pagination per section
  const [classificationPage, setClassificationPage] = useState(1);
  const [classificationPaginate, setClassificationPaginate] = useState(10);
  const [operatorPage, setOperatorPage] = useState(1);
  const [operatorPaginate, setOperatorPaginate] = useState(10);

  // Partnership detail
  const {
    data: partnershipDetail,
    isError: isErrorPartnership,
    error: errorPartnership,
    isFetching: isFetchingPartnership,
  } = useQuery<GetPartnershipDetailResponse, AxiosError<ErrorResponse>>({
    queryKey: ['partnership-detail', id, language],
    queryFn: () => getPartnershipDetail(Number(id)),
    enabled: Boolean(id),
    placeholderData: keepPreviousData,
  });

  const partnershipConsumerId = partnershipDetail?.data?.consumerId;
  const providerId = partnershipDetail?.data?.providerId;

  const {
    data: classificationPartnership,
    isFetching: isFetchingClassificationPartnership,
  } = useQuery<GetClassificationPartnershipResponse, AxiosError<ErrorResponse>>(
    {
      queryKey: [
        'classification-partnership',
        id,
        language,
        classificationPage,
        classificationPaginate,
      ],
      queryFn: () => {
        const params = {
          page: classificationPage,
          limit: classificationPaginate,
          providerId: providerId,
        };
        return getClassificationPartnership(params);
      },
      enabled: Boolean(providerId),
      placeholderData: keepPreviousData,
    }
  );

  // Partnership Vehicle
  const {
    data: partnershipVehicleData,
    isError: isErrorVehicle,
    error: errorVehicle,
    isFetching: isFetchingVehicle,
  } = useQuery({
    queryKey: ['getVehicle', page,paginate],
    queryFn: () =>
      getPartnershipVehicle({
        page: page,
        limit: paginate,
        providerId: providerId
      }),
    enabled: Boolean(partnershipConsumerId && isNotEdit),
    placeholderData: keepPreviousData,
  });

  // Partnership Operator
  const {
    data: partnershipOperatorData,
    isError: isErrorOperatorList,
    error: errorOperatorList,
    isFetching: isFetchingOperatorList,
  } = useQuery({
    queryKey: [
      'getPartnershipOperator',
      partnershipConsumerId,
      language,
      operatorPage,
      operatorPaginate,
    ],
    queryFn: () =>
      getPartnershipOperator({
        search: String(partnershipConsumerId),
        page: operatorPage,
        limit: operatorPaginate,
        providerId: providerId,
      }),
    enabled: Boolean(partnershipConsumerId && isNotEdit),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (isErrorPartnership) {
      toast.danger({ description: errorPartnership?.message });
    }
    if (isErrorVehicle) {
      toast.danger({ description: errorVehicle?.message });
    }
    if (isErrorOperatorList) {
      toast.danger({ description: errorOperatorList?.message });
    }
  }, [
    isErrorPartnership,
    errorPartnership?.message,
    isErrorVehicle,
    errorVehicle?.message,
    isErrorOperatorList,
    errorOperatorList?.message,
  ]);

  const handleChangePage = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleChangePaginate = (paginate: number) => {
    setPagination((prev) => ({ ...prev, paginate }));
    handleChangePage(1);
  };

  const handleChangeClassificationPage = (page: number) => {
    setClassificationPage(page);
  };

  const handleChangeClassificationPaginate = (paginate: number) => {
    setClassificationPaginate(paginate);
    setClassificationPage(1);
  };

  const handleChangeOperatorPage = (page: number) => {
    setOperatorPage(page);
  };

  const handleChangeOperatorPaginate = (paginate: number) => {
    setOperatorPaginate(paginate);
    setOperatorPage(1);
  };

  return {
    partnershipDetail: partnershipDetail?.data,
    partnershipVehicleData: partnershipVehicleData,
    isLoading:
      isFetchingPartnership ||
      isFetchingVehicle ||
      isFetchingOperatorList ||
      isFetchingClassificationPartnership,
    isError: isErrorPartnership || isErrorVehicle,
    error: errorPartnership || errorVehicle,
    page,
    paginate,
    handleChangePage,
    handleChangePaginate,
    classification: {
      data: classificationPartnership,
      isLoading: isFetchingPartnership || isFetchingClassificationPartnership,
      page: classificationPage,
      paginate: classificationPaginate,
      handleChangePage: handleChangeClassificationPage,
      handleChangePaginate: handleChangeClassificationPaginate,
    },
    operator: {
      data: partnershipOperatorData,
      isLoading: isFetchingPartnership || isFetchingOperatorList,
      page: operatorPage,
      paginate: operatorPaginate,
      handleChangePage: handleChangeOperatorPage,
      handleChangePaginate: handleChangeOperatorPaginate,
    },
  };
};

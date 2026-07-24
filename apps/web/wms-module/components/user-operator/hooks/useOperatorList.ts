import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import type { AxiosError } from 'axios';
import type { ErrorResponse } from '../../../types/common';
import { toast } from '@repo/ui/components/toast';
import { loadOperator } from '@/services/partnership-operator';
import { OptionType } from '@repo/ui/components/react-select';

export const useOperatorList = () => {
  const {
    i18n: { language },
  } = useTranslation();

  const { data, isError, error, isFetching } = useQuery<
    { options: OptionType[] },
    AxiosError<ErrorResponse>
  >({
    queryKey: ['operator-list', language],
    queryFn: loadOperator,
    placeholderData: {
      options: [],
    },
  });

  useEffect(() => {
    if (isError) {
      toast.danger({ description: error?.message });
    }
  }, [isError, error?.message]);

  return {
    options: data?.options ?? [],
    isLoading: isFetching,
    isError,
    error,
  };
};

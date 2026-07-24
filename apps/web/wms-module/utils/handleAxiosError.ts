import { ErrorResponse } from '@/types/common';
import { toast } from '@repo/ui/components/toast';
import { AxiosError } from 'axios';

export const handleAxiosError = (error: unknown) => {
  if (error instanceof AxiosError) {
    const response = error.response?.data as ErrorResponse;

    if (typeof response?.data === 'string') {
      toast.danger({ description: response.data });
    }

    if (response?.message) {
      toast.danger({ description: response.message });
    }

    if (
      response?.data &&
      typeof response.data === 'object' &&
      !Array.isArray(response.data)
    ) {
      for (const key of Object.keys(response.data)) {
        const item = response.data[key];
        if (item?.message) {
          toast.danger({ description: item.message });
        }
      }
    }
    if (response?.data && Array.isArray(response.data)) {
      for (const item of response.data) {
        if (item?.message) {
          toast.danger({ description: item.message });
        }
      }
    }
  } else {
    toast.danger({ description: 'An unknown error occurred.' });
  }
};

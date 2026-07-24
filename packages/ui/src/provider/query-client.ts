import { ErrorResponse } from '#types/common'
import { AxiosError } from 'axios'
import {
  QueryCache,
  QueryClient,
} from '@tanstack/react-query'
import { toast } from '#components/toast'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Disable retries for all queries
      refetchOnWindowFocus: false,
    },
  },
  queryCache: new QueryCache({
    onError: (error: AxiosError) => {
      if (error?.response?.status === 401) {
        return
      }
      toast.danger({
        id: 'error-message',
        description:
          (error?.response?.data as ErrorResponse)?.message || error?.message,
      })
    },
  }),
})